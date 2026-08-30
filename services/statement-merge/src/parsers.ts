import { parse as parseCsv } from 'csv-parse/sync';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import type { StatementRecord } from '@statement/shared';

type CsvRow = {
  Reference: string;
  'Account Number': string;
  Description: string;
  'Start Balance': string;
  Mutation: string;
  'End Balance': string;
};

type XmlRecord = {
  '@_reference': string;
  accountNumber: string;
  description: string;
  startBalance: string;
  mutation: string;
  endBalance: string;
};

const requiredCsvFields: (keyof CsvRow)[] = [
  'Reference',
  'Account Number',
  'Description',
  'Start Balance',
  'Mutation',
  'End Balance',
];

const requiredXmlFields: (keyof XmlRecord)[] = [
  '@_reference',
  'accountNumber',
  'description',
  'startBalance',
  'mutation',
  'endBalance',
];

const hasValue = (value: unknown): value is string | number =>
  (typeof value === 'string' && value.trim() !== '') || typeof value === 'number';

export const parseCsvRecords = (input: string): StatementRecord[] => {
  const rows = parseCsv(input, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    trim: true,
  }) as CsvRow[];

  if (
    rows.length === 0 ||
    rows.some((row) => requiredCsvFields.some((field) => !hasValue(row[field])))
  ) {
    throw new Error('CSV statement file is missing required record fields.');
  }

  return rows.map((row) => ({
    reference: row.Reference,
    accountNumber: row['Account Number'],
    description: row.Description,
    startBalance: row['Start Balance'],
    mutation: row.Mutation,
    endBalance: row['End Balance'],
    source: 'csv',
  }));
};

export const parseXmlRecords = (input: string): StatementRecord[] => {
  const validationResult = XMLValidator.validate(input);

  if (validationResult !== true) {
    throw new Error('XML statement file is not well formed.');
  }

  const parsed = new XMLParser({
    ignoreAttributes: false,
    trimValues: true,
  }).parse(input) as { records?: { record?: XmlRecord | XmlRecord[] } };

  const records = parsed.records?.record ?? [];
  const recordList = Array.isArray(records) ? records : [records];

  if (
    recordList.length === 0 ||
    recordList.some((record) => requiredXmlFields.some((field) => !hasValue(record?.[field])))
  ) {
    throw new Error('XML statement file is missing required record fields.');
  }

  return recordList.map((record) => ({
    reference: record['@_reference'],
    accountNumber: record.accountNumber,
    description: record.description,
    startBalance: record.startBalance,
    mutation: record.mutation,
    endBalance: record.endBalance,
    source: 'xml',
  }));
};

export const mergeStatementData = (csvInput: string, xmlInput: string): StatementRecord[] => [
  ...parseCsvRecords(csvInput),
  ...parseXmlRecords(xmlInput),
];
