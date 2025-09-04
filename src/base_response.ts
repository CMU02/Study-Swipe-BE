import { HttpStatus } from "@nestjs/common";

export interface BaseResponse {
    status_code: HttpStatus;
    message: string;
    option?: {
        data?: {
            accessToken: string
            refreshToken: string
        },
        meta_data?: Record<string, unknown>;
    }
}