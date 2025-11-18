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
//       email: row[0] || '',       // Column A
//       hubId: row[4] || '',       // Column E
//       seatNumber: Number(row[5] || 0), // Column F
//       bookingDate: row[6] || '', // Column G
//       timestamp: row[7] || '',   // Column H
//       bookingStatus: row[8] || 'Booked', // Column I
//       bookingNotification: row[9] || 'NO' // Column J
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

// --- START: express setup ---
const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://alx-workspace-cyan.vercel.app" // Your Vercel URL
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

/**
 * Authenticates and returns a Google Sheets API client
 */
async function getSheetsClient() {
  console.log("Checking for Google auth variables...");
  if (!GOOGLE_CLIENT_EMAIL) {
    console.error("GOOGLE_CLIENT_EMAIL is NOT SET.");
  }
  if (!GOOGLE_PRIVATE_KEY) {
    console.error("GOOGLE_PRIVATE_KEY is NOT SET.");
  }

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

/**
 * --- UPDATED FOR "Welcome, Name" ---
 * Checks if an email exists and returns the user's name.
 */
export async function isEmailApproved(email) {
  if (!LEARNERS_SHEET_ID) {
    console.error("LEARNERS_SHEET_ID is not set.");
    throw new Error("Learner Sheet configuration is missing.");
  }
  try {
    const sheets = await getSheetsClient();
    // --- NEW: Read columns A and B ---
    const range = "ApprovedLearners!A:B";
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: LEARNERS_SHEET_ID,
      range: range,
    });
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
 * Fetches all bookings from the "Bookings" sheet.
 */
export async function getAllBookings() {
  if (!BOOKINGS_SHEET_ID) {
    console.error("BOOKINGS_SHEET_ID is not set.");
    throw new Error("Booking Sheet configuration is missing.");
  }
  try {
    const sheets = await getSheetsClient();
    const range = "Bookings!A:J"; // Get all data up to Column J
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: BOOKINGS_SHEET_ID,
      range: range,
    });
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
    return values.slice(1).map((row, index) => ({
      rowIndex: index + 2, 
      email: row[0] || '',
      hubId: row[4] || '',
      seatNumber: Number(row[5] || 0),
      bookingDate: row[6] || '',
      // --- CHANGED: Column H is now Booking Time ---
      bookingTime: row[7] || '', 
      bookingStatus: row[8] || 'Booked',
      bookingNotification: row[9] || ''
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
    
    // Writes `null` to B, C, D to preserve your formulas
    const values = [[ 
      data.email,      // A: Email
      null,              // B: Name (preserves formula)
      null,              // C: Program (preserves formula)
      null,              // D: Phone (preserves formula)
      data.hubId,      // E: Hub
      data.seatNumber, // F: SeatNumber
      data.bookingDate,  // G: BookingDate
      data.bookingTime,         // H: Timestamp
      "Booked",          // I: BookingStatus
      ""               // J: BookingNotification
    ]];
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: BOOKINGS_SHEET_ID,
      range: "Bookings!A:J", // Write to all 10 columns
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

/**
 * GET /api/get-bookings
 */


export async function cancelBooking(email, date) {
  try {
    const bookings = await getAllBookings();
    
    const bookingToCancel = bookings.find(b => 
      b.email.toLowerCase() === email.toLowerCase() && 
      b.bookingDate === date &&
      b.bookingStatus === "Booked"
    );

    if (!bookingToCancel) {
      throw new Error("No active booking found to cancel.");
    }

    const sheets = await getSheetsClient();
    const range = `Bookings!I${bookingToCancel.rowIndex}`; // Column I is Status
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: BOOKINGS_SHEET_ID,
      range: range,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [["Cancelled"]] }
    });

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
    const { email, hubId, seatNumber, bookingDate, bookingTime } = req.body;
    if (!email || !hubId || !seatNumber || !bookingDate || !bookingTime) {
      return res.status(400).json({ message: "Missing required booking data." });
    }

    const seatNum = Number(seatNumber);

    console.log("Checking for conflicts...");
    const allBookings = await getAllBookings();

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
    await appendBooking({ email, hubId, seatNumber: seatNum, bookingDate, bookingTime });
    
    res.status(201).json({ success: true, data: req.body });

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