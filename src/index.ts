import express from 'express';
import { rootHandler } from './handlers';

const app = express();
const port = process.env.PORT || '8000';

app.get('/', rootHandler);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
