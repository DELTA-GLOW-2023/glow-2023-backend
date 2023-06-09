import axios from 'axios';
import fs from 'fs';
import path from 'path';

import { PromptModel } from '../model/promptModel';
import mongoose from 'mongoose';
import { dbUrl } from '../config/config';

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
  const images = await PromptModel.find({});

  const imageUrls = images.map((image) => {
    return image.image;
  });

  const flattened = imageUrls.flat();

  await downloadAndSaveImages(flattened);
};

saveImagesToFileSystemService().catch(console.error);
