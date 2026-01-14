import mediasoup from 'mediasoup';
import { config } from './config.js';

export class MediasoupService {
  constructor() {
    this.workers = [];
    this.nextWorkerIndex = 0;
    this.routers = new Map(); // roomId -> router
    this.transports = new Map(); // transportId -> transport
    this.producers = new Map(); // producerId -> producer
    this.consumers = new Map(); // consumerId -> consumer
    this.transportToRoom = new Map(); // transportId -> roomId
    this.socketToTransports = new Map(); // socketId -> [transportIds]
    this.producerToRoom = new Map(); // producerId -> roomId (新增)
  }

  async init() {
    console.log('Initializing Mediasoup workers...');

    const { numWorkers } = config.mediasoup;

    for (let i = 0; i < numWorkers; i++) {
      const worker = await mediasoup.createWorker({
        logLevel: config.mediasoup.worker.logLevel,
        logTags: config.mediasoup.worker.logTags,
        rtcMinPort: config.mediasoup.worker.rtcMinPort,
        rtcMaxPort: config.mediasoup.worker.rtcMaxPort,
      });

      worker.on('died', () => {
        console.error('Mediasoup worker died, exiting...');
        process.exit(1);
      });

      this.workers.push(worker);
      console.log(`Worker ${i + 1}/${numWorkers} created`);
    }

    console.log(`✅ ${numWorkers} Mediasoup workers initialized`);
  }

  getNextWorker() {
    const worker = this.workers[this.nextWorkerIndex];
    this.nextWorkerIndex = (this.nextWorkerIndex + 1) % this.workers.length;
    return worker;
  }

  async getOrCreateRouter(roomId) {
    let router = this.routers.get(roomId);

    if (!router) {
      const worker = this.getNextWorker();
      router = await worker.createRouter({
        mediaCodecs: config.mediasoup.router.mediaCodecs,
      });

      this.routers.set(roomId, router);
      console.log(`Created router for room ${roomId}`);
    }

    return router;
  }

  async getRouterRtpCapabilities() {
    // Create a temporary router to get RTP capabilities
    const worker = this.getNextWorker();
    const router = await worker.createRouter({
      mediaCodecs: config.mediasoup.router.mediaCodecs,
    });

    return router.rtpCapabilities;
  }

  async createWebRtcTransport(roomId, direction, socketId) {
    const router = await this.getOrCreateRouter(roomId);

    const transport = await router.createWebRtcTransport({
      ...config.mediasoup.webRtcTransport,
    });

    this.transports.set(transport.id, transport);
    this.transportToRoom.set(transport.id, roomId);

    // Track socket to transport mapping
    if (socketId) {
      if (!this.socketToTransports.has(socketId)) {
        this.socketToTransports.set(socketId, []);
      }
      this.socketToTransports.get(socketId).push(transport.id);
    }

    console.log(`Created ${direction} transport ${transport.id} for room ${roomId}`);

    return transport;
  }

  async connectTransport(transportId, dtlsParameters) {
    const transport = this.transports.get(transportId);

    if (!transport) {
      throw new Error(`Transport ${transportId} not found`);
    }

    await transport.connect({ dtlsParameters });
    console.log(`Transport ${transportId} connected`);
  }

  async produce(transportId, kind, rtpParameters) {
    const transport = this.transports.get(transportId);

    if (!transport) {
      throw new Error(`Transport ${transportId} not found`);
    }

    const producer = await transport.produce({ kind, rtpParameters });
    this.producers.set(producer.id, producer);

    // 记录生产者所属的房间
    const roomId = this.transportToRoom.get(transportId);
    if (roomId) {
      this.producerToRoom.set(producer.id, roomId);
    }

    console.log(`Producer ${producer.id} created (${kind}) in room ${roomId}`);

    return producer;
  }

  async consume(transportId, producerId, rtpCapabilities) {
    const transport = this.transports.get(transportId);
    const roomId = this.transportToRoom.get(transportId);
    const router = this.routers.get(roomId);

    if (!transport || !router) {
      throw new Error('Transport or router not found');
    }

    // Check if we can consume
    if (!router.canConsume({ producerId, rtpCapabilities })) {
      throw new Error('Cannot consume');
    }

    const consumer = await transport.consume({
      producerId,
      rtpCapabilities,
      paused: true, // Start paused
    });

    this.consumers.set(consumer.id, consumer);

    console.log(`Consumer ${consumer.id} created for producer ${producerId}`);

    return consumer;
  }

  async resumeConsumer(consumerId) {
    const consumer = this.consumers.get(consumerId);

    if (!consumer) {
      throw new Error(`Consumer ${consumerId} not found`);
    }

    await consumer.resume();
    console.log(`Consumer ${consumerId} resumed`);
  }

  async closeProducer(producerId) {
    const producer = this.producers.get(producerId);

    if (!producer) {
      return;
    }

    producer.close();
    this.producers.delete(producerId);
    this.producerToRoom.delete(producerId); // 清理映射
    console.log(`Producer ${producerId} closed`);
  }

  getRoomIdByTransport(transportId) {
    return this.transportToRoom.get(transportId);
  }

  /**
   * 获取房间内所有的生产者
   */
  getProducersByRoom(roomId) {
    const producers = [];
    this.producerToRoom.forEach((pRoomId, producerId) => {
      if (pRoomId === roomId) {
        const producer = this.producers.get(producerId);
        if (producer) {
          producers.push({
            producerId: producer.id,
            kind: producer.kind,
          });
        }
      }
    });
    return producers;
  }

  cleanupSocket(socketId) {
    const transportIds = this.socketToTransports.get(socketId) || [];

    transportIds.forEach(transportId => {
      const transport = this.transports.get(transportId);
      if (transport) {
        // 获取与该传输关联的所有生产者
        const roomId = this.transportToRoom.get(transportId);

        // 清理生产者
        this.producerToRoom.forEach((pRoomId, producerId) => {
          if (pRoomId === roomId) {
            const producer = this.producers.get(producerId);
            if (producer && producer.appData?.transportId === transportId) {
              this.producers.delete(producerId);
              this.producerToRoom.delete(producerId);
            }
          }
        });

        transport.close();
        this.transports.delete(transportId);
        this.transportToRoom.delete(transportId);
      }
    });

    this.socketToTransports.delete(socketId);
    console.log(`Cleaned up resources for socket ${socketId}`);
  }
}

