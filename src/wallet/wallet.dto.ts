import { ApiProperty } from '@nestjs/swagger';

export class WalletDto {
  @ApiProperty({ description: 'Address' })
  address: string;

  @ApiProperty({ description: 'Network name' })
  network: string;

  @ApiProperty({ description: 'RPC URL' })
  rpcUrl: string;

  @ApiProperty({ description: 'WSS URL' })
  wssUrl: string;

  @ApiProperty({ description: 'Chain ID' })
  chainID: string;
}
