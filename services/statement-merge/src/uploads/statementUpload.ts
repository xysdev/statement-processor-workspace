import formidable, { type File } from 'formidable';
import { unlink } from 'node:fs/promises';
import type { Request } from 'express';
import { UploadValidationError } from '../errors.js';

const maxUploadBytes = 1024 * 1024;
const acceptedFileExtensions = new Set(['.csv', '.xml']);
const acceptedMimeTypes = new Set([
  'application/csv',
  'application/vnd.ms-excel',
  'application/xml',
  'text/csv',
  'text/plain',
  'text/xml',
]);

export type StatementUploadFiles = {
  csvFile: File;
  xmlFile: File;
};

const isFile = (file: File | undefined): file is File => Boolean(file);

export const getFileExtension = (file: File): string => {
  const originalName = file.originalFilename ?? '';
  const extensionIndex = originalName.lastIndexOf('.');

  return extensionIndex >= 0 ? originalName.slice(extensionIndex).toLowerCase() : '';
};

const ensureSafeUpload = (file: File): void => {
  const extension = getFileExtension(file);
  const mimeType = file.mimetype?.toLowerCase();

  if (!acceptedFileExtensions.has(extension)) {
    throw new UploadValidationError('Only CSV and XML statement files are accepted.');
  }

  if (mimeType && !acceptedMimeTypes.has(mimeType)) {
    throw new UploadValidationError('Uploaded files must be CSV or XML documents.');
  }

  if (file.size <= 0) {
    throw new UploadValidationError('Uploaded files cannot be empty.');
  }
};

const flattenFiles = (files: formidable.Files<string>): File[] =>
  Object.values(files).flatMap((file) => (Array.isArray(file) ? file : [file])).filter(isFile);

const getStatementFiles = (files: File[]): StatementUploadFiles => {
  const csvFile = files.find((file) => getFileExtension(file) === '.csv');
  const xmlFile = files.find((file) => getFileExtension(file) === '.xml');

  if (!csvFile || !xmlFile) {
    throw new UploadValidationError('Upload exactly one CSV file and one XML file.');
  }

  return { csvFile, xmlFile };
};

export const parseStatementUpload = async (req: Request): Promise<StatementUploadFiles & { allFiles: File[] }> => {
  const form = formidable({
    allowEmptyFiles: false,
    maxFiles: 2,
    maxFileSize: maxUploadBytes,
    maxTotalFileSize: maxUploadBytes * 2,
    multiples: true,
  });

  const [, files] = await form.parse(req);
  const allFiles = flattenFiles(files);

  if (allFiles.length !== 2) {
    throw new UploadValidationError('Upload exactly one CSV file and one XML file.');
  }

  allFiles.forEach(ensureSafeUpload);

  return { ...getStatementFiles(allFiles), allFiles };
};

export const removeTemporaryUploadFiles = async (files: File[]): Promise<void> => {
  await Promise.allSettled(files.map((file) => unlink(file.filepath)));
};
