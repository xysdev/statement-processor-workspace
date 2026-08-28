import { parse as parseCsv } from 'csv-parse/sync';
import { XMLParser } from 'fast-xml-parser';
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

export const parseCsvRecords = (input: string): StatementRecord[] => {
  const rows = parseCsv(input, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    trim: true,
  }) as CsvRow[];

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
  const parsed = new XMLParser({
    ignoreAttributes: false,
    trimValues: true,
  }).parse(input) as { records?: { record?: XmlRecord | XmlRecord[] } };

  const records = parsed.records?.record ?? [];
  const recordList = Array.isArray(records) ? records : [records];

  return recordList.filter(Boolean).map((record) => ({
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
