import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiResponse } from '@nestjs/swagger';
import { Authz } from '../authz/authz.decorator';
import { WalletDto } from './wallet.dto';

@Controller('wallet')
export class WalletController {
  constructor(private readonly configService: ConfigService) {}

  @ApiResponse({
    status: 200,
    description: 'Success, Return all book',
    type: WalletDto,
  })
  @Authz()
  @Get()
  public async getWallet(): Promise<WalletDto> {
    const wallet = this.configService.get<Record<string, string>>('wallet');

    return {
      address: wallet.address,
      network: wallet.network,
      rpcUrl: wallet.rpc_url,
      wssUrl: wallet.wss_url,
      chainID: wallet.chain_id,
    };
  }
}
