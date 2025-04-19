import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { StreamService } from './stream';

@WebSocketGateway({
  cors: {
    origin: '*', // Allow all origins (use specific origins in production)
    methods: ['GET', 'POST'],
  },
})
export class TrackerGateway {
  @WebSocketServer()
  server: Server;

  private streamService: StreamService;

  constructor() {
    // Use environment variable or fallback to default
    const streamUrl = process.env.HLS_STREAM_URL || 'http://localhost:8000/stream.m3u8';
    this.streamService = new StreamService(streamUrl);

    setInterval(async () => {
      try {
        const coordinates = await this.streamService.getFrameCoordinates();
        this.server.emit('location', coordinates);
        console.log('Sent coordinates:', coordinates);
      } catch (err) {
        console.error('Error getting coordinates:', err);
      }
    }, 5000); // 5 seconds
  }
}