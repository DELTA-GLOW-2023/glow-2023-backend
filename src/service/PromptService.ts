import { Client } from 'minio';
import {
  minioAccessKey,
  minioAccessSecret,
  minioEndpoint,
  minioPort,
  minioPublicEndpoint,
  minioPublicPort,
  filterServerUrl,
  noErrorFilterServerUrl
} from '../config/config';
import { IPrompt, PromptModel } from '../model/promptModel';
import axios from 'axios';
import { NegativePrompts } from '../config/negativePrompts';
import * as tf from '@tensorflow/tfjs-node';
import * as nsfwjs from 'nsfwjs';
import {getModel} from '../index';

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

const NSFW_PROBABILITIES = {
  Hentai: 0.50,
  Porn: 0.45,
  Sexy: 0.50,
  Drawing: 1,
  Neutral: 1,
};

export const isContentSafeForDisplay = async (
  image: string,
): Promise<boolean> => {
  const model = await getModel();

  const buffer = Buffer.from(image, 'base64');
  
  const img: any = tf.node.decodeImage(buffer, 3);

  const predictions: nsfwjs.predictionType[] = await model.classify(img);

  const filteredPredictions = predictions?.filter((prediction) => prediction.className != 'Neutral' && prediction.className != 'Drawing');
  
  const isSafe = filteredPredictions.every((prediction: nsfwjs.predictionType) => prediction.probability <= NSFW_PROBABILITIES[prediction.className]);

  img.dispose();

  return isSafe;
};

// Filter user prompt from forbidden words
export const filterPrompt = async (prompt: string) => {

  // This option throws errors and returns a filtered prompt.
  // In case of encountering the first inappropriate/forbidden word/phrase,
  // or indicating an unsupported language, an error is thrown.
  // const response = await axios.post(filterServerUrl, {prompt});

  // This option doesn't throw errors and returns a filtered prompt.
  // If something went wrong: the prompt was in unsupported language,
  // then an empty string is returned instead of an error.
  const response = await axios.post(noErrorFilterServerUrl, {prompt});

  if (response.status === 400 || response.status === 500)
    throw Error(response.data.message);

  return response.data.prompt;
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

export async function removePromptModel(id: string) {
  return await PromptModel.findByIdAndDelete(id);
}

export async function getFinalPrompt() {
  const lastImages = await PromptModel.find({})
    .sort({ createdAt: -1 })
    .limit(6);

  const prompt = lastImages.map((image, i) => {
    return `(${image.imagePrompt}:${(1.5 - i * 0.2).toFixed(1)})`;
  });

  const staticPrompt =
    ', light art, led lights, beautiful, highly detailed, high resolution, 4k, ultra hd, crystal clear, 8K UHD,  highly detailed face,(freckles:0.5),<lora:Neno:0.25> Neon Light';
  return prompt.toString() + staticPrompt;
}

export async function getJson(prompt: string) {
  const image = await getLatestDisplayImage();
  const denoise = 0.6;
  let json;
  let endpoint;
  if (image) {
    const finalPrompt = await getFinalPrompt();
    const finalImage = await imageUrlToBase64(image);
    console.log(finalPrompt);
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
