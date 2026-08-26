import { isBalanceValid, parseMoney } from '@statement/shared';
import type { StatementRecord, ValidationIssue } from '@statement/shared';

export { parseMoney };

export const getFailedRecords = (records: StatementRecord[]): ValidationIssue[] => {
  const seen = new Map<string, string>();
  const failed: ValidationIssue[] = [];

  for (const record of records) {
    const reference = record.reference;

    if (seen.has(reference)) {
      failed.push({
        reference,
        description: record.description,
        reason: 'Duplicate transaction reference',
      });
      continue;
    }

    seen.set(reference, record.description);

    if (!isBalanceValid(record.startBalance, record.mutation, record.endBalance)) {
      failed.push({
        reference,
        description: record.description,
        reason: 'End balance mismatch',
      });
    }
  }

  return failed;
};
