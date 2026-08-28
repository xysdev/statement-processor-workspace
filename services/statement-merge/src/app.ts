import cors from 'cors';
import express, { Request, Response } from 'express';
import { readFile } from 'node:fs/promises';
import { getFailedRecords } from '@statement/shared';
import { mergeStatementData } from './parsers.js';

export const app = express();

app.use(cors());

const loadStatementRecords = async () => {
  const [csv, xml] = await Promise.all([
    readFile(new URL('../data/records.csv', import.meta.url), 'utf8'),
    readFile(new URL('../data/records.xml', import.meta.url), 'utf8'),
  ]);

  return mergeStatementData(csv, xml);
};

app.get('/api/records', async (_req: Request, res: Response) => {
  try {
    const records = await loadStatementRecords();
    res.json({ records, validationIssues: getFailedRecords(records) });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unable to load statement files.',
    });
  }
});
