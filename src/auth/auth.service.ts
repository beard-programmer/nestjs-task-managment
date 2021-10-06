import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { AuthCredentialsDto } from './dto/auth-credentials-dto';
import { UsersRepository } from './users.repository';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @Inject(UsersRepository)
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
  ) {}

  async signUp(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    try {
      const user = await this.usersRepository.createUser(authCredentialsDto);
      return {
        accessToken: this.jwtService.sign({ username: user.username }),
      };
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new ConflictException('Username already exists');
      }

      throw error;
    }
  }

  async signIn(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    const { username, password } = authCredentialsDto;
    const user = await this.usersRepository.findOne({ username: username });

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload: JwtPayload = { username };
      const accessToken: string = this.jwtService.sign(payload);
      return { accessToken };
    }

    throw new UnauthorizedException('User not found or password is incorrect');
  }
}
