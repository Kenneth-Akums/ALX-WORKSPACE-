// import express from "express";
// import cors from "cors";
// import "dotenv/config";
// import { google } from "googleapis";
// import path from "path";
// import { fileURLToPath } from "url";

// // --- START: express setup ---
// const app = express();

// // Allow both your local dev server AND your deployed Vercel app
// const allowedOrigins = [
//   "http://localhost:5173",
//   "https://alx-workspace-cyan.vercel.app" // Your Vercel URL
// ];
// app.use(cors({ 
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   }, 
//   credentials: true 
// }));

// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// // --- END: express setup ---


// // --- START: googleSheets.js logic ---

// // Auth variables
// const BOOKINGS_SHEET_ID = process.env.BOOKINGS_SHEET_ID;
// const LEARNERS_SHEET_ID = process.env.LEARNERS_SHEET_ID;
// const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
// const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;
// const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

// /**
//  * Authenticates and returns a Google Sheets API client
//  */
// async function getSheetsClient() {
//   // --- NEW: Debug logging ---
//   console.log("Checking for Google auth variables...");
//   if (!GOOGLE_CLIENT_EMAIL) {
//     console.error("GOOGLE_CLIENT_EMAIL is NOT SET.");
//   }
//   if (!GOOGLE_PRIVATE_KEY) {
//     console.error("GOOGLE_PRIVATE_KEY is NOT SET.");
//   }
//   // --- END DEBUG ---

//   if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY) {
//     console.error("Missing Google auth environment variables");
//     throw new Error("Server auth configuration error.");
//   }
  
//   // Parse the private key correctly, handling newlines
//   const privateKey = GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
  
//   const auth = new google.auth.JWT({
//     email: GOOGLE_CLIENT_EMAIL,
//     key: privateKey,
//     scopes: SCOPES
//   });

//   await auth.authorize(); // Authorize the client
//   return google.sheets({ version: "v4", auth });
// }

// /**
//  * Checks if an email exists in the 'ApprovedLearners' sheet.
//  */
// export async function isEmailApproved(email) {
//   if (!LEARNERS_SHEET_ID) {
//     console.error("LEARNERS_SHEET_ID is not set.");
//     throw new Error("Learner Sheet configuration is missing.");
//   }
//   try {
//     const sheets = await getSheetsClient();
//     const range = "ApprovedLearners!A:A";
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: LEARNERS_SHEET_ID,
//       range: range,
//     });
//     const values = response.data.values;
//     if (!values || values.length === 0) return false;
//     const approvedEmails = values.flat().map(e => e.toLowerCase());
//     return approvedEmails.includes(email.toLowerCase());
//   } catch (err) {
//     console.error("Error checking email in Google Sheet:", err);
//     throw new Error(err.message || "Failed to check email.");
//   }
// }

// /**
//  * Fetches all bookings from the "Bookings" sheet.
//  */
// export async function getAllBookings() {
//   if (!BOOKINGS_SHEET_ID) {
//     console.error("BOOKINGS_SHEET_ID is not set.");
//     throw new Error("Booking Sheet configuration is missing.");
//   }
//   try {
//     const sheets = await getSheetsClient();
//     const range = "Bookings!A:J"; // Get all data
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: BOOKINGS_SHEET_ID,
//       range: range,
//     });
//     const values = response.data.values;
    
//     if (!values || values.length <= 1) { // <= 1 to account for header row
//       return []; // No bookings found
//     }

//     // Skip the header row (row[0]) and map the rest
//     return values.slice(1).map(row => ({
//       email: row[0] || '',
//       hubId: row[1] || '',
//       seatNumber: Number(row[2] || 0), // Ensure this is a number
//       bookingDate: row[3] || '',
//       timestamp: row[4] || ''
//     }));
//   } catch (err) {
//     console.error("Error fetching all bookings:", err);
//     throw new Error(err.message || "Failed to fetch bookings.");
//   }
// }

// /**
//  * Appends a new booking row to the Google Sheet.
//  */
// export async function appendBooking(data) {
//   if (!BOOKINGS_SHEET_ID) {
//     console.error("BOOKINGS_SHEET_ID is not set.");
//     throw new Error("Booking Sheet configuration is missing.");
//   }
//   try {
//     const sheets = await getSheetsClient();
//     const timestamp = new Date().toISOString();
//     const values = [[ data.email, data.hubId, data.seatNumber, data.bookingDate, timestamp ]];
//     await sheets.spreadsheets.values.append({
//       spreadsheetId: BOOKINGS_SHEET_ID,
//       range: "Bookings!A:E",
//       valueInputOption: "USER_ENTERED",
//       requestBody: { values: values },
//     });
//     return { success: true };
//   } catch (err) {
//     console.error("Error appending data to Google Sheet:", err);
//     throw new Error(err.message || "Failed to save booking.");
//   }
// }
// // --- END: googleSheets.js logic ---


// // --- START: routes.js logic ---

// /**
//  * GET /api/get-bookings
//  * Fetches all bookings to populate the frontend UI.
//  */
// app.get("/api/get-bookings", async (req, res, next) => {
//   try {
//     const bookings = await getAllBookings();
//     res.json(bookings);
//   } catch (err) {
//     next(err);
//   }
// });

// /**
//  * POST /api/verify-email
//  * Checks if an email is on the approved list.
//  */
// app.post("/api/verify-email", async (req, res, next) => {
//   try {
//     const { email } = req.body;
//     if (!email) {
//       return res.status(400).json({ message: "Email is required." });
//     }
//     const isVerified = await isEmailApproved(email);
//     res.json({ isVerified: isVerified });
//   } catch (err) {
//     next(err);
//   }
// });

// /**
//  * POST /api/book-seat
//  * Creates a new booking *after* checking for conflicts.
//  */
// app.post("/api/book-seat", async (req, res, next) => {
//   try {
//     const { email, hubId, seatNumber, bookingDate } = req.body;
//     if (!email || !hubId || !seatNumber || !bookingDate) {
//       return res.status(400).json({ message: "Missing required booking data." });
//     }

//     // --- THIS IS THE FIX ---
//     // 1. Convert incoming seat to a number
//     const seatNum = Number(seatNumber);

//     // 2. Re-fetch all bookings NOW to get the latest data
//     console.log("Checking for conflicts...");
//     const allBookings = await getAllBookings();

//     // 3. Check for conflict
//     const isConflict = allBookings.find(
//       b =>
//         b.hubId === hubId &&
//         b.bookingDate === bookingDate &&
//         b.seatNumber === seatNum // Strict number-to-number check
//     );

//     if (isConflict) {
//       console.log("Conflict found! Seat already taken.");
//       // 409 Conflict: The request could not be completed due to a conflict
//       return res.status(409).json({ message: "This seat has just been taken. Please select another." });
//     }
//     // --- END FIX ---

//     // 4. If no conflict, append the new booking
//     console.log("No conflict. Appending booking...");
//     await appendBooking({ email, hubId, seatNumber: seatNum, bookingDate });
    
//     res.status(201).json({ success: true, data: req.body });

//   } catch (err) {
//     next(err);
//   }
// });
// // --- END: routes.js logic ---


// // --- Error Handler ---
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   const status = err.status || 500;
//   const message = err.message || "Internal Server Error";
//   res.status(status).json({ message });
// });

// // --- Vercel Export ---
// export default app;


import express from "express";
import cors from "cors";
import "dotenv/config";
import { google } from "googleapis";
import path from "path";
import { fileURLToPath } from "url";

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
// --- END: express setup ---


// --- START: googleSheets.js logic ---

// Auth variables
const BOOKINGS_SHEET_ID = process.env.BOOKINGS_SHEET_ID;
const LEARNERS_SHEET_ID = process.env.LEARNERS_SHEET_ID;
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

// --- Token caching and retry configuration (works on serverless warm instances) ---
let cachedJwtClient = null;
let cachedAccessToken = null;
let tokenExpiry = 0; // epoch ms when token expires
const TOKEN_EXPIRY_BUFFER_MS = 60 * 1000; // refresh if within 60s of expiry
const AUTHORIZE_MAX_RETRIES = 3;
const READ_MAX_RETRIES = 3;
const READ_BASE_DELAY_MS = 250; // ms

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isRetryableError(err) {
  if (!err) return false;
  // Network errors
  if (err.code && (err.code === 'ETIMEDOUT' || err.code === 'ECONNRESET' || err.code === 'ENOTFOUND')) return true;
  // HTTP status codes from Google API
  const status = err?.response?.status || err?.status;
  if (status === 429) return true; // rate limit
  if (status >= 500 && status < 600) return true; // server errors
  return false;
}

function getJwtClient() {
  if (cachedJwtClient) return cachedJwtClient;
  if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    throw new Error('Missing Google auth configuration for JWT creation');
  }
  const privateKey = GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
  cachedJwtClient = new google.auth.JWT({
    email: GOOGLE_CLIENT_EMAIL,
    key: privateKey,
    scopes: SCOPES
  });
  return cachedJwtClient;
}

async function ensureAuthorized() {
  const client = getJwtClient();
  const now = Date.now();
  if (cachedAccessToken && tokenExpiry && now < tokenExpiry - TOKEN_EXPIRY_BUFFER_MS) {
    return cachedAccessToken;
  }

  // Try to authorize with limited retries on transient errors
  let attempt = 0;
  let lastErr = null;
  while (attempt < AUTHORIZE_MAX_RETRIES) {
    try {
      const resp = await client.authorize();
      if (!resp || !resp.access_token) {
        throw new Error('No access_token received from authorize');
      }
      cachedAccessToken = resp.access_token;
      // resp.expiry_date may be absolute ms since epoch or undefined; fallback to 1 hour
      if (resp.expiry_date && typeof resp.expiry_date === 'number') {
        tokenExpiry = resp.expiry_date;
      } else {
        tokenExpiry = Date.now() + (60 * 60 * 1000);
      }
      return cachedAccessToken;
    } catch (err) {
      lastErr = err;
      attempt += 1;
      const delay = READ_BASE_DELAY_MS * Math.pow(2, attempt - 1);
      console.error(`ensureAuthorized attempt ${attempt} failed:`, err && (err.message || err));
      if (attempt >= AUTHORIZE_MAX_RETRIES || !isRetryableError(err)) break;
      await sleep(delay);
    }
  }
  console.error('Failed to authorize Google JWT after retries', lastErr);
  throw lastErr || new Error('Failed to authorize Google client');
}

async function getSheetsClient() {
  // Ensure client exists and is authorized (this keeps token requests minimal)
  await ensureAuthorized();
  const client = getJwtClient();
  return google.sheets({ version: 'v4', auth: client });
}

async function readWithRetries(fn, options = {}) {
  const maxRetries = options.maxRetries || READ_MAX_RETRIES;
  let attempt = 0;
  let lastErr = null;
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      attempt += 1;
      const status = err?.response?.status || err?.status;
      console.error(`readWithRetries attempt ${attempt} failed:`, err && (err.message || err), 'status:', status);
      if (attempt >= maxRetries || !isRetryableError(err)) break;
      const delay = READ_BASE_DELAY_MS * Math.pow(2, attempt - 1);
      await sleep(delay);
    }
  }
  throw lastErr || new Error('Read failed after retries');
}
/** (getSheetsClient is implemented above with token caching and retries) */
/**
 * Checks if an email exists in the 'ApprovedLearners' sheet.
 */
export async function isEmailApproved(email) {
  if (!LEARNERS_SHEET_ID) {
    console.error("LEARNERS_SHEET_ID is not set.");
    throw new Error("Learner Sheet configuration is missing.");
  }
  try {
    const sheets = await getSheetsClient();
    // Read both Email (A) and Name (B)
    const range = "ApprovedLearners!A:B";
    const response = await readWithRetries(() => sheets.spreadsheets.values.get({
      spreadsheetId: LEARNERS_SHEET_ID,
      range: range,
    }));
    const values = response.data.values;
    if (!values || values.length === 0) {
      return { isVerified: false, name: null };
    }

    // Find the matching row
    const emailToFind = email.toLowerCase();
    const userRow = values.find(row => (row[0] || '').toLowerCase() === emailToFind);

    if (userRow) {
      // Found the user
      return { isVerified: true, name: userRow[1] || null }; // Return name from Column B
    } else {
      // User not found
      return { isVerified: false, name: null };
    }
  } catch (err) {
    console.error("Error checking email in Google Sheet:", err);
    throw new Error(err.message || "Failed to check email.");
  }
}

/**
 * --- UPDATED: Reads BookingStatus from Column I ---
 * Fetches all bookings from the "Bookings" sheet.
 */
export async function getAllBookings() {
  if (!BOOKINGS_SHEET_ID) {
    console.error("BOOKINGS_SHEET_ID is not set.");
    throw new Error("Booking Sheet configuration is missing.");
  }
  try {
    const sheets = await getSheetsClient();
    const range = "Bookings!A:M"; // Get all data up to Column M (includes clientBookingId and serverBookingId)
    const response = await readWithRetries(() => sheets.spreadsheets.values.get({
      spreadsheetId: BOOKINGS_SHEET_ID,
      range: range,
    }));
    const values = response.data.values;
    
    if (!values || values.length <= 1) { // <= 1 to account for header row
      return []; // No bookings found
    }

    // Skip the header row (row[0]) and map the rest
    // return values.slice(1).map(row => ({
    //   email: row[0] || '',       // Column A
    //   hubId: row[4] || '',       // Column E
    //   seatNumber: Number(row[5] || 0), // Column F
    //   bookingDate: row[6] || '', // Column G
    //   timestamp: row[7] || '',   // Column H
    //   bookingStatus: row[8] || 'Booked', // Column I
    //   bookingNotification: row[9] || '' // Column J
    // Helper to parse common date formats and return yyyy-mm-dd
    const parseToISODate = (input) => {
      if (!input && input !== 0) return '';
      const s = String(input).trim();
      // yyyy-mm-dd
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
      // mm/dd/yyyy or m/d/yyyy
      const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
      if (us) {
        const mm = String(Number(us[1])).padStart(2, '0');
        const dd = String(Number(us[2])).padStart(2, '0');
        const yyyy = us[3];
        return `${yyyy}-${mm}-${dd}`;
      }
      // Try Date.parse fallback
      const parsed = new Date(s);
      if (!isNaN(parsed.getTime())) {
        const yyyy = parsed.getFullYear();
        const mm = String(parsed.getMonth() + 1).padStart(2, '0');
        const dd = String(parsed.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      }
      return s; // return original if unable to parse
    };

    return values.slice(1).map((row, index) => ({
      rowIndex: index + 2,
      email: (row[0] || '').toString().trim(),
      hubId: (row[4] || '').toString().trim(),
      seatNumber: Number(row[5] || 0),
      bookingDate: parseToISODate(row[6] || ''),
      // --- CHANGED: Column H is now Booking Time ---
      bookingTime: (row[7] || '').toString().trim(),
      bookingStatus: (row[8] || 'Booked').toString().trim(),
      clientBookingId: (row[11] || '').toString().trim(), // Column L
      serverBookingId: (row[12] || '').toString().trim() // Column M
    }));
  } catch (err) {
    console.error("Error fetching all bookings:", err);
    throw new Error(err.message || "Failed to fetch bookings.");
  }
}

/**
 * Appends a new booking row, preserving formulas and setting defaults.
 */
export async function appendBooking(data) {
  if (!BOOKINGS_SHEET_ID) {
    console.error("BOOKINGS_SHEET_ID is not set.");
    throw new Error("Booking Sheet configuration is missing.");
  }
  try {
    const sheets = await getSheetsClient();

    // Create a small server-side booking id to detect our own appended row during post-check
    const bookingId = data.bookingId || `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;

    // Writes `null` to B, C, D to preserve your formulas
    const clientBookingId = data.clientBookingId || data.bookingId || '';

    const values = [[
      data.email,      // A: Email
      null,            // B: Name (preserves formula)
      null,            // C: Program (preserves formula)
      null,            // D: Phone (preserves formula)
      data.hubId,      // E: Hub
      data.seatNumber, // F: SeatNumber
      data.bookingDate, // G: BookingDate
      data.bookingTime, // H: Timestamp
      "Booked",       // I: BookingStatus
      "",             // J: unused/reserved
      null,            // K: reserved
      clientBookingId, // L: client-supplied idempotency key
      bookingId        // M: serverBookingId (diagnostic)
    ]];

    // Do not retry writes automatically. If this append fails, bubble the error up for the caller.
    await sheets.spreadsheets.values.append({
      spreadsheetId: BOOKINGS_SHEET_ID,
      range: "Bookings!A:M", // Write to columns A-M
      valueInputOption: "USER_ENTERED",
      requestBody: { values: values },
    });

    // Post-append verification: ensure this seat is not double-booked. We fetch fresh bookings.
    const refreshed = await getAllBookings();
    const matches = refreshed.filter(b => b.hubId === data.hubId && b.seatNumber === Number(data.seatNumber) && b.bookingDate === data.bookingDate && b.bookingStatus === 'Booked');

    if (matches.length > 1) {
      // Find our appended row by clientBookingId (preferred) or bookingId (fallback)
      const ourRow = (clientBookingId && clientBookingId.trim())
        ? refreshed.find(r => (r.clientBookingId || '') === clientBookingId)
        : refreshed.find(r => (r.serverBookingId || '') === bookingId);
      // If our row exists and it's not the earliest (i.e., someone else already had this seat), roll back our row
      if (ourRow) {
        // Cancel the appended row to avoid double-booking
        await updateRowStatus(ourRow.rowIndex, 'Cancelled');
        console.error('appendBooking: concurrent booking detected, rolled back our row', { bookingId, clientBookingId, hubId: data.hubId, seatNumber: data.seatNumber, bookingDate: data.bookingDate });
        const e = new Error('Concurrent booking detected. Your booking was not saved. Please refresh and try again.');
        e.code = 'CONCURRENT_BOOKING';
        throw e;
      } else {
        // We couldn't identify our row — fail safe: alert
        console.error('appendBooking: duplicate booking detected but unable to find our appended row', { hubId: data.hubId, seatNumber: data.seatNumber, bookingDate: data.bookingDate });
        const e = new Error('Concurrent booking detected. Please refresh and try again.');
        e.code = 'CONCURRENT_BOOKING';
        throw e;
      }
    }

    return { success: true };
  } catch (err) {
    console.error("Error appending data to Google Sheet:", err);
    throw new Error(err.message || "Failed to save booking.");
  }
}

/**
 * Updates column I (BookingStatus) for a specific rowIndex.
 */
async function updateRowStatus(rowIndex, status) {
  if (!BOOKINGS_SHEET_ID) throw new Error('Booking Sheet configuration is missing.');
  const sheets = await getSheetsClient();
  const range = `Bookings!I${rowIndex}`; // Column I
  await sheets.spreadsheets.values.update({
    spreadsheetId: BOOKINGS_SHEET_ID,
    range: range,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [[status]] }
  });
}
// --- END: googleSheets.js logic ---


// --- START: routes.js logic ---

/**
 * GET /api/get-bookings
 */


export async function cancelBooking(email, date) {
  try {
    const bookings = await getAllBookings();

    // Normalize inputs
    const targetEmail = (email || '').toLowerCase().trim();
    const targetDate = (date || '').trim();

    // Helper: parse common date formats into a Date object (date-only)
    const parseToDateOnly = (d) => {
      if (!d) return null;
      const s = String(d).trim();
      // yyyy-mm-dd
      const isoMatch = /^\d{4}-\d{2}-\d{2}$/.exec(s);
      if (isoMatch) {
        const [y, m, day] = s.split('-').map(Number);
        return new Date(y, m - 1, day);
      }
      // mm/dd/yyyy or m/d/yyyy
      const usMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
      if (usMatch) {
        const month = Number(usMatch[1]);
        const day = Number(usMatch[2]);
        const year = Number(usMatch[3]);
        return new Date(year, month - 1, day);
      }
      // Fallback: try Date.parse
      const parsed = new Date(s);
      if (!isNaN(parsed.getTime())) {
        return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
      }
      return null;
    };

    const targetDateObj = parseToDateOnly(targetDate);

    // Try to find a matching booking. Be forgiving with bookingStatus casing/whitespace
    const bookingToCancel = bookings.find(b => {
      const bEmail = (b.email || '').toLowerCase().trim();
      const bDateRaw = (b.bookingDate || '').toString().trim();
      const bStatus = (b.bookingStatus || '').toLowerCase().trim();

      // Parse both booking date and target date to date-only objects and compare numeric time
      const bDateObj = parseToDateOnly(bDateRaw);
      if (!bDateObj || !targetDateObj) return false;
      // Normalize to midnight and compare epoch
      bDateObj.setHours(0,0,0,0);
      targetDateObj.setHours(0,0,0,0);

      return bEmail === targetEmail && bDateObj.getTime() === targetDateObj.getTime() && bStatus === 'booked';
    });

    if (!bookingToCancel) {
      console.error('cancelBooking: no matching booked row found', { targetEmail, targetDate, bookingsCount: bookings.length });
      throw new Error("No active booking found to cancel.");
    }

    // Use shared helper to update booking status
    await updateRowStatus(bookingToCancel.rowIndex, 'Cancelled');

    return { success: true };
  } catch (err) {
    console.error("Error cancelling booking:", err);
    throw new Error(err.message || "Failed to cancel booking.");
  }
}






app.get("/api/get-bookings", async (req, res, next) => {
  try {
    const bookings = await getAllBookings();
    res.json(bookings);
  } catch (err) {
    next(err);
  }
});

/**
 * --- UPDATED FOR "Welcome, Name" ---
 * POST /api/verify-email
 * Now returns { isVerified, name }
 */
app.post("/api/verify-email", async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }
    // This now returns an object { isVerified, name }
    const verificationData = await isEmailApproved(email); 
    res.json(verificationData); // Send the whole object back
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/book-seat
 * Now includes BOTH conflict checks.
 */
// app.post("/api/book-seat", async (req, res, next) => {
//   try {
//     const { email, hubId, seatNumber, bookingDate } = req.body;
//     if (!email || !hubId || !seatNumber || !bookingDate) {
//       return res.status(400).json({ message: "Missing required booking data." });
//     }

//     const seatNum = Number(seatNumber);

//     console.log("Checking for conflicts...");
//     const allBookings = await getAllBookings();

//     // CHECK 1: Is this specific seat already "Booked"?
//     const seatConflict = allBookings.find(
//       b =>
//         b.hubId === hubId &&
//         b.bookingDate === bookingDate &&
//         b.seatNumber === seatNum &&
//         b.bookingStatus === "Booked" // Only a conflict if it's "Booked"
//     );

//     if (seatConflict) {
//       console.log("Conflict found! Seat already taken.");
//       return res.status(409).json({ message: "This seat has just been taken. Please select another." });
//     }
    
//     // CHECK 2: Has this *user* already "Booked" a seat on this *day*?
//     const userConflict = allBookings.find(
//       b =>
//         b.email.toLowerCase() === email.toLowerCase() &&
//         b.bookingDate === bookingDate &&
//         b.bookingStatus === "Booked"
//     );

//     if (userConflict) {
//       console.log("Conflict found! User already has a booking for this day.");
//       return res.status(409).json({ message: "You already have a booking for this day. You can only book one seat per day." });
//     }
    
//     console.log("No conflict. Appending booking...");
//     await appendBooking({ email, hubId, seatNumber: seatNum, bookingDate });
    
//     res.status(201).json({ success: true, data: req.body });

//   } catch (err) {
//     next(err);
//   }
// });

/**
 * POST /api/book-seat
 * Creates a new booking *after* checking for conflicts.
 */
app.post("/api/book-seat", async (req, res, next) => {
  try {
    const { email, hubId, seatNumber, bookingDate, bookingTime, clientBookingId } = req.body;
    if (!email || !hubId || !seatNumber || !bookingDate || !bookingTime) {
      return res.status(400).json({ message: "Missing required booking data." });
    }

    const seatNum = Number(seatNumber);


    console.log("Checking for conflicts...");
    const allBookings = await getAllBookings();

    // Idempotency: if client provided a clientBookingId, return existing booking if present
    if (clientBookingId && clientBookingId.trim()) {
      const existing = allBookings.find(b => (b.clientBookingId || '') === clientBookingId && b.bookingStatus === 'Booked');
      if (existing) {
        console.log('Idempotent request: clientBookingId already present, returning existing booking');
        return res.status(200).json({ success: true, existing });
      }
    }

    // CHECK 1: Has this *user* already "Booked" a seat on this *day* (at ANY hub)?
    const userConflict = allBookings.find(
      b =>
        b.email.toLowerCase() === email.toLowerCase() &&
        b.bookingDate === bookingDate &&
        b.bookingStatus === "Booked"
    );

    if (userConflict) {
      // THIS IS THE CONFLICT MESSAGE THAT SHOULD BLOCK ALL HUBS
      console.log("Conflict found! User already has a booking for this day.");
      return res.status(409).json({ message: "You already have a booking for this day. You can only book one seat per day." });
    }
    
    // CHECK 2: Is this specific seat already "Booked" by someone else?
    const seatConflict = allBookings.find(
      b =>
        b.hubId === hubId &&
        b.bookingDate === bookingDate &&
        b.seatNumber === seatNum &&
        b.bookingStatus === "Booked"
    );

    if (seatConflict) {
      console.log("Conflict found! Seat already taken.");
      return res.status(409).json({ message: "This seat has just been taken. Please select another." });
    }

    console.log("No conflict. Appending booking...");
    try {
      await appendBooking({ email, hubId, seatNumber: seatNum, bookingDate, bookingTime, clientBookingId });
      res.status(201).json({ success: true, data: req.body });
    } catch (err) {
      // If a concurrent booking was detected and we rolled back, surface as 409
      if (err && err.code === 'CONCURRENT_BOOKING') {
        return res.status(409).json({ message: err.message || 'Concurrent booking detected.' });
      }
      throw err;
    }

  } catch (err) {
    next(err);
  }
});

app.post("/api/cancel-booking", async (req, res, next) => {
  try {
    const { email, date } = req.body;
    if (!email || !date) {
      return res.status(400).json({ message: "Email and Date required." });
    }

    await cancelBooking(email, date);
    res.json({ success: true, message: "Booking cancelled successfully." });

  } catch (err) {
    next(err);
  }
});



// --- Error Handler ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

// --- Vercel Export ---
export default app;