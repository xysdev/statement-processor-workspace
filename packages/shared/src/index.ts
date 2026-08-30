export type RecordSource = 'csv' | 'xml';

export type StatementRecord = {
  reference: string;
  accountNumber: string;
  description: string;
  startBalance: string;
  mutation: string;
  endBalance: string;
  source: RecordSource;
};

export type ValidationIssue = {
  reference: string;
  description: string;
  reason: string;
  recordIndex?: number;
};

export { getFailedRecords, isBalanceValid, parseMoney } from './validation.js';
