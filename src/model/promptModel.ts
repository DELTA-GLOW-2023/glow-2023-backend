import mongoose, { Document, Schema } from 'mongoose';

export interface IPrompt extends Document {
  _id: string;
  prompt: string;
  approved: boolean;
  isUsed: boolean;
  hasPriority: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const promptModel = new Schema<IPrompt>(
  {
    prompt: { type: String, required: true },
    approved: { type: Boolean, default: false, required: true },
    isUsed: { type: Boolean, default: false, required: true },
    hasPriority: { type: Boolean, default: false, required: false },
  },
  { timestamps: true }
);

export const PromptModel = mongoose.model<IPrompt>('Prompts', promptModel);
