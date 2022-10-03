import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Injectable()
export class AuthzService {
  constructor(
    // private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async sign(user: any, options?: Partial<JwtSignOptions>): Promise<string> {
    return await this.jwtService.signAsync(user, options);
  }

  async verify(user: any, options?: Partial<JwtVerifyOptions>): Promise<any> {
    return await this.jwtService.verifyAsync(user, options);
  }

  async getUserData(user: any) {
    return {
      user: {},
      role: 'user',
    };
  }
}
