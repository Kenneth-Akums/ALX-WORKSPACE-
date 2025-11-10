import express from "express";
import cors from "cors";
import "dotenv/config";
import { google } from "googleapis";
// We no longer need 'path' or 'fileURLToPath'
// import path from "path";
// import { fileURLToPath } from "url";

// --- START: express setup ---
const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  "https://alx-workspace-cyan.vercel.app"
];
app.use(cors({ 
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }, 
  credentials: true 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --- START: googleSheets.js logic ---

// --- NEW AUTHENTICATION METHOD ---
// Read keys directly from Vercel's environment variables
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;
// --- END NEW AUTHENTICATION METHOD ---

const BOOKINGS_SHEET_ID = process.env.BOOKINGS_SHEET_ID;
const LEARNERS_SHEET_ID = process.env.LEARNERS_SHEET_ID;
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

async function getSheetsClient() {
  // --- NEW DEBUG LOGGING ---
  console.log("Checking for Google auth variables...");
  if (!GOOGLE_CLIENT_EMAIL) {
    console.error("GOOGLE_CLIENT_EMAIL is NOT SET.");
  }
  if (!GOOGLE_PRIVATE_KEY) {
    console.error("GOOGLE_PRIVATE_KEY is NOT SET.");
  }
  // --- END DEBUG LOGGING ---

  if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    console.error("Missing Google auth environment variables");
    throw new Error("Server auth configuration error.");
  }

  // Parse the private key correctly, handling newlines
  const privateKey = GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
  
  const auth = new google.auth.JWT({
    email: GOOGLE_CLIENT_EMAIL,
    key: privateKey,
    scopes: SCOPES
  });

  await auth.authorize(); // Authorize the client
  return google.sheets({ version: "v4", auth });
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
export default app;