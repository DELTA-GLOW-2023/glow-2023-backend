import { io } from 'socket.io-client';
import { websocketUrl } from '../config/config';
import { getLatestDisplayImageDelayed } from './PromptService';

const socketClient = io(websocketUrl);

socketClient.on('connect', () => {
  console.log('Connected to the submarine hub');
});

export const startInterval = async () => {
  setInterval(async () => {
    if (socketClient.connected) {
      console.log('Sending a new image to the websocket');
      socketClient.emit('new-image', {
        image: await getLatestDisplayImageDelayed(),
      });
    }
  }, 1500);
};
