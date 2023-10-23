import express, {json} from 'express';
import {ImageProcessRouter} from './router/imageProcessRouter';
import cors from 'cors';
import {ViewImageRouter} from './router/viewImageRouter';
import {dbUrl, port} from './config/config';
import mongoose from 'mongoose';

const app = express();

app.use(cors());
app.use(
    json({
        limit: '50mb',
    })
);

app.use('/process-image', ImageProcessRouter);
app.use('/view-image', ViewImageRouter);

const main = async () => {
    await mongoose.connect(dbUrl);
    console.log('Connected to database');

    app.listen(port);
};

main()
    .then(() => console.log(`Server is running on port ${port}`))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
