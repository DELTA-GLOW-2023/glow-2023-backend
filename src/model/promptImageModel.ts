import mongoose, { Document, Schema } from 'mongoose';

export interface IImagePrompt extends Document {
  _id: string;
  images: Array<{
    image: string;
    createdAt: Date;
  }>;
  imagePrompt: string;
  createdAt: Date;
  updatedAt: Date;
}

const promptImageModel = new Schema<IImagePrompt>(
  {
    images: [
      {
        image: { type: String, required: true },
        createdAt: { type: Date, required: true },
      },
    ],
    imagePrompt: { type: String, required: true },
  },
  { timestamps: true }
);

export const PromptImageModel = mongoose.model<IImagePrompt>(
  'ImagePrompts',
  promptImageModel
);
