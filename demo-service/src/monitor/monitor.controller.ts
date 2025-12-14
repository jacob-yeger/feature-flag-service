import { Controller, Sse, MessageEvent } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Observable, fromEvent, map } from 'rxjs';

@Controller('monitor')
export class MonitorController {
    constructor(private eventEmitter: EventEmitter2) { }

    @Sse('stream')
    stream(): Observable<MessageEvent> {
        return fromEvent(this.eventEmitter, 'log.entry').pipe(
            map((data) => ({ data } as MessageEvent)),
        );
    }
}
