import cors from 'cors';
import express, { Request, Response } from 'express';
import type { StatementRecord } from '@statement/shared';

const csvRecords: StatementRecord[] = [
  {
    reference: '183398',
    accountNumber: 'NL56RABO0149876948',
    description: 'Clothes from Richard de Vries',
    startBalance: '33.34',
    mutation: '+5.55',
    endBalance: '38.89',
    source: 'csv',
  },
  {
    reference: '112806',
    accountNumber: 'NL27SNSB0917829871',
    description: 'Subscription from Jan Dekker',
    startBalance: '28.95',
    mutation: '-19.44',
    endBalance: '9.51',
    source: 'csv',
  },
  {
    reference: '118757',
    accountNumber: 'NL32RABO0195610843',
    description: 'Candy for Willem King',
    startBalance: '98.99',
    mutation: '-7.85',
    endBalance: '91.14',
    source: 'csv',
  },
];

const xmlRecords: StatementRecord[] = [
  {
    reference: '138932',
    accountNumber: 'NL90ABNA0585647886',
    description: 'Flowers for Richard Bakker',
    startBalance: '94.9',
    mutation: '+14.63',
    endBalance: '109.53',
    source: 'xml',
  },
  {
    reference: '131254',
    accountNumber: 'NL93ABNA0585619023',
    description: 'Candy from Vincent de Vries',
    startBalance: '5429',
    mutation: '-939',
    endBalance: '6368',
    source: 'xml',
  },
  {
    reference: '181688',
    accountNumber: 'NL90ABNA0585647886',
    description: 'Flowers for Jan Theuß',
    startBalance: '75.39',
    mutation: '-32.75',
    endBalance: '42.64',
    source: 'xml',
  },
];

export const mergeStatementRecords = (csvInput: StatementRecord[], xmlInput: StatementRecord[]): StatementRecord[] => [
  ...csvInput,
  ...xmlInput,
];

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/records', (_req: Request, res: Response) => {
  const mergedRecords = mergeStatementRecords(csvRecords, xmlRecords);
  res.json({ records: mergedRecords });
});

const port = 3001;
app.listen(port, () => {
  console.log(`Statement merge API listening on http://localhost:${port}`);
});
