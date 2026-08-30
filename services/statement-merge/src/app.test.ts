import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from './app.js';

describe('records API', () => {
  it('stores uploaded CSV and XML files, then returns records from the saved upload', async () => {
    const uploadResponse = await request(app)
      .post('/api/records/upload')
      .attach('files', Buffer.from('Reference,Account Number,Description,Start Balance,Mutation,End Balance\n1,NL01,Groceries,10.00,+2.00,12.00'), 'records.csv')
      .attach('files', Buffer.from('<records><record reference="2"><accountNumber>NL02</accountNumber><description>Books</description><startBalance>20.00</startBalance><mutation>-5.00</mutation><endBalance>15.00</endBalance></record></records>'), 'records.xml');

    expect(uploadResponse.status).toBe(201);
    expect(uploadResponse.body.uploadId).toEqual(expect.any(String));

    const response = await request(app).get(`/api/records/${uploadResponse.body.uploadId}`);

    expect(response.status).toBe(200);
    expect(response.body.records).toHaveLength(2);
    expect(response.body.validationIssues).toEqual([]);
  });

  it('rejects uploads that do not include both supported statement files', async () => {
    const response = await request(app)
      .post('/api/records/upload')
      .attach('files', Buffer.from('not supported'), 'records.txt');

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/CSV file and one XML file/);
  });

  it('rejects unsupported file types', async () => {
    const response = await request(app)
      .post('/api/records/upload')
      .attach('files', Buffer.from('Reference,Account Number,Description,Start Balance,Mutation,End Balance\n1,NL01,Groceries,10.00,+2.00,12.00'), 'records.csv')
      .attach('files', Buffer.from('not supported'), 'records.txt');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Only CSV and XML statement files are accepted.');
  });

  it('rejects malformed statement uploads', async () => {
    const uploadResponse = await request(app)
      .post('/api/records/upload')
      .attach('files', Buffer.from('not valid csv'), 'records.csv')
      .attach('files', Buffer.from('<records><record></records>'), 'records.xml');

    expect(uploadResponse.status).toBe(201);

    const response = await request(app).get(`/api/records/${uploadResponse.body.uploadId}`);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Uploaded statement files could not be parsed as valid CSV/XML.');
  });

  it('returns not found when reading an unknown upload', async () => {
    const response = await request(app).get('/api/records/00000000-0000-4000-8000-000000000000');

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Uploaded statement files were not found.');
  });
});
