import { getFailedRecords } from '@statement/shared';
import { UploadValidationError } from '../errors.js';
import { mergeStatementData } from '../parsers.js';

export const buildStatementReport = (csv: string, xml: string) => {
  try {
    const records = mergeStatementData(csv, xml);

    return { records, validationIssues: getFailedRecords(records) };
  } catch {
    throw new UploadValidationError('Uploaded statement files could not be parsed as valid CSV/XML.');
  }
};
