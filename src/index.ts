import express, { json } from 'express';
import { ImageProcessRouter } from './router/imageProcessRouter';
import cors from 'cors';
import { ViewImageRouter } from './router/viewImageRouter';
import { DeleteImageRouter } from './router/deleteImageRouter';
import { dbUrl, port } from './config/config';
import mongoose from 'mongoose';
import { generateImages } from './service/generateImageService';
import { PromptRouter } from './router/promptRouter';

const app = express();

app.use(cors());
app.use(
  json({
    limit: '50mb',
  })
);

app.use('/process-image', ImageProcessRouter);
app.use('/view-image', ViewImageRouter);
app.use('/delete-image', DeleteImageRouter);
app.use('/prompts', PromptRouter);

const main = async () => {
  await mongoose.connect(dbUrl);
  console.log('Connected to database');

  generateImages();
  app.listen(port);
};

main()
  .then(() => console.log(`Server is running on port ${port}`))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
