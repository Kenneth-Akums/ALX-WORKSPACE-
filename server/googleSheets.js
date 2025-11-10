import { google } from "googleapis";
import path from "path";
import "dotenv/config"; // Make sure .env variables are loaded

// Path to your service account key file
const KEY_FILE_PATH = path.join(import.meta.dirname, "google-credentials.json");

// Your Google Sheet ID from the .env file
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

// Define the scopes for the Google Sheets API
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

// Function to authenticate and get a Google Sheets API client
async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE_PATH,
    scopes: SCOPES,
  });
  const authClient = await auth.getClient();
  return google.sheets({ version: "v4", auth: authClient });
}

// Data to be sent from the frontend
// (TypeScript interface removed)

/**
 * Appends a new booking row to the Google Sheet.
 */
export async function appendBooking(data) { // Type annotation removed
  if (!SPREADSHEET_ID) {
    console.error("GOOGLE_SHEET_ID is not set in .env file.");
    throw new Error("Google Sheet configuration is missing.");
  }

  try {
    const sheets = await getSheetsClient();
    const timestamp = new Date().toISOString();

    const values = [
      [
        data.email,
        data.hubId,
        data.seatNumber,
        data.bookingDate,
        timestamp,
      ],
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Bookings!A:E", // Assumes your sheet is named "Bookings"
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: values,
      },
    });
    
    console.log("Appended data to Google Sheet successfully.");
    return { success: true };

  } catch (err) {
    console.error("Error appending data to Google Sheet:", err);
    throw new Error("Failed to save booking to Google Sheet.");
  }
}