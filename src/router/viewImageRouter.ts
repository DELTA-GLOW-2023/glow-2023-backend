import { Router } from 'express';
import { getLatestDisplayImage, viewImages } from '../service/ImageService';

const viewImageRouter = Router();

viewImageRouter.get('/', async (req, res) => {
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

viewImageRouter.get('/display/:id', async (req, res) => {
  try {
    const image = await getLatestDisplayImage();
    return res.status(200).json(image);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export const ViewImageRouter = viewImageRouter;
