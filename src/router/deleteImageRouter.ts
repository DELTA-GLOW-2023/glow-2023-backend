import { Router } from 'express';
import { removeLatestPromptModel } from '../service/PromptService';

const router = Router();

router.post('/', async (req, res) => {
	try {
		await removeLatestPromptModel();
		return res.status(200).json({ message: 'Success' });
	} catch (error) {
		return res.status(500).json({ message: 'Internal server error' });
	}
});

export const DeleteImageRouter = router;
