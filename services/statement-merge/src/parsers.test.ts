import { describe, expect, it } from 'vitest';
import { mergeStatementData, parseCsvRecords, parseXmlRecords } from './parsers.js';

const csv = `Reference,Account Number,Description,Start Balance,Mutation,End Balance
1,NL01,Groceries,10.00,+2.00,12.00`;

const xml = `<records><record reference="2"><accountNumber>NL02</accountNumber><description>Books</description><startBalance>20.00</startBalance><mutation>-5.00</mutation><endBalance>15.00</endBalance></record></records>`;

describe('statement parsers', () => {
  it('parses CSV records', () => {
    expect(parseCsvRecords(csv)[0]).toMatchObject({ reference: '1', source: 'csv' });
  });

  it('parses XML records', () => {
    expect(parseXmlRecords(xml)[0]).toMatchObject({ reference: '2', source: 'xml' });
  });

  it('merges both formats without validating them', () => {
    expect(mergeStatementData(csv, xml)).toHaveLength(2);
  });
});
