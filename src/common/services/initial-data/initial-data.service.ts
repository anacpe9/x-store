import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { Book, BookDocument } from '../../database/schemas/books.schema';

@Injectable()
export class InitialDataService {
  constructor(
    @InjectModel(Book.name)
    private readonly bookModel: mongoose.Model<BookDocument>,
    private readonly httpService: HttpService,
  ) {}

  async onModuleInit() {
    try {
      Logger.log('Start Initial Data ...');

      // Randomly delay to prevent other pods from starting at the same time.
      const ms = Math.floor(Math.random() * 2000);
      await new Promise((res) => setTimeout(res, ms));

      const source$ = await this.httpService.get(
        'https://raw.githubusercontent.com/benoitvallon/100-best-books/master/books.json',
      );
      // {
      //   "author": "Chinua Achebe",
      //   "country": "Nigeria",
      //   "imageLink": "images/things-fall-apart.jpg",
      //   "language": "English",
      //   "link": "https://en.wikipedia.org/wiki/Things_Fall_Apart\n",
      //   "pages": 209,
      //   "title": "Things Fall Apart",
      //   "year": 1958
      // }

      const resp = await firstValueFrom(source$);
      const books = resp.data;
      let count = 0;
      for (const book of books) {
        const id = count++;
        const exists = await this.bookModel.findById(id.toString());
        // Logger.log(`${id}: ${exists ? true : false}`);
        if (!exists) {
          await this.bookModel.create({
            _id: id,
            title: book.title,
            author: book.author,
            price: book.price || count + 99,
            country: book.country,
            imageLink: book.imageLink,
            language: book.language,
            link: book.link,
            pages: book.pages,
            year: book.year,
            description: book.description,
          });
        }
      }
    } catch (err) {
      Logger.log(`Initial data error: ${err}`);
      Logger.error(err);
    }
  }
}
