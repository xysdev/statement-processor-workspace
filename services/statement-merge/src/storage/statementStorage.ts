import { randomUUID } from 'node:crypto';
import { cp, mkdir, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { UploadNotFoundError } from '../errors.js';
import type { StatementUploadFiles } from '../uploads/statementUpload.js';

const uploadRoot = join(tmpdir(), 'statement-processor-uploads');
const uploadIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const getUploadDirectory = (uploadId: string): string => {
  if (!uploadIdPattern.test(uploadId)) {
    throw new UploadNotFoundError('Uploaded statement files were not found.');
  }

  return join(uploadRoot, uploadId);
};

export const saveStatementUpload = async ({ csvFile, xmlFile }: StatementUploadFiles): Promise<string> => {
  const uploadId = randomUUID();
  const uploadDirectory = getUploadDirectory(uploadId);

  await mkdir(uploadDirectory, { recursive: true });
  await Promise.all([
    cp(csvFile.filepath, join(uploadDirectory, 'records.csv')),
    cp(xmlFile.filepath, join(uploadDirectory, 'records.xml')),
  ]);

  return uploadId;
};

export const readStatementUpload = async (uploadId: string): Promise<{ csv: string; xml: string }> => {
  const uploadDirectory = getUploadDirectory(uploadId);

  try {
    const [csv, xml] = await Promise.all([
      readFile(join(uploadDirectory, 'records.csv'), 'utf8'),
      readFile(join(uploadDirectory, 'records.xml'), 'utf8'),
    ]);

    return { csv, xml };
  } catch {
    throw new UploadNotFoundError('Uploaded statement files were not found.');
  }
};

export const deleteStatementUpload = async (uploadId: string): Promise<void> => {
  try {
    await rm(getUploadDirectory(uploadId), { recursive: true, force: true });
  } catch (error) {
    if (!(error instanceof UploadNotFoundError)) {
      throw error;
    }
  }
};
