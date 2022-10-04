import { ApiProperty, IntersectionType } from '@nestjs/swagger';

export class BookDto {
  @ApiProperty({ description: 'Book ID' })
  id: string;

  @ApiProperty({ description: 'Book Title' })
  title: string;

  @ApiProperty({ description: 'Author' })
  author: string;

  @ApiProperty({ description: 'Price' })
  price: number;

  @ApiProperty({ description: 'Country' })
  country: string;

  @ApiProperty({ description: 'Image link' })
  imageLink: string;

  @ApiProperty({ description: 'Language' })
  language: string;

  @ApiProperty({ description: 'Wiki link' })
  link: string;

  @ApiProperty({ description: 'Number of pages' })
  pages: number;

  @ApiProperty({ description: 'Publish year' })
  year: number;

  @ApiProperty({ description: 'Description' })
  description: string;
}
