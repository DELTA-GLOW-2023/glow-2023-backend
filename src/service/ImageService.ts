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
import axios from 'axios';
import { NegativePrompts } from '../config/negativePrompts';

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
  promptDescription: string
): Promise<IImage> => {
  const bucketName = 'images'; // Specify the bucket name

  const bucketExists = await minioClient.bucketExists(bucketName);
  if (!bucketExists) {
    await minioClient.makeBucket(bucketName);
  }

  const [imageUrl] = await Promise.all([ImageToBucket(image, bucketName)]);

  const imageModel = new ImageModel({
    image: imageUrl,
    imagePrompt: promptDescription,
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
    return images[0];
  }
  imageToDisplay.displayed = true;
  await imageToDisplay.save();

  return imageToDisplay;
};

export const viewImages = async (): Promise<IImage[]> => {
  return await ImageModel.find({}).sort({ createdAt: -1 });
};

export async function imageUrlToBase64(url: string) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');
    return buffer.toString('base64');
  } catch (error) {
    throw new Error('Failed to convert image to base64');
  }
}

export async function getDenoise() {
  const imageCount = await ImageModel.countDocuments({});
  return imageCount % 30 === 0 ? '0.80' : '0.25';
}

export async function getFinalPrompt(prompt: string) {
  const lastImages = await ImageModel.find({}).sort({ createdAt: -1 }).limit(5);
  let finalPrompt = `(${prompt}:1.5), `;

  lastImages.map((image, i) => {
    finalPrompt += `(${image.imagePrompt}:${1.3 - i * 0.2}), `;
  });

  console.log(finalPrompt);

  return finalPrompt;
}

export async function getJson(prompt: string) {
  const image = await getLatestDisplayImage();
  const denoise = '0.4';
  let json;
  let endpoint;
  if (image) {
    const finalPrompt = await getFinalPrompt(prompt);
    const finalImage = await imageUrlToBase64(image.image);
    json = {
      init_images: [finalImage],
      prompt: finalPrompt,
      negative_prompt: NegativePrompts.negative_prompts.join(', '),
      sampler: 'Euler a',
      sampler_name: 'Euler a',
      steps: 10,
      denoising_strength: denoise,
      cfg_scale: 4,
      width: 512,
      height: 512 * 1.5,
    };
    endpoint = 'img';
  } else {
    json = {
      prompt: prompt,
      negative_prompt: NegativePrompts.negative_prompts.join(', '),
      sampler: 'Euler a',
      sampler_name: 'Euler a',
      steps: 10,
      denoising_strength: denoise,
      cfg_scale: 4,
      width: 512,
      height: 512 * 1.5,
    };
    endpoint = 'txt';
  }
  return { json, endpoint };
}
