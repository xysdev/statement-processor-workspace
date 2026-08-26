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
};

export const parseMoney = (value: string): number => Number.parseFloat(value);

export const isBalanceValid = (startBalance: string, mutation: string, endBalance: string): boolean => {
  const expectedEndBalance = parseMoney(startBalance) + parseMoney(mutation);
  const actualEndBalance = parseMoney(endBalance);

  return Math.abs(expectedEndBalance - actualEndBalance) <= 0.0001;
};
