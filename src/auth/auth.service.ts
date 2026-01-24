import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';
import { RegisterDto } from './dto/register.dto';
import bcrypt from 'bcrypt';
import { RequestUser } from './types/user.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.databaseService.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
      },
    });

    return { id: user.id, email: user.email, role: user.role };
  }

  async validateUser(email: string, pass: string) {
    const user = await this.databaseService.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) {
      return null;
    }

    const { password, ...result } = user;
    return result;
  }

  login(user: RequestUser) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
