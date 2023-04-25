/**

 Express router for processing images.
 @module ImageProcessRouter
 */
import { Request, Response, Router } from 'express';
import sharp from 'sharp';
import { check, validationResult } from 'express-validator';
import axios from 'axios';
import { apiUrl } from '../config/config';
import { NegativePrompts } from '../config/negativePrompts';
import { IImageResponse } from '../interface/iImageResponse';

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
    check('imageBase64')
      .isString()
      .notEmpty()
      .withMessage('Image in base64 format is required.'),
    check('prompt').isString().notEmpty().withMessage('Prompt is required.'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { imageBase64, prompt } = req.body;
      const imageBuffer = Buffer.from(imageBase64, 'base64');

      const rotatedImage = await sharp(imageBuffer).rotate(90).toBuffer();

      const rotatedImageBase64 = rotatedImage.toString('base64');

      const json = {
        init_images: [rotatedImageBase64],
        prompt: prompt,
        negative_prompt: NegativePrompts.negative_prompts.join(' '),
        steps: 20,
        cfg_scale: 5,
        sampler: 'Euler',
        sampler_name: 'Euler',
        width: 512,
        height: 512,
        denoising_strength: 0.4,
      };

      const response = await axios.post(`${apiUrl}/sdapi/v1/img2img`, json);

      const message: IImageResponse = {
        image: response.data.images[0],
        message: 'Image rotated successfully!',
      };

      res.status(200).json(message);
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred while processing the image.');
    }
  }
);

export const ImageProcessRouter = router;
