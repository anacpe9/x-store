import { Body, Controller, Get, HttpException, HttpStatus, Post, Req } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Authz } from '../authz/authz.decorator';
import * as mongoose from 'mongoose';

import { Book, BookDocument, BookSchema } from '../common/database/schemas/books.schema';
import { PurchasedBook, PurchasedBookDocument } from '../common/database/schemas/purchased-book.schema';
import { BookDto, PurchasedBookDto } from './books.dto';
import { InjectModel } from '@nestjs/mongoose';

@ApiTags('Books')
@Controller('books')
export class BooksController {
  constructor(
    @InjectModel(Book.name)
    private readonly bookModel: mongoose.Model<BookDocument>,
    @InjectModel(PurchasedBook.name)
    private readonly purchasedBookModel: mongoose.Model<PurchasedBookDocument>,
  ) {}

  // public async signup(@Body() userSignupDto: UserSignupDto): Promise<{ id: string }> {
  //   const newId = await this.userService.signup(userSignupDto);
  //   return { id: newId };
  // }

  @ApiResponse({
    status: 200,
    description: 'Success, Return all book',
    type: [BookDto],
  })
  @Authz()
  @Get()
  public async fetchAll(): Promise<BookDto[]> {
    return await this.bookModel.find().lean();
  }

  @ApiResponse({
    status: 200,
    description: 'Success, Return all purchased book',
    type: [PurchasedBookDto],
  })
  @Authz()
  @Get('purchased')
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
        _id: p.bookId,
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

  @ApiResponse({
    status: 200,
    description: 'Success, Return The user id',
    schema: {
      allOf: [
        {
          properties: {
            success: {
              description: 'User ID',
              type: 'boolean',
            },
          },
        },
      ],
    },
  })
  @Authz()
  @Post('buy')
  public async signup(@Req() req: any, @Body() bookIds: string[]): Promise<{ success: boolean }> {
    if (!bookIds || !Array.isArray(bookIds) || bookIds.length === 0) {
      throw new HttpException('Need Book IDs to process', HttpStatus.BAD_REQUEST);
    }

    const userId = req.user.id;
    const now = Date.now();

    await this.purchasedBookModel.insertMany(
      bookIds.map((id) => ({
        _id: new mongoose.Types.ObjectId().toHexString(),
        bookId: id,
        userId: userId,
        purchaseDate: now,
      })),
    );

    return { success: true };
  }
}
