import { SheetLogRecord } from '../types';

export interface SpreadsheetMetadata {
  spreadsheetId: string;
  title: string;
  spreadsheetUrl: string;
  sheetNames: string[];
}

/**
 * Creates a dedicated Product Photography Catalog spreadsheet in the user's Google Drive.
 */
export async function createProductCatalogSpreadsheet(
  accessToken: string,
  customTitle?: string
): Promise<SpreadsheetMetadata> {
  const title = customTitle || `Product Photo Edits Catalog - ${new Date().toLocaleDateString()}`;

  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        {
          properties: {
            title: 'Photo Edits Log',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
          data: [
            {
              startRow: 0,
              startColumn: 0,
              rowData: [
                {
                  values: [
                    { userEnteredValue: { stringValue: 'Product Name' } },
                    { userEnteredValue: { stringValue: 'Editing Instruction / Prompt' } },
                    { userEnteredValue: { stringValue: 'Timestamp' } },
                    { userEnteredValue: { stringValue: 'Edit Status' } },
                    { userEnteredValue: { stringValue: 'Aspect Ratio' } },
                    { userEnteredValue: { stringValue: 'AI Model' } },
                    { userEnteredValue: { stringValue: 'Notes / Tags' } },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Failed to create spreadsheet (${response.status})`);
  }

  const data = await response.json();
  return {
    spreadsheetId: data.spreadsheetId,
    title: data.properties?.title || title,
    spreadsheetUrl: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}`,
    sheetNames: (data.sheets || []).map((s: any) => s.properties?.title || 'Sheet1'),
  };
}

/**
 * Appends a product photo edit entry to the specified Google Sheet.
 */
export async function appendEditLog(
  accessToken: string,
  spreadsheetId: string,
  entry: {
    productName: string;
    promptInstruction: string;
    status: string;
    aspectRatio: string;
    modelUsed?: string;
    notes?: string;
  }
): Promise<{ updatedRows: number }> {
  // First, verify sheet exists or get first sheet name
  const meta = await getSpreadsheetMetadata(accessToken, spreadsheetId);
  const targetSheetName = meta.sheetNames[0] || 'Sheet1';

  const range = `'${targetSheetName}'!A:G`;
  const timestamp = new Date().toLocaleString();

  const values = [
    [
      entry.productName || 'Unnamed Product',
      entry.promptInstruction,
      timestamp,
      entry.status || 'Cleaned',
      entry.aspectRatio || '1:1',
      entry.modelUsed || 'gemini-3.1-flash-image-preview',
      entry.notes || 'Exported from Photo Clean App',
    ],
  ];

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
    spreadsheetId
  )}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Failed to append row to spreadsheet (${response.status})`);
  }

  const data = await response.json();
  return { updatedRows: data.updates?.updatedRows || 1 };
}

/**
 * Fetches metadata of an existing Google Sheet.
 */
export async function getSpreadsheetMetadata(
  accessToken: string,
  spreadsheetId: string
): Promise<SpreadsheetMetadata> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Spreadsheet not found or inaccessible (${response.status})`);
  }

  const data = await response.json();
  return {
    spreadsheetId: data.spreadsheetId,
    title: data.properties?.title || 'Google Sheet',
    spreadsheetUrl: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}`,
    sheetNames: (data.sheets || []).map((s: any) => s.properties?.title || 'Sheet1'),
  };
}

/**
 * Reads logged rows from the sheet.
 */
export async function readRecentLogs(
  accessToken: string,
  spreadsheetId: string,
  limit: number = 20
): Promise<string[][]> {
  const meta = await getSpreadsheetMetadata(accessToken, spreadsheetId);
  const targetSheetName = meta.sheetNames[0] || 'Sheet1';
  const range = `'${targetSheetName}'!A2:G${limit + 2}`;

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
    spreadsheetId
  )}/values/${encodeURIComponent(range)}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return data.values || [];
}
