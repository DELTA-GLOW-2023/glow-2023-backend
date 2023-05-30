import { Client } from 'minio';
import {
  minioAccessKey,
  minioAccessSecret,
  minioEndpoint,
  minioPort,
  minioPublicEndpoint,
  minioPublicPort,
} from '../config/config';
import { IImage, ImageModel } from '../model/imageModel';

const minioClient = new Client({
  endPoint: minioEndpoint,
  port: minioPort,
  useSSL: false,
  accessKey: minioAccessKey,
  secretKey: minioAccessSecret,
});

const ImageToBucket = async (
  image: string,
  bucketName: string
): Promise<string> => {
  const imageBuffer = Buffer.from(image, 'base64');
  const imageName = `${Date.now()}.jpg`;
  await minioClient.putObject(bucketName, imageName, imageBuffer);
  return `http://${minioPublicEndpoint}:${minioPublicPort}/${bucketName}/${imageName}`;
};

export const uploadImageToBucket = async (
  image: string,
  secondImage: string,
  promptDescription: string,
  secondPromptDescription: string
): Promise<IImage> => {
  const bucketName = 'images'; // Specify the bucket name

  const bucketExists = await minioClient.bucketExists(bucketName);
  if (!bucketExists) {
    await minioClient.makeBucket(bucketName);
  }

  const [imageUrl, secondImageUrl] = await Promise.all([
    ImageToBucket(image, bucketName),
    ImageToBucket(secondImage, bucketName),
  ]);

  const imageModel = new ImageModel({
    image: imageUrl,
    secondImage: secondImageUrl,
    imagePrompt: promptDescription,
    secondImagePrompt: secondPromptDescription,
  });
  await imageModel.save();

  return imageModel;
};

export const getLatestDisplayImage = async (): Promise<IImage> => {
  const imageToDisplay = await ImageModel.findOne({ displayed: false }).sort({
    createdAt: -1,
  });

  if (!imageToDisplay) {
    const images = await ImageModel.find({}).sort({ createdAt: -1 });
    // const randomIndex = Math.floor(Math.random() * images.length);
    return images[0];
  }
  imageToDisplay.displayed = true;
  await imageToDisplay.save();

  return imageToDisplay;
};

export const viewImages = async (): Promise<IImage[]> => {
  return await ImageModel.find({}).sort({ createdAt: -1 });
};
