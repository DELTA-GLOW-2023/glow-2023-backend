import { Router } from 'express';
import { addApprovedPromptModel, removeLatestPromptModel } from '../service/PromptService';
import { apiKey } from '../config/config';

const router = Router();

const panicPrompts: string[] = [
	'Snowflake', 
	'Vulcano',
	'Wolf',
	'Light bulb',
	'Mona lisa',
	'Yarn',
];

router.post('/', async (req, res) => {
	  if (!req.headers.authorization || req.headers.authorization !== apiKey) {
	    return res.status(401).json({ message: 'Unauthorized' });
	  }
	try {
		await removeLatestPromptModel();
		await addApprovedPromptModel(panicPrompts[Math.floor(Math.random() * panicPrompts.length)]);
		return res.status(200).json({ message: 'Success' });
	} catch (error) {
		return res.status(500).json({ message: 'Internal server error' });
	}
});

export const DeleteImageRouter = router;