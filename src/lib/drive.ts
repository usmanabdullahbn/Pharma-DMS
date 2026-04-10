import { google, drive_v3 } from "googleapis";
import { Readable } from "stream";

const SCOPES = ["https://www.googleapis.com/auth/drive"];

const MODULE_FOLDER_NAMES: Record<string, string> = {
  grn:           "01-GRN",
  dispensing:    "02-DISPENSING",
  bmr:           "03-BMR",
  qc_inprocess:  "04-QC-INPROCESS",
  production:    "05-PRODUCTION",
  finished_goods:"06-FINISHED-GOODS",
  qc_final:      "07-QC-FINAL",
  release:       "08-RELEASE",
  stability:     "09-STABILITY",
  deviation:     "10-DEVIATIONS",
};

function getDriveClient(): drive_v3.Drive {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!);
  const auth = new google.auth.GoogleAuth({ credentials, scopes: SCOPES });
  return google.drive({ version: "v3", auth });
}

/** Find or create a folder by name inside a parent folder */
async function findOrCreateFolder(
  drive: drive_v3.Drive,
  name: string,
  parentId: string
): Promise<string> {
  const search = await drive.files.list({
    q: `name='${name}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id)",
  });

  if (search.data.files && search.data.files.length > 0) {
    return search.data.files[0].id!;
  }

  const created = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    },
    fields: "id",
  });

  return created.data.id!;
}

/** Get or create the folder path: ROOT/BATCHES/{batchNo}/{module}/ */
export async function getOrCreateBatchModuleFolder(
  batchNo: string,
  module: string
): Promise<string> {
  const drive = getDriveClient();
  const ROOT = process.env.DRIVE_ROOT_FOLDER_ID!;

  const batchesFolder = await findOrCreateFolder(drive, "BATCHES", ROOT);
  const batchFolder   = await findOrCreateFolder(drive, batchNo, batchesFolder);
  const moduleFolder  = MODULE_FOLDER_NAMES[module] ?? module.toUpperCase();
  return await findOrCreateFolder(drive, moduleFolder, batchFolder);
}

/** Get or create a stability study folder: ROOT/STABILITY/{studyNo}/{timepoint}/ */
export async function getOrCreateStabilityFolder(
  studyNo: string,
  timepointLabel?: string
): Promise<string> {
  const drive = getDriveClient();
  const ROOT = process.env.DRIVE_ROOT_FOLDER_ID!;

  const stabilityRoot = await findOrCreateFolder(drive, "STABILITY", ROOT);
  const studyFolder   = await findOrCreateFolder(drive, studyNo, stabilityRoot);
  if (timepointLabel) {
    return await findOrCreateFolder(drive, timepointLabel, studyFolder);
  }
  return studyFolder;
}

export interface DriveUploadResult {
  fileId:      string;
  viewUrl:     string;
  downloadUrl: string;
  fileName:    string;
}

/**
 * Upload a file buffer to Google Drive.
 * Returns the Drive file ID, view URL, and download URL.
 */
export async function uploadToDrive(params: {
  buffer:   Buffer;
  fileName: string;
  mimeType: string;
  folderId: string;
  description?: string;
}): Promise<DriveUploadResult> {
  const drive = getDriveClient();
  const stream = Readable.from(params.buffer);

  const response = await drive.files.create({
    requestBody: {
      name:        params.fileName,
      parents:     [params.folderId],
      description: params.description,
    },
    media: {
      mimeType: params.mimeType,
      body:     stream,
    },
    fields: "id,webViewLink,webContentLink",
  });

  const file = response.data;

  return {
    fileId:      file.id!,
    viewUrl:     file.webViewLink!,
    downloadUrl: file.webContentLink!,
    fileName:    params.fileName,
  };
}

/**
 * Build the standardised file name.
 * Format: {DOCTYPE}-{BATCHNO}_{DESCRIPTION}_{YYYYMMDD}_v{N}.{ext}
 */
export function buildFileName(params: {
  docType:     string;   // e.g. "GRN", "BMR", "QC-FR"
  batchNo:     string;
  description: string;   // e.g. "COA_CynoChem", "Executed_signed"
  version?:    number;
  ext:         string;   // e.g. "pdf", "jpg"
}): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const ver  = params.version ? `_v${params.version}` : "";
  return `${params.docType}-${params.batchNo}_${params.description}_${date}${ver}.${params.ext}`;
}

/** Delete a file from Google Drive by ID */
export async function deleteFromDrive(fileId: string): Promise<void> {
  const drive = getDriveClient();
  await drive.files.delete({ fileId });
}
