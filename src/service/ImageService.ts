import { Client } from 'minio';
import {
  minioAccessKey,
  minioAccessSecret,
  minioEndpoint,
  minioPort,
} from '../config/config';
import { IImage, ImageModel } from '../model/imageModel';

const minioClient = new Client({
  endPoint: minioEndpoint,
  port: minioPort,
  useSSL: false,
  accessKey: minioAccessKey,
  secretKey: minioAccessSecret,
});

export const uploadImageToBucket = async (image: string): Promise<IImage> => {
  const imageBuffer = Buffer.from(image, 'base64');

  const imageName = `${Date.now()}.jpg`;

  const bucketName = 'images'; // Specify the bucket name

  const bucketExists = await minioClient.bucketExists(bucketName);
  if (!bucketExists) {
    await minioClient.makeBucket(bucketName);
  }

  await minioClient.putObject(bucketName, imageName, imageBuffer);

  const imageUrl = `http://${minioEndpoint}:${minioPort}/${bucketName}/${imageName}`;

  const imageModel = new ImageModel({ image: imageUrl });
  await imageModel.save();

  return imageModel;
};

export const getLatestDisplayImage = async (): Promise<IImage> => {
  const imageToDisplay = await ImageModel.findOne({ displayed: false }).sort({
    createdAt: -1,
  });

  if (!imageToDisplay) {
    const images = await ImageModel.find({}).sort({ createdAt: -1 });
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
  }
  imageToDisplay.displayed = true;
  await imageToDisplay.save();

  return imageToDisplay;
};

export const viewImages = async (): Promise<IImage[]> => {
  return await ImageModel.find({}).sort({ createdAt: -1 });
};
