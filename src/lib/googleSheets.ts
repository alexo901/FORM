import { google } from "googleapis";

function getAuth() {
  const privateKey = (process.env.GOOGLE_PRIVATE_KEY || "").replace(
    /\\n/g,
    "\n"
  );
  const credentials = {
    email: process.env.GOOGLE_CLIENT_EMAIL || "",
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  };
  return new google.auth.JWT(credentials);
}

export function getSheetsClient() {
  return google.sheets({ version: "v4", auth: getAuth() });
}

export const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID || "";
export const SHEET_NAME = "Submissions";

const HEADERS = [
  "ID",
  "Login ID",
  "Full Name",
  "Address",
  "Email",
  "Mobile",
  "Date of Birth",
  "Amount",
  "Bank Name",
  "Transfer Option",
  "Status",
  "Verification Link",
  "Submitted At",
];

export async function ensureSheetHeaders() {
  if (!SPREADSHEET_ID) return;
  try {
    const sheets = getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:M1`,
    });
    const rows = res.data.values;
    if (!rows || rows.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1`,
        valueInputOption: "RAW",
        requestBody: { values: [HEADERS] },
      });
    }
  } catch {
    // silently ignore
  }
}

export async function appendToSheet(data: {
  id: number;
  loginId: string;
  fullName: string;
  address: string;
  email: string;
  mobile: string;
  dateOfBirth: string;
  amount: string;
  bankName: string;
  transferOption: string;
  status: string;
  verificationLink: string;
  createdAt: string;
}): Promise<number> {
  if (!SPREADSHEET_ID) return -1;
  const sheets = getSheetsClient();
  await ensureSheetHeaders();

  const values = [
    [
      data.id,
      data.loginId,
      data.fullName,
      data.address,
      data.email,
      data.mobile,
      data.dateOfBirth,
      data.amount,
      data.bankName,
      data.transferOption,
      data.status,
      data.verificationLink,
      data.createdAt,
    ],
  ];

  const res = await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A1`,
    valueInputOption: "USER_ENTERED",
    includeValuesInResponse: true,
    requestBody: { values },
  });

  const updatedRange = res.data.updates?.updatedRange || "";
  const match = updatedRange.match(/!A(\d+)/);
  return match ? parseInt(match[1], 10) : -1;
}

export async function updateSheetRow(
  rowIndex: number,
  data: {
    loginId: string;
    fullName: string;
    address: string;
    email: string;
    mobile: string;
    dateOfBirth: string;
    amount: string;
    bankName: string;
    transferOption: string;
    status: string;
    verificationLink: string;
    createdAt: string;
  }
) {
  if (!SPREADSHEET_ID || rowIndex < 2) return;
  const sheets = getSheetsClient();

  const values = [
    [
      "",
      data.loginId,
      data.fullName,
      data.address,
      data.email,
      data.mobile,
      data.dateOfBirth,
      data.amount,
      data.bankName,
      data.transferOption,
      data.status,
      data.verificationLink,
      data.createdAt,
    ],
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!B${rowIndex}:M${rowIndex}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });
}

export async function updateVerificationStatus(
  rowIndex: number,
  status: string,
  verificationLink: string
) {
  if (!SPREADSHEET_ID || rowIndex < 2) return;
  const sheets = getSheetsClient();

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!K${rowIndex}:L${rowIndex}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [[status, verificationLink]] },
  });
}
