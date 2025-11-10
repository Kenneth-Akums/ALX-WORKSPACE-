import { google } from "googleapis";
import path from "path";
import "dotenv/config"; // Make sure .env variables are loaded
import { fileURLToPath } from "url"; // Import this built-in Node.js helper


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const KEY_FILE_PATH = path.join(__dirname, "google-credentials.json");

    
// const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const BOOKINGS_SHEET_ID = process.env.BOOKINGS_SHEET_ID;
const LEARNERS_SHEET_ID = process.env.LEARNERS_SHEET_ID;

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

export async function isEmailApproved(email) {
  // --- UPDATED ---
  if (!LEARNERS_SHEET_ID) {
    console.error("LEARNERS_SHEET_ID is not set in .env file.");
    throw new Error("Learner Sheet configuration is missing.");
  }
  // --- END UPDATE ---

  try {
    const sheets = await getSheetsClient();
    // This assumes your "Learners" sheet has a tab named "Approved_Learners"
    const range = "Approved_Learners!A:A"; 

    const response = await sheets.spreadsheets.values.get({
      // --- UPDATED ---
      spreadsheetId: LEARNERS_SHEET_ID,
      // --- END UPDATE ---
      range: range,
    });

    const values = response.data.values;
    if (!values || values.length === 0) {
      console.log("No approved learners found in sheet.");
      return false; // Sheet is empty or no data
    }

    // Flatten array (e.g., [['a@b.com'], ['c@d.com']])
    // and convert to lowercase for case-insensitive matching
    const approvedEmails = values.flat().map(e => e.toLowerCase());
    
    // Check if the email exists in the list
    return approvedEmails.includes(email.toLowerCase());

  } catch (err) {
    console.error("Error checking email in Google Sheet:", err);
    // Re-throw the original error to be caught by the route handler
    throw new Error(err.message || "Failed to check email in Google Sheet.");
  }
}


export async function appendBooking(data) { // Type annotation removed
  if (!BOOKINGS_SHEET_ID) {
    console.error("BOOKINGS_SHEET_ID is not set in .env file.");
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
      spreadsheetId: BOOKINGS_SHEET_ID,
      range: "Bookings!A:E", 
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: values,
      },
    });
    
    console.log("Appended data to Google Sheet successfully.");
    return { success: true };

  } catch (err) {
    console.error("Error appending data to Google Sheet:", err);
    throw new Error(err.message || "Failed to save booking to Google Sheet.");
  }
}