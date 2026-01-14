import { io, Socket } from 'socket.io-client';
import * as mediasoupClient from 'mediasoup-client';
import { Device, types } from 'mediasoup-client';

type Transport = types.Transport;
type Producer = types.Producer;
type Consumer = types.Consumer;

interface MediasoupConfig {
  serverUrl: string;
}

export class MediasoupService {
  private socket: Socket | null = null;
  private device: Device | null = null;
  private sendTransport: Transport | null = null;
  private recvTransport: Transport | null = null;
  private audioProducer: Producer | null = null;
  private videoProducer: Producer | null = null;
  private consumers: Map<string, Consumer> = new Map();

  private localStream: MediaStream | null = null;
  private remoteStreams: Map<string, MediaStream> = new Map();

  private config: MediasoupConfig;
  private roomId: string | null = null;

  // 🔥 新增：消费队列，防止并发调用导致 SDP 冲突
  private consumeQueue: Promise<void> = Promise.resolve();
  private isConsuming: Set<string> = new Set(); // 跟踪正在消费的 producer

  // 回调函数
  private onRemoteStreamCallback: ((userId: string, stream: MediaStream) => void) | null = null;
  private onRemoteStreamRemovedCallback: ((userId: string) => void) | null = null;
  private onConnectionStateChangeCallback: ((state: string) => void) | null = null;

  constructor(config: MediasoupConfig) {
    this.config = config;
  }

  /**
   * 初始化并加入房间
   */
  async joinRoom(roomId: string, _userId: string): Promise<void> {
    this.roomId = roomId;

    // 连接Socket.IO服务器
    this.socket = io(this.config.serverUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // 设置Socket事件监听
    this.setupSocketListeners();

    // 等待连接成功
    await new Promise<void>((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not initialized'));
        return;
      }

      this.socket.on('connect', () => {
        console.log('✅ Connected to Mediasoup server');
        resolve();
      });

      this.socket.on('connect_error', (error: Error) => {
        console.error('❌ Connection error:', error);
        reject(error);
      });
    });

    // 加入房间
    await this.socketRequest('join-room', { roomId, userId: _userId });

    // 初始化Mediasoup设备
    await this.initDevice();

    console.log(`✅ Joined room ${roomId}`);
  }

  /**
   * 初始化Mediasoup设备
   */
  private async initDevice(): Promise<void> {
    try {
      // 获取RTP能力
      const response = await fetch(`${this.config.serverUrl}/rtp-capabilities`);
      const { rtpCapabilities } = await response.json();

      // 创建设备
      this.device = new mediasoupClient.Device();
      await this.device.load({ routerRtpCapabilities: rtpCapabilities });

      console.log('✅ Mediasoup device initialized');
    } catch (error) {
      console.error('Failed to initialize device:', error);
      throw error;
    }
  }

  /**
   * 开始发送本地媒体流
   */
  async startProducing(audioEnabled: boolean = true, videoEnabled: boolean = true): Promise<MediaStream> {
    if (!this.device || !this.socket || !this.roomId) {
      throw new Error('Not connected to room');
    }

    // 获取本地媒体流
    this.localStream = await navigator.mediaDevices.getUserMedia({
      audio: audioEnabled,
      video: videoEnabled ? {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 },
      } : false,
    });

    // 创建发送传输通道
    if (!this.sendTransport) {
      const transportInfo = await this.socketRequest('create-transport', {
        roomId: this.roomId,
        direction: 'send',
      });

      this.sendTransport = this.device.createSendTransport(transportInfo);
      this.setupSendTransport();
    }

    // 发送音频
    if (audioEnabled && this.localStream.getAudioTracks().length > 0) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      this.audioProducer = await this.sendTransport.produce({
        track: audioTrack,
        codecOptions: {
          opusStereo: true,
          opusDtx: true,
        },
      });

      console.log('✅ Audio producer created');
    }

    // 发送视频
    if (videoEnabled && this.localStream.getVideoTracks().length > 0) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      this.videoProducer = await this.sendTransport.produce({
        track: videoTrack,
        codecOptions: {
          videoGoogleStartBitrate: 1000,
        },
      });

      console.log('✅ Video producer created');
    }

    this.notifyStateChange('connected');
    return this.localStream;
  }

  /**
   * 开始接收远程媒体流
   */
  async startConsuming(producerId: string): Promise<void> {
    // 🔥 关键修复：检查是否已经在消费这个 producer
    if (this.isConsuming.has(producerId)) {
      console.log(`⏭️ Already consuming producer ${producerId}, skipping...`);
      return;
    }

    // 🔥 关键修复：串行化 consume 操作，防止并发导致 SDP 冲突
    this.consumeQueue = this.consumeQueue.then(async () => {
      try {
        await this.doConsume(producerId);
      } catch (error) {
        console.error(`❌ Failed to consume producer ${producerId}:`, error);
        throw error;
      }
    });

    return this.consumeQueue;
  }

  /**
   * 实际执行消费操作（内部方法）
   */
  private async doConsume(producerId: string): Promise<void> {
    if (!this.device || !this.socket || !this.roomId) {
      throw new Error('Not connected to room');
    }

    // 标记为正在消费
    this.isConsuming.add(producerId);

    console.log(`🎯 Starting to consume producer: ${producerId}`);

    try {
      // 创建接收传输通道
      if (!this.recvTransport) {
        console.log('🔧 Creating receive transport...');
        const transportInfo = await this.socketRequest('create-transport', {
          roomId: this.roomId,
          direction: 'recv',
        });

        this.recvTransport = this.device.createRecvTransport(transportInfo);
        this.setupRecvTransport();
        console.log('✅ Receive transport created');
      }

      console.log('📡 Requesting to consume producer...');
      // 消费媒体流
      const consumerInfo = await this.socketRequest('consume', {
        transportId: this.recvTransport.id,
        producerId,
        rtpCapabilities: this.device.rtpCapabilities,
      });

      console.log('🎬 Creating consumer with info:', consumerInfo);

      // 🔥 关键修复：等待一小段时间，让 transport 准备好
      await new Promise(resolve => setTimeout(resolve, 100));

      const consumer = await this.recvTransport.consume(consumerInfo);
      this.consumers.set(consumer.id, consumer);

      console.log('▶️ Resuming consumer...');
      // 恢复消费者
      await this.socketRequest('resume-consumer', { consumerId: consumer.id });

      // 使用固定的远程用户ID
      const remoteUserId = 'remote-user';
      console.log(`👤 Remote user ID: ${remoteUserId}, Kind: ${consumer.kind}`);

      let remoteStream = this.remoteStreams.get(remoteUserId);
      if (!remoteStream) {
        console.log(`🆕 Creating new remote stream for user: ${remoteUserId}`);
        remoteStream = new MediaStream();
        this.remoteStreams.set(remoteUserId, remoteStream);
      } else {
        console.log(`📦 Using existing remote stream (current tracks: ${remoteStream.getTracks().length})`);
      }

      // 添加track到流
      console.log(`➕ Adding ${consumer.kind} track to remote stream`);
      remoteStream.addTrack(consumer.track);

      console.log(`📊 Remote stream now has ${remoteStream.getTracks().length} tracks:`,
        remoteStream.getTracks().map(t => `${t.kind} (${t.id})`));

      // 触发回调
      if (this.onRemoteStreamCallback) {
        console.log(`📢 Calling remote stream callback for user: ${remoteUserId}`);
        this.onRemoteStreamCallback(remoteUserId, remoteStream);
      } else {
        console.warn('⚠️ No remote stream callback registered!');
      }

      console.log(`✅ Consumer created for producer: ${producerId} (${consumer.kind})`);
    } catch (error) {
      console.error(`❌ Error in doConsume for producer ${producerId}:`, error);
      // 从消费集合中移除，允许重试
      this.isConsuming.delete(producerId);
      throw error;
    }
  }

  /**
   * 设置发送传输通道
   */
  private setupSendTransport(): void {
    if (!this.sendTransport || !this.socket) return;

    this.sendTransport.on('connect', async ({ dtlsParameters }: any, callback: any, errback: any) => {
      try {
        await this.socketRequest('connect-transport', {
          transportId: this.sendTransport!.id,
          dtlsParameters,
        });
        callback();
      } catch (error) {
        errback(error as Error);
      }
    });

    this.sendTransport.on('produce', async ({ kind, rtpParameters }: any, callback: any, errback: any) => {
      try {
        const { id } = await this.socketRequest('produce', {
          transportId: this.sendTransport!.id,
          kind,
          rtpParameters,
        });
        callback({ id });
      } catch (error) {
        errback(error as Error);
      }
    });

    this.sendTransport.on('connectionstatechange', (state: string) => {
      console.log('Send transport state:', state);
      this.notifyStateChange(state);
    });
  }

  /**
   * 设置接收传输通道
   */
  private setupRecvTransport(): void {
    if (!this.recvTransport || !this.socket) return;

    this.recvTransport.on('connect', async ({ dtlsParameters }: any, callback: any, errback: any) => {
      try {
        console.log('🔗 Connecting recv transport...');
        await this.socketRequest('connect-transport', {
          transportId: this.recvTransport!.id,
          dtlsParameters,
        });
        console.log('✅ Recv transport connected');
        callback();
      } catch (error) {
        console.error('❌ Failed to connect recv transport:', error);
        errback(error as Error);
      }
    });

    this.recvTransport.on('connectionstatechange', (state: string) => {
      console.log('🔌 Recv transport state:', state);
    });
  }

  /**
   * 设置Socket事件监听
   */
  private setupSocketListeners(): void {
    if (!this.socket) return;

    // 新的生产者加入
    this.socket.on('new-producer', async ({ producerId, userId, kind }: any) => {
      console.log(`📺 New producer: ${producerId} from user ${userId} (${kind})`);
      try {
        await this.startConsuming(producerId);
        console.log(`✅ Successfully consuming producer ${producerId}`);
      } catch (error) {
        console.error(`❌ Failed to consume producer ${producerId}:`, error);
      }
    });

    // 生产者关闭
    this.socket.on('producer-closed', ({ producerId, userId }: any) => {
      console.log(`🔴 Producer closed: ${producerId} from user ${userId}`);

      // 找到并关闭对应的消费者
      for (const [consumerId, consumer] of this.consumers) {
        if (consumer.producerId === producerId) {
          consumer.close();
          this.consumers.delete(consumerId);
          break;
        }
      }

      // 从远程流中移除对应的track
      const remoteStream = this.remoteStreams.get(userId);
      if (remoteStream) {
        // 检查是否还有其他tracks
        if (remoteStream.getTracks().length <= 1) {
          // 如果这是最后一个track，移除整个流
          this.remoteStreams.delete(userId);
          if (this.onRemoteStreamRemovedCallback) {
            this.onRemoteStreamRemovedCallback(userId);
          }
        }
      }
    });

    // 连接断开
    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.notifyStateChange('disconnected');
    });

    // 添加错误处理
    this.socket.on('error', (error: any) => {
      console.error('❌ Socket error:', error);
    });
  }

  /**
   * 切换音频
   */
  toggleAudio(enabled: boolean): void {
    if (this.audioProducer) {
      if (enabled) {
        this.audioProducer.resume();
      } else {
        this.audioProducer.pause();
      }
    }

    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  /**
   * 切换视频
   */
  toggleVideo(enabled: boolean): void {
    if (this.videoProducer) {
      if (enabled) {
        this.videoProducer.resume();
      } else {
        this.videoProducer.pause();
      }
    }

    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  /**
   * 离开房间
   */
  async leaveRoom(): Promise<void> {
    // 关闭生产者
    if (this.audioProducer) {
      this.audioProducer.close();
      this.audioProducer = null;
    }
    if (this.videoProducer) {
      this.videoProducer.close();
      this.videoProducer = null;
    }

    // 关闭消费者
    this.consumers.forEach(consumer => consumer.close());
    this.consumers.clear();

    // 🔥 清理消费队列状态
    this.isConsuming.clear();
    this.consumeQueue = Promise.resolve();

    // 关闭传输通道
    if (this.sendTransport) {
      this.sendTransport.close();
      this.sendTransport = null;
    }
    if (this.recvTransport) {
      this.recvTransport.close();
      this.recvTransport = null;
    }

    // 停止本地流
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // 清除远程流
    this.remoteStreams.clear();

    // 断开Socket连接
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.roomId = null;

    console.log('✅ Left room');
  }

  /**
   * Socket请求包装器
   */
  private socketRequest(event: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit(event, data, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }

  /**
   * 通知状态变化
   */
  private notifyStateChange(state: string): void {
    if (this.onConnectionStateChangeCallback) {
      this.onConnectionStateChangeCallback(state);
    }
  }

  // ==================== 公共API ====================

  /**
   * 获取本地流
   */
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  /**
   * 获取远程流
   */
  getRemoteStream(userId: string): MediaStream | null {
    return this.remoteStreams.get(userId) || null;
  }

  /**
   * 获取所有远程流
   */
  getAllRemoteStreams(): Map<string, MediaStream> {
    return this.remoteStreams;
  }

  /**
   * 设置远程流回调
   */
  onRemoteStream(callback: (userId: string, stream: MediaStream) => void): void {
    this.onRemoteStreamCallback = callback;
  }

  /**
   * 设置远程流移除回调
   */
  onRemoteStreamRemoved(callback: (userId: string) => void): void {
    this.onRemoteStreamRemovedCallback = callback;
  }

  /**
   * 设置连接状态变化回调
   */
  onConnectionStateChange(callback: (state: string) => void): void {
    this.onConnectionStateChangeCallback = callback;
  }
}

// 创建单例
let mediasoupServiceInstance: MediasoupService | null = null;

export function getMediasoupService(serverUrl?: string): MediasoupService {
  if (!mediasoupServiceInstance) {
    const defaultUrl = 'http://localhost:3001';

    // 调试环境变量
    console.log('=== Mediasoup Service Configuration ===');
    console.log('import.meta:', import.meta);
    console.log('import.meta.env:', (import.meta as any).env);

    // 使用类型断言来访问Vite环境变量
    const envUrl = (import.meta as any).env?.VITE_MEDIASOUP_SERVER_URL || defaultUrl;

    console.log('Environment URL from VITE_MEDIASOUP_SERVER_URL:', envUrl);
    console.log('Provided URL parameter:', serverUrl);
    console.log('Default URL:', defaultUrl);

    const url = serverUrl || envUrl;
    console.log('Final URL to be used:', url);
    console.log('=====================================');

    mediasoupServiceInstance = new MediasoupService({ serverUrl: url });
  }
  return mediasoupServiceInstance;
}

export function resetMediasoupService(): void {
  if (mediasoupServiceInstance) {
    mediasoupServiceInstance.leaveRoom();
    mediasoupServiceInstance = null;
  }
}

