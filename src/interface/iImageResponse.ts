import { IImagePrompt } from '../model/promptImageModel';

export interface IImageResponse {
  promptResult: IImagePrompt;
  message: string;
}
