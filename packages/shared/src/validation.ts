import type { StatementRecord, ValidationIssue } from './index.js';

/**
 * Converts a money value to the smallest currency unit (cents).
 * Integer arithmetic avoids the rounding errors of JavaScript floating-point
 * addition, such as 0.1 + 0.2 producing 0.30000000000000004.
 */
export const parseMoney = (value: string | number): number => {
  // Parsers may provide whole-number XML values as numbers at runtime.
  const normalized = String(value).trim();
  const parsed = Number(normalized);

  return normalized !== '' && Number.isFinite(parsed)
    ? Math.round(parsed * 100)
    : Number.NaN;
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

  for (const record of records) {
    if (seen.has(record.reference)) {
      failed.push({
        reference: record.reference,
        description: record.description,
        reason: 'Duplicate transaction reference',
      });
      continue;
    }

    seen.add(record.reference);

    if (!isBalanceValid(record.startBalance, record.mutation, record.endBalance)) {
      failed.push({
        reference: record.reference,
        description: record.description,
        reason: 'End balance mismatch',
      });
    }
  }

  return failed;
};
