import mongoose, { Document, Schema } from 'mongoose';

export interface IImagePrompt extends Document {
  _id: string;
  image: string[];
  imagePrompt: string;
  createdAt: Date;
  updatedAt: Date;
}

const promptImageModel = new Schema<IImagePrompt>(
  {
    image: { type: [String], required: true },
    imagePrompt: { type: String, required: true },
  },
  { timestamps: true }
);

export const PromptImageModel = mongoose.model<IImagePrompt>(
  'ImagePrompts',
  promptImageModel
);
