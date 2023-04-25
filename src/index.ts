import express, { json } from 'express';
import { ImageProcessRouter } from './router/imageProcessRouter';
import { config } from 'dotenv';
import cors from 'cors';
import { ViewImageRouter } from './router/viewImageRouter';

config();

const app = express();
const port = process.env.PORT || '8000';

app.use(cors());
app.use(json());
app.use('/image-process', ImageProcessRouter);
app.use('/view-image', ViewImageRouter);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
