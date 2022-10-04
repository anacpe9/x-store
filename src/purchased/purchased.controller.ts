import { Book, BookDocument } from './../common/database/schemas/books.schema';
import { Controller, Get, Req } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PurchasedBookDto } from './purchased.dto';
import * as mongoose from 'mongoose';
import { PurchasedBook, PurchasedBookDocument } from '../common/database/schemas/purchased-book.schema';
import { ApiResponse } from '@nestjs/swagger';
import { Authz } from '../authz/authz.decorator';

@Controller('purchased')
export class PurchasedController {
  constructor(
    @InjectModel(Book.name)
    private readonly bookModel: mongoose.Model<BookDocument>,
    @InjectModel(PurchasedBook.name)
    private readonly purchasedBookModel: mongoose.Model<PurchasedBookDocument>,
  ) {}

  @ApiResponse({
    status: 200,
    description: 'Success, Return all purchased book',
    type: [PurchasedBookDto],
  })
  @Authz()
  @Get()
  public async listPurchasedBook(@Req() req: any): Promise<PurchasedBookDto[]> {
    const userId = req.user.id;
    const purchased = await this.purchasedBookModel.find({ userId: userId }).lean();

    // TODO: should use aggregate with lookup instead
    const bookIds = purchased.map((p) => p.bookId);
    const bookList = await this.bookModel.find({ _id: { $in: bookIds } }).lean();
    const booksMap = bookList.reduce((base, curr) => {
      base[curr._id] = curr;

      return base;
    }, {});

    return purchased.map((p) => {
      const book = booksMap[p.bookId];

      return {
        id: p.bookId,
        title: book.title,
        author: book.author,
        price: book.price,
        country: book.country,
        imageLink: book.imageLink,
        language: book.language,
        link: book.link,
        pages: book.pages,
        year: book.year,
        description: book.description,
        purchaseDate: p.purchaseDate,
      };
    });
  }
}
