import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MonitorModule } from './monitor/monitor.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    MonitorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
