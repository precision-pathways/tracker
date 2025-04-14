import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TrackerService {
  private socket!: Socket;

  constructor() {
    // Use the API_HOST environment variable or default to 'http://localhost:3000'
    const apiHost = (window as any).API_HOST || 'http://localhost:3000';

    // Connect to the WebSocket server
    this.socket = io(apiHost, {
      transports: ['websocket'], // Force WebSocket transport
    });
  }

  // Subscribe to the 'location' event
  onLocation(): Observable<{ x: number; y: number; z: number }> {
    return new Observable((observer) => {
      this.socket.on('location', (data: { x: number; y: number; z: number }) => {
        observer.next(data); // Emit the received data
      });

      // Handle cleanup when the subscription is closed
      return () => {
        this.socket.off('location');
      };
    });
  }
}