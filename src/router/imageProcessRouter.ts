/**

 Express router for processing images.
 @module ImageProcessRouter
 */
import { Request, Response, Router } from 'express';
import { check, validationResult } from 'express-validator';
import { PromptModel } from '../model/promptModel';
import { uploadImageToBucket } from '../service/PromptService';

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
            // const filteredPrompt = await filterPrompt(prompt);
            const filteredPrompt = prompt;
            // If the returned prompt is empty, it means that it was inappropriate.
            // Thus, ignore the prompt.
            if (filteredPrompt.length === 0) break;

            console.log('The prompt passed successfully');
            const newPrompt = {
              prompt: filteredPrompt,
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
            // const filteredPrompt = await filterPrompt(prompt);
            const filteredPrompt = prompt;
            // If the returned prompt is empty, it means that it was inappropriate.
            // Thus, ignore the prompt.
            if (filteredPrompt.length === 0) break;

            const newPrompt = {
              prompt: filteredPrompt,
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

/**
 * Route handler for processing an image and creating a new prompt model.
 * @route POST /image-upload-and-create-prompt
 * @param {Request} req - The request object containing the imageBase64 and prompt parameters.
 * @param {Response} res - The response object.
 * @returns {IImageResponse} An object containing a success message if successful, or an error message if not.
 * @throws {Error} Throws an error if an error occurs while processing the image.
 */
router.post(
  '/upload',
  [
    check('image')
      .isString()
      .notEmpty()
      .withMessage('Image base64 data is required.'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { image } = req.body;

    try {
      const newPrompt = {
        prompt: 'knoopxl',
        approved: true,
        isUsed: true,
        imageData: image,
      };

      const promptModel = new PromptModel(newPrompt);
      await promptModel.save();

      await uploadImageToBucket(image, promptModel.prompt, null);

      res
        .status(201)
        .json({ message: 'Prompt and image created successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        Message:
          'An error occurred while processing the image and creating a prompt.',
      });
    }
  }
);

export const ImageProcessRouter = router;
