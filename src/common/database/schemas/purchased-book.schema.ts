import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type PurchasedBookDocument = PurchasedBook & mongoose.Document;

@Schema()
export class PurchasedBook {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true, index: true })
  tx: string;

  @Prop({ required: true, trim: true, index: true })
  bookId: string;

  @Prop({ required: true, trim: true, index: true })
  userId: string;

  @Prop({ required: true })
  purchaseDate: number;
}

const PurchasedBookSchema = SchemaFactory.createForClass(PurchasedBook);
PurchasedBookSchema.index({ bookId: 1, userId: 1 });

export { PurchasedBookSchema };
