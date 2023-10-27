import { Router } from 'express';
import { getLatestDisplayImage, viewImages } from '../service/PromptService';
import { apiKey } from '../config/config';

const viewImageRouter = Router();

viewImageRouter.get('/', async (req, res) => {
  if (!req.headers.authorization || req.headers.authorization !== apiKey) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
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
    return res.status(200).json(image);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export const ViewImageRouter = viewImageRouter;
