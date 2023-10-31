/**

 Express router for processing images.
 @module ImageProcessRouter
 */
import { Request, Response, Router } from 'express';
import { check, validationResult } from 'express-validator';
import { PromptModel } from '../model/promptModel';

const router = Router();

/**
 Route handler for processing an image using the specified prompt and returning the result.
 @route POST /image-process
 @param {Request} req - The request object containing the imageBase64 and prompt parameters.
 @param {Response} res - The response object.
 @returns {IImageResponse} An object containing the processed image and a success message if successful, or an error message if not.
 @throws {Error} Throws an error if an error occurs while processing the image.
 */
router.post(
  '/',
  [
    check('prompt').isString().notEmpty().withMessage('Prompt is required.'),
    check('method').isString().notEmpty().withMessage('Method is required.'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { prompt, method } = req.body;

    try {
      switch (method) {
        case 'text': {
          try {
            // await filterPrompt(prompt);
            const newPrompt = {
              prompt: prompt,
              approved: false,
              isUsed: false,
            };

            const promptModel = new PromptModel(newPrompt);
            await promptModel.save();
          } catch {
            return res
              .status(400)
              .json({ message: 'Prompt is inappropriate.' });
          }
          break;
        }
        case 'icon': {
          const newPrompt = {
            prompt: prompt,
            approved: true,
            isUsed: false,
          };

          const promptModel = new PromptModel(newPrompt);
          await promptModel.save();
          break;
        }
        default: {
          try {
            // await filterPrompt(prompt);
            const newPrompt = {
              prompt: prompt,
              approved: false,
              isUsed: false,
            };

            const promptModel = new PromptModel(newPrompt);
            await promptModel.save();
          } catch {
            return res
              .status(400)
              .json({ message: 'Prompt is inappropriate.' });
          }
          break;
        }
      }
      res.status(200).json({ message: 'Success' });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ Message: 'An error occurred while processing the image.' });
    }
  }
);

export const ImageProcessRouter = router;
