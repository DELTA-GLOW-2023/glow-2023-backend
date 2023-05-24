import mongoose, { Document, Schema } from 'mongoose';

export interface IImage extends Document {
  _id: string;
  image: string;
  imagePrompt: string;
  secondImage: string;
  secondImagePrompt: string;
  email: string;
  displayed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const imageModel = new Schema<IImage>(
  {
    image: { type: String, required: true },
    secondImage:{type: String, required: true},
    imagePrompt:{type:String, required: true},
    secondImagePrompt:{type:String, required: true},
    email: { type: String, required: false },
    displayed: { type: Boolean, required: false, default: false },
  },
  { timestamps: true }
);

export const ImageModel = mongoose.model<IImage>('Image', imageModel);
