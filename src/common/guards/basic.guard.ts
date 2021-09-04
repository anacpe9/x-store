import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import { Reflector } from '@nestjs/core';

const USER_PASS_REGEXP = /^([^:]*):(.*)$/;
const CREDENTIALS_REGEXP = /^ *(?:[Bb][Aa][Ss][Ii][Cc]) +([A-Za-z0-9._~+/-]+=*) *$/;

function decodeBase64(str) {
  return Buffer.from(str, 'base64').toString();
}

@Injectable()
export class BasicGuard implements CanActivate {
  constructor(
    // private readonly reflector: Reflector,
    // private readonly authService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'];
    const match = authHeader && CREDENTIALS_REGEXP.exec(authHeader);
    if (!match) return Promise.resolve(false);

    // decode user pass
    const userPass = USER_PASS_REGEXP.exec(decodeBase64(match[1]));
    if (!userPass) return Promise.resolve(false);

    const basicUsername = this.configService.get('http.auth.basic.username');
    const basicPassword = this.configService.get('http.auth.basic.password');

    // userPass[1], userPass[2]
    const username = userPass[1].toLowerCase();
    const password = userPass[2];

    if (basicUsername === username && basicPassword === password) {
      req.user = {
        username: username,
      };

      return Promise.resolve(true);
    }

    return Promise.resolve(false);
  }
}
