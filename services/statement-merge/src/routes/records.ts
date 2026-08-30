import { Router } from 'express';
import {
  isFormidableHttpError,
  UploadNotFoundError,
  UploadValidationError,
} from '../errors.js';
import {
  parseStatementUpload,
  removeTemporaryUploadFiles,
} from '../uploads/statementUpload.js';
import {
  deleteStatementUpload,
  readStatementUpload,
  saveStatementUpload,
} from '../storage/statementStorage.js';
import { buildStatementReport } from '../services/statementRecords.js';

export const recordsRouter = Router();

recordsRouter.post('/upload', async (req, res) => {
  const temporaryFiles = [];

  try {
    const upload = await parseStatementUpload(req);
    temporaryFiles.push(...upload.allFiles);
    const uploadId = await saveStatementUpload(upload);

    res.status(201).json({ uploadId });
  } catch (error) {
    if (error instanceof UploadValidationError) {
      res.status(400).json({ error: error.message });
      return;
    }

    if (isFormidableHttpError(error)) {
      res.status(error.httpCode ?? 400).json({ error: error.message });
      return;
    }

    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unable to upload statement files.',
    });
  } finally {
    await removeTemporaryUploadFiles(temporaryFiles);
  }
});

recordsRouter.get('/:uploadId', async (req, res) => {
  const { uploadId } = req.params;

  try {
    const { csv, xml } = await readStatementUpload(uploadId);
    res.json(buildStatementReport(csv, xml));
  } catch (error) {
    if (error instanceof UploadValidationError) {
      res.status(400).json({ error: error.message });
      return;
    }

    if (error instanceof UploadNotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }

    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unable to load uploaded statement files.',
    });
  } finally {
    await deleteStatementUpload(uploadId);
  }
});
