import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TrackerGateway } from './tracker';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, TrackerGateway],
})
export class AppModule {}
