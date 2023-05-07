import express, { json } from 'express';
import { ImageProcessRouter } from './router/imageProcessRouter';
import cors from 'cors';
import { ViewImageRouter } from './router/viewImageRouter';
import { port } from './config/config';

const app = express();

app.use(cors());
app.use(json());
app.use('/image-process', ImageProcessRouter);
app.use('/view-image', ViewImageRouter);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
