import { IPrompt } from '../model/promptModel';

export interface IImageResponse {
  promptResult: IPrompt;
  message: string;
}
