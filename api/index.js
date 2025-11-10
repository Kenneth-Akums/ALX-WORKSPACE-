import express from "express";
import cors from "cors";
import "dotenv/config";
import { google } from "googleapis";
import path from "path";
import { fileURLToPath } from "url";

// --- START: express setup ---
const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --- START: googleSheets.js logic ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Look for credentials in the *current* /api folder
const KEY_FILE_PATH = path.join(__dirname, "google-credentials.json");

const BOOKINGS_SHEET_ID = process.env.BOOKINGS_SHEET_ID;
const LEARNERS_SHEET_ID = process.env.LEARNERS_SHEET_ID;
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE_PATH,
    scopes: SCOPES,
  });
  const authClient = await auth.getClient();
  return google.sheets({ version: "v4", auth: authClient });
}

async function isEmailApproved(email) {
  if (!LEARNERS_SHEET_ID) {
    console.error("LEARNERS_SHEET_ID is not set.");
    throw new Error("Learner Sheet configuration is missing.");
  }
  try {
    const sheets = await getSheetsClient();
    const range = "ApprovedLearners!A:A";
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: LEARNERS_SHEET_ID,
      range: range,
    });
    const values = response.data.values;
    if (!values || values.length === 0) return false;
    const approvedEmails = values.flat().map(e => e.toLowerCase());
    return approvedEmails.includes(email.toLowerCase());
  } catch (err) {
    console.error("Error checking email in Google Sheet:", err);
    throw new Error(err.message || "Failed to check email.");
  }
}

async function appendBooking(data) {
  if (!BOOKINGS_SHEET_ID) {
    console.error("BOOKINGS_SHEET_ID is not set.");
    throw new Error("Booking Sheet configuration is missing.");
  }
  try {
    const sheets = await getSheetsClient();
    const timestamp = new Date().toISOString();
    const values = [[ data.email, data.hubId, data.seatNumber, data.bookingDate, timestamp ]];
    await sheets.spreadsheets.values.append({
      spreadsheetId: BOOKINGS_SHEET_ID,
      range: "Bookings!A:E",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: values },
    });
    return { success: true };
  } catch (err) {
    console.error("Error appending data to Google Sheet:", err);
    throw new Error(err.message || "Failed to save booking.");
  }
}
// --- END: googleSheets.js logic ---


// --- START: routes.js logic ---
app.post("/api/verify-email", async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }
    const isVerified = await isEmailApproved(email);
    res.json({ isVerified: isVerified });
  } catch (err) {
    next(err);
  }
});

app.post("/api/book-seat", async (req, res, next) => {
  try {
    const { email, hubId, seatNumber, bookingDate } = req.body;
    if (!email || !hubId || !seatNumber || !bookingDate) {
      return res.status(400).json({ message: "Missing required booking data." });
    }
    await appendBooking({ email, hubId, seatNumber, bookingDate });
    res.status(201).json({ success: true, data: req.body });
  } catch (err) {
    next(err);
  }
});
// --- END: routes.js logic ---


// --- Error Handler ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

// --- Vercel Export ---
// This is the most important part!
// It exports the express app as the default serverless function.
export default app;