import { Injectable } from '@nestjs/common';
import { Constants } from './common/constants';

@Injectable()
export class AppService {
  getVersion(): any {
    const { APP_VERSION, APP_NAME, APP_DESCRIPTION } = Constants;
    return {
      version: APP_VERSION,
      name: APP_NAME,
      description: APP_DESCRIPTION,
    };
  }
}
