/**

 Express router for processing images.
 @module ImageProcessRouter
 */
import { Request, Response, Router } from 'express';
import { check, validationResult } from 'express-validator';
import axios from 'axios';
import { apiUrl } from '../config/config';
import { IImageResponse } from '../interface/iImageResponse';
import { NegativePrompts } from '../config/negativePrompts';

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
    check('image')
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

    const { image, prompt } = req.body;
    const json = {
      prompt: prompt,
      negative_prompt: NegativePrompts.negative_prompts.join(', '),
      sampler: 'Euler',
      sampler_name: 'Euler',
      steps: 50,
      cfg_scale: 4.5,
      width: 512,
      height: 512 * 1.5,
      alwayson_scripts: {
        controlnet: {
          args: [
            {
              input_image: image,
              module: 'openpose_full',
              model: 'control_sd15_openpose [fef5e48e]',
              weight: 1.2,
            },
            {
              input_image: image,
              module: 'lineart_realistic',
              model: 'control_sd15_scribble [fef5e48e]',
              weight: 0.8,
            },
          ],
        },
      },
    };

    try {
      console.log('Sending request towards Stable Diffusion API');
      const response = await axios.post(`${apiUrl}/sdapi/v1/txt2img`, json);

      const message: IImageResponse = {
        image: response.data.images[0],
        message: 'Image processed successfully!',
      };

      console.log(message);

      res.status(200).json(message);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ Message: 'An error occurred while processing the image.' });
    }
  }
);

export const ImageProcessRouter = router;
