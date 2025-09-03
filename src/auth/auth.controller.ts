import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signUp.dto';
import { BaseResponse } from 'src/base_response';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}

    @Post('/signup')
    signUp(@Body() signUpDto: SignUpDto): Promise<BaseResponse> {
        return this.authService.signUp(signUpDto);
    }
}
