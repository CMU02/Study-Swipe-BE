import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import path from 'path';
import { timestamp } from 'rxjs';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    // HTTP 컨텍스트로 전환
    const ctx = host.switchToHttp();

    // response 응답 객체 가져오기
    const response = ctx.getResponse<Response>();
    // request 응답 객체 가져오기
    const request = ctx.getRequest<Request>();
    // status 발생한 예외로 부터 HTTP 상태코드를 가져오기
    const status = exception.getStatus();

    // 서버로그에 에러콘솔 출력
    this.logger.log(
      JSON.stringify({
        status,
        path: request.url,
        method: request.method,
        message: exception.message,
        timestamp: new Date().toISOString(),
      }),
    );

    // 클라이언트에게 전송할 표준화된 에러 응답 객체를 구성
    response.status(status).json({
      status_code: status,
      timestamp: new Date().toISOString(),
      message: exception.message,
    });
  }
}
