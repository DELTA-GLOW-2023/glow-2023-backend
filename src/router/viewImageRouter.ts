import { Router } from 'express';
import {
  getLatestDisplayImage,
  getLatestDisplayImageDelayed,
  imageUrlToBase64,
  viewImages,
} from '../service/PromptService';
import { apiKeyMiddleware } from '../middleware/apiKeyMiddleware';

const viewImageRouter = Router();

viewImageRouter.get('/', apiKeyMiddleware, async (req, res) => {
  try {
    const images = await viewImages();
    return res.status(200).json(images);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

viewImageRouter.get('/display', async (req, res) => {
  try {
    const image = await getLatestDisplayImage();
    return res.status(200).json(imageUrlToBase64(image));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

viewImageRouter.get('/display/delay', async (req, res) => {
  try {
    const image = await getLatestDisplayImageDelayed();
    return res.status(200).json(image);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export const ViewImageRouter = viewImageRouter;
