import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from './app.js';

describe('records API', () => {
  it('returns records loaded from the project data files', async () => {
    const response = await request(app).get('/api/records');

    expect(response.status).toBe(200);
    expect(response.body.records).toHaveLength(20);
    expect(response.body.validationIssues).toEqual(expect.any(Array));
    expect(response.body.records[0].source).toBe('csv');
    expect(response.body.records[response.body.records.length - 1].source).toBe('xml');
  });
});
