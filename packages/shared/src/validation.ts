import currency from 'currency.js';
import type { StatementRecord, ValidationIssue } from './index.js';

/**
 * Converts a money value to the smallest currency unit (cents).
 * currency.js performs exact decimal arithmetic, so rounding stays predictable
 * even when the input contains more than two decimal places.
 */
export const parseMoney = (value: string | number): number => {
  // Parsers may provide whole-number XML values as numbers at runtime.
  const normalized = String(value).trim();

  if (normalized === '') {
   return Number.NaN;
  }

  try {
   return Math.round(currency(normalized).value * 100);
  } catch {
   return Number.NaN;
  }
};

export const isBalanceValid = (
  startBalance: string,
  mutation: string,
  endBalance: string,
): boolean => {
  const parsedStartBalance = parseMoney(startBalance);
  const parsedMutation = parseMoney(mutation);
  const parsedEndBalance = parseMoney(endBalance);

  if (![parsedStartBalance, parsedMutation, parsedEndBalance].every(Number.isFinite)) {
   return false;
  }

  // All values are integers in cents, so equality is safe and exact.
  return parsedStartBalance + parsedMutation === parsedEndBalance;
};

export const getFailedRecords = (records: StatementRecord[]): ValidationIssue[] => {
  const seen = new Set<string>();
  const failed: ValidationIssue[] = [];

  for (const [recordIndex, record] of records.entries()) {
   if (seen.has(record.reference)) {
     failed.push({
       reference: record.reference,
       description: record.description,
       reason: 'Duplicate transaction reference',
       recordIndex,
     });
     continue;
   }

   seen.add(record.reference);

   if (!isBalanceValid(record.startBalance, record.mutation, record.endBalance)) {
     failed.push({
       reference: record.reference,
       description: record.description,
       reason: 'End balance mismatch',
       recordIndex,
     });
   }
  }

  return failed;
};
