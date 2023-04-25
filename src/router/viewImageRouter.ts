import { Router } from 'express';

const viewImageRouter = Router();

viewImageRouter.get('/', async (req, res) => {
  res.send('Hello World!');
});

export const ViewImageRouter = viewImageRouter;
