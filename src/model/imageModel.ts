import mongoose, { Document, Schema } from 'mongoose';

export interface IImage extends Document {
  _id: string;
  image: string;
  imagePrompt: string;
  displayed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const imageModel = new Schema<IImage>(
  {
    image: { type: String, required: true },
    imagePrompt: { type: String, required: true },
    displayed: { type: Boolean, required: false, default: false },
  },
  { timestamps: true }
);

export const ImageModel = mongoose.model<IImage>('Image', imageModel);
