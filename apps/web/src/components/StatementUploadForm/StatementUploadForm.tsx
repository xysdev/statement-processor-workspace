import { FormEvent, useState } from 'react';

type StatementUploadFormProps = {
  isUploading: boolean;
  onSubmit: (files: { csvFile: File; xmlFile: File }) => Promise<void | boolean>;
};

const maxUploadBytes = 1024 * 1024;

const hasExtension = (file: File, extension: string) => file.name.toLowerCase().endsWith(extension);

export function StatementUploadForm({ isUploading, onSubmit }: StatementUploadFormProps) {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [xmlFile, setXmlFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!csvFile || !xmlFile) {
      setValidationError('Choose one CSV file and one XML file before uploading.');
      return;
    }

    if (!hasExtension(csvFile, '.csv') || !hasExtension(xmlFile, '.xml')) {
      setValidationError('The selected files must use the .csv and .xml extensions.');
      return;
    }

    if (csvFile.size > maxUploadBytes || xmlFile.size > maxUploadBytes) {
      setValidationError('Each file must be 1 MB or smaller.');
      return;
    }

    setValidationError(null);
    await onSubmit({ csvFile, xmlFile });
  };

  return (
    <form className="upload-panel" onSubmit={handleSubmit}>
      <div>
        <h2 className="upload-panel__title">Upload statement files</h2>
        <p className="upload-panel__help">
          Select one CSV file and one XML file. Files are validated on the server before records are processed.
        </p>
      </div>

      <div className="upload-panel__fields">
        <label className="upload-field">
          <span className="upload-field__label">CSV file</span>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => setCsvFile(event.target.files?.[0] ?? null)}
          />
        </label>
        <label className="upload-field">
          <span className="upload-field__label">XML file</span>
          <input
            type="file"
            accept=".xml,text/xml,application/xml"
            onChange={(event) => setXmlFile(event.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      {validationError ? (
        <p className="error-state" role="alert">{validationError}</p>
      ) : null}

      <button className="btn btn--primary" type="submit" disabled={isUploading}>
        {isUploading ? 'Uploading...' : 'Upload and validate'}
      </button>
    </form>
  );
}
