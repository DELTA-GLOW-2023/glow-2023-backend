import axios from 'axios';
import fs from 'fs';
import path from 'path';
import childProcess from 'child_process';

import mongoose from 'mongoose';
import { dbUrl } from '../config/config';
import * as process from 'process';
import { PromptImageModel } from '../model/promptImageModel';

const isFFmpegInstalled = () => {
  try {
    childProcess.execSync('ffmpeg -version');
    return true;
  } catch (error) {
    return false;
  }
};

const downloadImage = async (imageUrl: string, filePath: string) => {
  const response = await axios.get(imageUrl, { responseType: 'stream' });
  const writer = fs.createWriteStream(filePath);

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
};
const downloadAndSaveImages = async (urls: string[]) => {
  const directory = './downloaded_images';
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }

  for (let i = 0; i < urls.length; i++) {
    const imageUrl = urls[i];
    const fileName = `image${i + 1}.png`;
    const filePath = path.join(directory, fileName);

    console.log(`Downloading ${imageUrl}...`);
    await downloadImage(imageUrl, filePath);
    console.log(`Saved image ${imageUrl} to ${filePath}`);
  }
};

const saveImagesToFileSystemService = async () => {
  await mongoose.connect(dbUrl);
  console.log('Connected to DB');
  const images = await PromptImageModel.find({});

  const imageUrls = images.map((image) => {
    return image.images.map((meta) => meta.image);
  });

  const flattened = imageUrls.flat();

  if (flattened.length === 0) {
    throw new Error('No Images have been found.');
  }
  await downloadAndSaveImages(flattened);

  if (isFFmpegInstalled()) {
    const outputVideoPath = './output_video.mp4';
    const imagesDirectory = './downloaded_images';

    console.log('Converting images to video...');
    try {
      childProcess.execSync(
        `ffmpeg -framerate 30 -i ${imagesDirectory}/image%d.png -c:v libx264 -pix_fmt yuv420p ${outputVideoPath}`
      );
      console.log(`Video saved to ${outputVideoPath}`);
    } catch (error) {
      console.error('Error converting images to video:', error);
    }
  } else {
    throw new Error(
      'FFmpeg is not installed. Please install FFmpeg to create the video.'
    );
  }
};

saveImagesToFileSystemService()
  .then(() => {
    console.log('Success!');
    process.exit(0);
  })
  .catch((reason) => {
    console.error(reason);
    process.exit(0);
  });
