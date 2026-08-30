export class UploadValidationError extends Error {}

export class UploadNotFoundError extends Error {}

export type FormidableHttpError = Error & {
  httpCode?: number;
};

export const isFormidableHttpError = (error: unknown): error is FormidableHttpError =>
  error instanceof Error && 'code' in error && 'httpCode' in error;
