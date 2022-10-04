import { BookDto } from './../books/books.dto';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';

export class PurchasedDateDto {
  @ApiProperty({ description: 'Purchased Book' })
  purchaseDate: number;
}

export class PurchasedBookDto extends IntersectionType(BookDto, PurchasedDateDto) {}
