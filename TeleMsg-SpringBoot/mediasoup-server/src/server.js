import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { config } from './config.js';
import { MediasoupService } from './mediasoup-service.js';

const app = express();
const httpServer = createServer(app);

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8080'],
  credentials: true,
}));

app.use(express.json());

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:8080'],
    credentials: true,
  },
});

// Initialize Mediasoup service
const mediasoupService = new MediasoupService();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'mediasoup-server' });
});

// Get RTP capabilities
app.get('/rtp-capabilities', async (req, res) => {
  try {
    const rtpCapabilities = await mediasoupService.getRouterRtpCapabilities();
    res.json({ rtpCapabilities });
  } catch (error) {
    console.error('Error getting RTP capabilities:', error);
    res.status(500).json({ error: error.message });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join room (call session)
  socket.on('join-room', async ({ roomId, userId }, callback) => {
    try {
      console.log(`User ${userId} joining room ${roomId}`);
      socket.join(roomId);

      // Get or create router for this room
      const router = await mediasoupService.getOrCreateRouter(roomId);

      // 🔥 重要: 获取房间内已存在的所有生产者，并通知新加入的用户
      const existingProducers = mediasoupService.getProducersByRoom(roomId);
      console.log(`Room ${roomId} has ${existingProducers.length} existing producers`);

      callback({ success: true });

      // 向新用户发送已存在的生产者信息
      existingProducers.forEach(({ producerId, kind }) => {
        console.log(`Notifying new user ${userId} about existing producer ${producerId} (${kind})`);
        socket.emit('new-producer', {
          producerId,
          userId: 'existing-user', // 实际应该存储并返回真实的userId
          kind,
        });
      });
    } catch (error) {
      console.error('Error joining room:', error);
      callback({ success: false, error: error.message });
    }
  });

  // Create WebRTC transport
  socket.on('create-transport', async ({ roomId, direction }, callback) => {
    try {
      const transport = await mediasoupService.createWebRtcTransport(roomId, direction, socket.id);

      callback({
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
      });
    } catch (error) {
      console.error('Error creating transport:', error);
      callback({ error: error.message });
    }
  });

  // Connect transport
  socket.on('connect-transport', async ({ transportId, dtlsParameters }, callback) => {
    try {
      await mediasoupService.connectTransport(transportId, dtlsParameters);
      callback({ success: true });
    } catch (error) {
      console.error('Error connecting transport:', error);
      callback({ success: false, error: error.message });
    }
  });

  // Produce (send media)
  socket.on('produce', async ({ transportId, kind, rtpParameters }, callback) => {
    try {
      const producer = await mediasoupService.produce(transportId, kind, rtpParameters);

      // Notify other users in the room
      const roomId = mediasoupService.getRoomIdByTransport(transportId);
      socket.to(roomId).emit('new-producer', {
        producerId: producer.id,
        userId: socket.id,
        kind,
      });

      callback({ id: producer.id });
    } catch (error) {
      console.error('Error producing:', error);
      callback({ error: error.message });
    }
  });

  // Consume (receive media)
  socket.on('consume', async ({ transportId, producerId, rtpCapabilities }, callback) => {
    try {
      const consumer = await mediasoupService.consume(
        transportId,
        producerId,
        rtpCapabilities
      );

      callback({
        id: consumer.id,
        producerId: consumer.producerId,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
      });
    } catch (error) {
      console.error('Error consuming:', error);
      callback({ error: error.message });
    }
  });

  // Resume consumer
  socket.on('resume-consumer', async ({ consumerId }, callback) => {
    try {
      await mediasoupService.resumeConsumer(consumerId);
      callback({ success: true });
    } catch (error) {
      console.error('Error resuming consumer:', error);
      callback({ success: false, error: error.message });
    }
  });

  // Close producer
  socket.on('close-producer', async ({ producerId }, callback) => {
    try {
      await mediasoupService.closeProducer(producerId);
      callback({ success: true });
    } catch (error) {
      console.error('Error closing producer:', error);
      callback({ success: false, error: error.message });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    mediasoupService.cleanupSocket(socket.id);
  });
});

// Start server
async function start() {
  try {
    // Initialize Mediasoup
    await mediasoupService.init();

    // Start HTTP server
    httpServer.listen(config.port, () => {
      console.log(`🚀 Mediasoup server running on port ${config.port}`);
      console.log(`📡 RTC ports: ${config.mediasoup.worker.rtcMinPort}-${config.mediasoup.worker.rtcMaxPort}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

