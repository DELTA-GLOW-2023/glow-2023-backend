import { io } from 'socket.io-client';
import { websocketUrl } from '../config/config';
import { getLatestDisplayImageDelayed } from './PromptService';

const socketClient = io(websocketUrl);

socketClient.on('connect', () => {
  console.log('Connected to the submarine hub');
});

export const startInterval = async () => {
  let latestImage: string;
  setInterval(async () => {
    if (socketClient.connected) {
      const image = await getLatestDisplayImageDelayed();
      if (!latestImage && latestImage === image) {
        return;
      }
      latestImage = image;
      console.log('Sending a new image to the websocket');
      socketClient.emit('new-image', {
        image: latestImage,
      });
    }
  }, 1500);
};
