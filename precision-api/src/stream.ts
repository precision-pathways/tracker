import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import Jimp from 'jimp';


export interface Point3D {
  x: number;
  y: number;
  z: number;
}

@Injectable()
export class StreamService {
  private readonly logger = new Logger(StreamService.name);
  private readonly streamUrl: string;

  constructor(streamUrl: string) {
    this.streamUrl = streamUrl;
  }

  /**
   * Captures a frame from the provided HLS stream and analyzes it to return 3D coordinates
   * of pixels that meet a brightness threshold.
   *
   * FFmpeg streams one PNG image frame via stdout and Jimp processes the image.
   *
   * @returns Promise resolving to an array of Point3D.
   */
  async getFrameCoordinates(): Promise<Point3D[]> {
    return new Promise<Point3D[]>((resolve, reject) => {
      // FFmpeg arguments to connect to the provided HLS stream and capture one frame as PNG.
      const ffmpegArgs = [
        '-y',                   // Overwrite output files if needed.
        '-i', this.streamUrl,    // Use the provided stream URL.
        '-frames:v', '1',       // Capture only one frame.
        '-f', 'image2pipe',     // Stream output as an image.
        '-vcodec', 'png',       // Use PNG format.
        'pipe:1',               // Send output to stdout.
        '-loglevel', 'error',   // Only show errors.
      ];

      const ffmpeg = spawn('ffmpeg', ffmpegArgs);
      let imageBuffer: Buffer = Buffer.alloc(0);

      // Gather data from FFmpeg's stdout.
      ffmpeg.stdout.on('data', (chunk: Buffer) => {
        imageBuffer = Buffer.concat([imageBuffer, chunk]);
      });

      // Log stderr for debugging.
      ffmpeg.stderr.on('data', (data: Buffer) => {
        this.logger.debug(`ffmpeg stderr: ${data.toString()}`);
      });

      ffmpeg.on('error', (err) => {
        this.logger.error('Error spawning ffmpeg process:', err);
        reject(err);
      });

      ffmpeg.on('close', async (code: number) => {
        if (code !== 0) {
          return reject(new Error(`ffmpeg exited with code ${code}`));
        }
        try {
          // Load the image using Jimp.
          const image = await Jimp.read(imageBuffer);
          const { width, height } = image.bitmap;
          const brightnessThreshold = 250;
          const coordinates: Point3D[] = [];

          // Sample the image every 5 pixels for performance.
          for (let y = 0; y < height; y += 5) {
            for (let x = 0; x < width; x += 5) {
              const pixelColor = image.getPixelColor(x, y);
              const { r, g, b } = Jimp.intToRGBA(pixelColor);
              // If the pixel is bright enough, add it with a z-index of 0.
              if (r >= brightnessThreshold && g >= brightnessThreshold && b >= brightnessThreshold) {
                coordinates.push({ x, y, z: 0 });
              }
            }
          }
          resolve(coordinates);
        } catch (error) {
          reject(error);
        }
      });
    });
  }
}
