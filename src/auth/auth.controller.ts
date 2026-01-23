import {
  Body,
  Controller,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Request,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RequestUser } from './types/user.interface';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('auth')
@UsePipes(new ValidationPipe())
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Пользователь успешно зарегистрирован',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        email: { type: 'string', example: 'user@example.com' },
        role: { type: 'string', example: 'USER', enum: ['USER', 'ADMIN'] },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Невалидные данные или email уже занят',
  })
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @ApiOperation({ summary: 'Вход в систему' })
  @ApiBody({
    description: 'Учетные данные для входа',
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'user@example.com',
          description: 'Email пользователя',
        },
        password: {
          type: 'string',
          format: 'password',
          example: 'password123',
          description: 'Пароль пользователя',
          minLength: 6,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Успешный вход, возвращает JWT токен',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Неверные учетные данные',
  })
  @Post('login')
  @UseGuards(LocalAuthGuard)
  login(@Request() req: { user: RequestUser }) {
    return this.authService.login(req.user);
  }
}
