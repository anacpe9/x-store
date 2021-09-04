import { ApiProperty } from '@nestjs/swagger';

export class HelloVersionDto {
  @ApiProperty()
  version: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;
}
