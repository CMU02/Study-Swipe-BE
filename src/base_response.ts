import { HttpStatus } from "@nestjs/common";

export interface BaseResponse {
    status_code: HttpStatus;
    message: string;
}