import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // Allow all origins (use specific origins in production)
    methods: ['GET', 'POST'],
  },
})
export class TrackerGateway {
  @WebSocketServer()
  server: Server;

  // Send random coordinates every 5 seconds
  constructor() {
    setInterval(() => {
      const randomCoordinates = {
        x: (Math.random() * 5).toFixed(0), // Random x between 0 and 15
        y: (Math.random() * 5).toFixed(0), // Random y between 0 and 15
        z: (Math.random() * 5).toFixed(0), // Random z between 0 and 15
      };
      this.server.emit('location', randomCoordinates);
      console.log('Sent coordinates:', randomCoordinates);
    }, 5000); // 5 seconds
  }
}