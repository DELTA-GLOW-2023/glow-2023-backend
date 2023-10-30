import { PromptModel } from '../model/promptModel';
import { getJson, uploadImageToBucket } from './PromptService';
import axios from 'axios';
import { apiUrl } from '../config/config';

const sleep = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
export const generateImages = async (): Promise<void> => {
  const latestValidPrompt = await PromptModel.findOne({
    approved: true,
    isUsed: false,
  }).sort({ isPanic: -1, createdAt: -1 });

  if (!latestValidPrompt) {
    console.log('Waiting for input... \nSleeping for 2 seconds.');
    await sleep(2000);
  } else {
    latestValidPrompt.isUsed = true;
    await latestValidPrompt.save();
    const { prompt } = latestValidPrompt;
    let imageId;

    try {
      for (let i = 0; i < 10; i++) {
        // Filter the prompt before handing it in to the "getJson" method
        const { json, endpoint } = await getJson(prompt);

        console.log(
          `Sending request towards Stable Diffusion API for prompt ${json.prompt}, ${i}`
        );
        const response = await axios.post(
          `${apiUrl}/sdapi/v1/${endpoint}2img`,
          json
        );

        const imageResult = await uploadImageToBucket(
          response.data.images[0],
          prompt,
          imageId
        );

        imageId = imageResult?._id;
        console.log(`Image ${imageId} saved to database.`);
      }
    } catch (error) {
      console.log(error)
    }
  }

  await generateImages();
};
