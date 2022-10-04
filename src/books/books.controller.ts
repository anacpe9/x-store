import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Req } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Authz } from '../authz/authz.decorator';
import * as mongoose from 'mongoose';

import { Book, BookDocument, BookSchema } from '../common/database/schemas/books.schema';
import { PurchasedBook, PurchasedBookDocument } from '../common/database/schemas/purchased-book.schema';
import { BookDto } from './books.dto';
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
    const rawList = await this.bookModel.find().lean();
    return rawList.map((book) => ({
      id: book._id,
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
    }));
  }


  @ApiResponse({
    status: 200,
    description: 'Success, Return all book',
    type: [BookDto],
  })
  @Authz()
  @Get(':id')
  public async getById(@Param() params: { id: string }): Promise<BookDto> {
    const book = await this.bookModel.findById(params.id).lean();
    return {
      id: book._id,
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
    };
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
