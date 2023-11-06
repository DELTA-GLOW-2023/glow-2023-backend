import axios from 'axios';
import fs from 'fs';
import path from 'path';

import mongoose from 'mongoose';
import { dbUrl } from '../config/config';
import { PromptImageModel } from '../model/promptImageModel';

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
  const images = await PromptImageModel.find({});

  const imageUrlsWithTimestamps = images.reduce((acc, image) => {
    // Map each image to its URL and timestamp
    const imageInfo = image.images.map((img) => ({
      imageUrl: img.image,
      createdAt: img.createdAt,
    }));
    return [...acc, ...imageInfo];
  }, []);

  const oneMinuteAgo = new Date();
  oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1);

  const imagesToDownload = imageUrlsWithTimestamps.filter(
    (imageInfo) => imageInfo.createdAt < oneMinuteAgo
  );

  const imageUrls = imagesToDownload.map((imageInfo) => imageInfo.imageUrl);

  await downloadAndSaveImages(imageUrls);
};

// const saveImagesToFileSystemService = async () => {
//   await mongoose.connect(dbUrl);
//   const images = await PromptImageModel.find({});

//   const imageUrls = images.map((image) => {
//     return image.image;
//   });

//   const flattened = imageUrls.flat();

//   await downloadAndSaveImages(flattened);
// };

saveImagesToFileSystemService().catch(console.error);
