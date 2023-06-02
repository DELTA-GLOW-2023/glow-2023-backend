/**

 Express router for processing images.
 @module ImageProcessRouter
 */
import { Request, Response, Router } from 'express';
import { check, validationResult } from 'express-validator';
import axios from 'axios';
import { apiUrl } from '../config/config';
import { IImageResponse } from '../interface/iImageResponse';
import { getJson, uploadImageToBucket } from '../service/PromptService';
import { IPrompt } from '../model/promptModel';

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
  [check('prompt').isString().notEmpty().withMessage('Prompt is required.')],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { prompt } = req.body;

    const { json, endpoint } = await getJson(prompt);

    let imageId: string;
    let imageResult: IPrompt;
    try {
      console.log('Sending request towards Stable Diffusion API');
      for (let i = 0; i < 4; i++) {
        const response = await axios.post(
          `${apiUrl}/sdapi/v1/${endpoint}2img`,
          json
        );

        imageResult = await uploadImageToBucket(
          response.data.images[0],
          prompt,
          imageId
        );

        imageId = imageResult._id;
      }
      const message = {
        promptResult: imageResult,
        message: 'Image processed successfully!',
      };

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
