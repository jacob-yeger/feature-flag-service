import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as crypto from 'crypto';
import { Request, Response } from 'express';

@Injectable()
export class EtagInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest<Request>();
        const response = context.switchToHttp().getResponse<Response>();

        return next.handle().pipe(
            map((data) => {
                if (request.method !== 'GET') {
                    return data;
                }

                const jsonString = JSON.stringify(data);
                const hash = crypto.createHash('md5').update(jsonString).digest('hex');
                const etag = `"${hash}"`;

                if (request.headers['if-none-match'] === etag) {
                    response.status(304);
                    return null; // Body is empty for 304
                }

                response.header('ETag', etag);
                return data;
            }),
        );
    }
}
