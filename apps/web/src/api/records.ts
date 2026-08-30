import type { StatementRecord } from '@statement/shared';

type RecordsResponse = {
  records: StatementRecord[];
};

type UploadResponse = {
  uploadId: string;
};

type ErrorResponse = {
  error?: unknown;
};

type StatementFiles = {
  csvFile: File;
  xmlFile: File;
};

const throwForFailedResponse = async (response: Response): Promise<void> => {
  if (response.ok) {
    return;
  }

  if (response.headers.get('content-type')?.includes('application/json')) {
    const data = (await response.json()) as ErrorResponse;

    if (typeof data.error === 'string') {
      throw new Error(data.error);
    }
  }

  throw new Error(`Unable to load records: ${response.status}`);
};

export async function uploadStatementFiles({ csvFile, xmlFile }: StatementFiles): Promise<string> {
  const formData = new FormData();
  formData.append('files', csvFile);
  formData.append('files', xmlFile);

  const response = await fetch('http://localhost:3001/api/records/upload', {
    method: 'POST',
    body: formData,
  });

  await throwForFailedResponse(response);

  const data = (await response.json()) as UploadResponse;
  return data.uploadId;
}

export async function fetchRecords(uploadId: string): Promise<StatementRecord[]> {
  const response = await fetch(`http://localhost:3001/api/records/${encodeURIComponent(uploadId)}`);

  await throwForFailedResponse(response);

  const data = (await response.json()) as RecordsResponse;
  return data.records;
}
