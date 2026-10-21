export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  iconLink?: string;
  size?: string;
  createdTime?: string;
  modifiedTime?: string;
  thumbnailLink?: string;
}

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3/files';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

/**
 * List files from user's Google Drive
 */
export async function listDriveFiles(
  accessToken: string,
  searchQuery?: string,
  parentFolderId?: string
): Promise<DriveFile[]> {
  const queryParts = ['trashed = false'];

  if (parentFolderId) {
    queryParts.push(`'${parentFolderId}' in parents`);
  }

  if (searchQuery && searchQuery.trim()) {
    queryParts.push(`name contains '${searchQuery.replace(/'/g, "\\'")}'`);
  }

  const q = encodeURIComponent(queryParts.join(' and '));
  const fields = encodeURIComponent(
    'files(id, name, mimeType, webViewLink, iconLink, size, createdTime, modifiedTime, thumbnailLink)'
  );
  const url = `${DRIVE_API_URL}?q=${q}&orderBy=modifiedTime%20desc&pageSize=30&fields=${fields}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Google Drive API error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Find or create a dedicated application folder in Google Drive
 */
export async function findOrCreateFolder(
  accessToken: string,
  folderName: string = 'Porsche GT3 RS Intelligence Vault'
): Promise<string> {
  const q = encodeURIComponent(
    `mimeType = 'application/vnd.google-apps.folder' and name = '${folderName.replace(/'/g, "\\'")}' and trashed = false`
  );
  const searchUrl = `${DRIVE_API_URL}?q=${q}&fields=files(id,name)`;

  const searchRes = await fetch(searchUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (searchRes.ok) {
    const data = await searchRes.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
  }

  // Create folder if not found
  const createRes = await fetch(DRIVE_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });

  if (!createRes.ok) {
    const errorText = await createRes.text();
    throw new Error(`Failed to create Drive folder: ${errorText}`);
  }

  const createdFolder = await createRes.json();
  return createdFolder.id;
}

/**
 * Upload a report, appraisal, or spec file to Google Drive using multipart upload
 */
export async function uploadFileToDrive(
  accessToken: string,
  fileName: string,
  content: string,
  mimeType: string = 'text/markdown',
  folderId?: string
): Promise<DriveFile> {
  const metadata: Record<string, unknown> = {
    name: fileName,
    mimeType: mimeType,
  };

  if (folderId) {
    metadata.parents = [folderId];
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    content +
    closeDelimiter;

  const res = await fetch(DRIVE_UPLOAD_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to upload file to Google Drive (${res.status}): ${errorText}`);
  }

  return await res.json();
}

/**
 * Permanently delete a file from Google Drive
 * Note: Must be preceded by explicit user confirmation dialog.
 */
export async function deleteDriveFile(
  accessToken: string,
  fileId: string
): Promise<void> {
  const res = await fetch(`${DRIVE_API_URL}/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok && res.status !== 204) {
    const errorText = await res.text();
    throw new Error(`Failed to delete file from Google Drive (${res.status}): ${errorText}`);
  }
}
