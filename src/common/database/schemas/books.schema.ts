import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type BookDocument = Book & mongoose.Document;

@Schema()
export class Book {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true, trim: true, index: true })
  title: string;

  @Prop({ required: true, trim: true, index: true })
  author: string;

  @Prop({ required: true, default: 0 })
  price: number;

  @Prop()
  country: string;

  @Prop()
  imageLink: string;

  @Prop()
  language: string;

  @Prop()
  link: string;

  @Prop()
  pages: number;

  @Prop()
  year: number;

  @Prop()
  description: string;
}

const BookSchema = SchemaFactory.createForClass(Book);

export { BookSchema };
