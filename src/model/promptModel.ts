import mongoose, { Document, Schema } from 'mongoose';

export interface IPrompt extends Document {
  _id: string;
  image: string[];
  imagePrompt: string;
  createdAt: Date;
  updatedAt: Date;
}

const promptModel = new Schema<IPrompt>(
  {
    image: { type: [String], required: true },
    imagePrompt: { type: String, required: true },
  },
  { timestamps: true }
);

export const PromptModel = mongoose.model<IPrompt>('Prompts', promptModel);
