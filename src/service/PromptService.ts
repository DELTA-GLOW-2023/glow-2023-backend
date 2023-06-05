import { Client } from 'minio';
import {
  minioAccessKey,
  minioAccessSecret,
  minioEndpoint,
  minioPort,
  minioPublicEndpoint,
  minioPublicPort,
} from '../config/config';
import { IPrompt, PromptModel } from '../model/promptModel';
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
  const imageName = `${Date.now()}.png`;
  await minioClient.putObject(bucketName, imageName, imageBuffer);
  return `http://${minioPublicEndpoint}:${minioPublicPort}/${bucketName}/${imageName}`;
};

export const uploadImageToBucket = async (
  image: string,
  promptDescription: string,
  imageId?: string
): Promise<IPrompt> => {
  const bucketName = 'images'; // Specify the bucket name

  const bucketExists = await minioClient.bucketExists(bucketName);
  if (!bucketExists) {
    await minioClient.makeBucket(bucketName);
  }

  const imageUrl = await ImageToBucket(image, bucketName);

  const imageModelData = {
    image: imageUrl,
    imagePrompt: promptDescription,
  };

  if (imageId) {
    const imageModel = await PromptModel.findById(imageId);
    imageModel.image.push(imageUrl);
    await imageModel.save();
    return imageModel;
  } else {
    const imageModel = new PromptModel(imageModelData);
    await imageModel.save();

    return imageModel;
  }
};

export const getLatestDisplayImage = async (): Promise<string | undefined> => {
  const prompt = await PromptModel.findOne({}).sort({
    createdAt: -1,
  });

  if (!prompt) {
    return undefined;
  }
  return prompt.image[prompt.image.length - 1];
};

export const viewImages = async (): Promise<IPrompt[]> => {
  return PromptModel.find({}).sort({ createdAt: -1 });
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
  const imageCount = await PromptModel.countDocuments({});
  return imageCount % 30 === 0 ? '0.80' : '0.22';
}

export async function getFinalPrompt() {
  const lastImages = await PromptModel.find({})
    .sort({ createdAt: -1 })
    .limit(6);

  const prompt = lastImages.map((image, i) => {
    return `(${image.imagePrompt}:${1.5 - i * 0.2})`;
  });

  return prompt.toString();
}

export async function getJson(prompt: string) {
  const image = await getLatestDisplayImage();
  const denoise = 0.5;
  let json;
  let endpoint;
  if (image) {
    const finalPrompt = await getFinalPrompt();
    const finalImage = await imageUrlToBase64(image);
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
