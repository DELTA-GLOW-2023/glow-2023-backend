import { Request, Response, Router } from 'express';
import { check, validationResult } from 'express-validator';
import { uploadImageToBucket } from '../service/ImageService';

const router = Router();

router.post(
  '/',
  [
    check('image')
      .isString()
      .notEmpty()
      .withMessage('Image in base64 format is required.'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { image } = req.body;

    try {
      const imageUrl = await uploadImageToBucket(image);
      return res.status(200).json({ imageUrl });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
);

export const UploadImageRouter = router;
