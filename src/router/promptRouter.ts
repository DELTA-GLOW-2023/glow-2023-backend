import { Router } from 'express';
import { check } from 'express-validator';
import { PromptModel } from '../model/promptModel';
import { apiKeyMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(apiKeyMiddleware);

router.post(
  '/approve',
  check('promptId').isString().notEmpty().withMessage('Prompt Id is required.'),
  async (req, res) => {
    const { promptId } = req.body;

    const prompt = await PromptModel.findById(promptId);
    prompt.approved = true;
    await prompt.save();

    return res.status(200).json({ message: 'Success' });
  }
);

router.post(
  '/reject',
  check('promptId').isString().notEmpty().withMessage('Prompt Id is required.'),
  async (req, res) => {
    const { promptId } = req.body;
    await PromptModel.findByIdAndRemove(promptId);
    return res.status(200).json({ message: 'Success' });
  }
);

router.get('/', async (req, res) => {
  const prompts = await PromptModel.find({
    approved: false,
    isUsed: false,
  }).sort({ createdAt: 1 });
  return res.status(200).json(prompts);
});
export const PromptRouter = router;
