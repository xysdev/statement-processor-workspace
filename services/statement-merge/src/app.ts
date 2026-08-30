import cors from 'cors';
import express from 'express';
import { recordsRouter } from './routes/records.js';

export const app = express();

app.use(cors());
app.use('/api/records', recordsRouter);
