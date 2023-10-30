import { Router } from 'express';
import { addApprovedPromptModel, removeLatestPromptModel } from '../service/PromptService';
import { apiKey } from '../config/config';

const router = Router();

router.post('/', async (req, res) => {
  if (!req.headers.authorization || req.headers.authorization !== apiKey) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    await removeLatestPromptModel();
	await addApprovedPromptModel('vulcano');
    return res.status(200).json({ message: 'Success' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export const DeleteImageRouter = router;
