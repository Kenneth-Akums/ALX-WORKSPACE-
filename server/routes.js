import { createServer } from "http";
import { storage } from "./storage.js"; // Updated import
import { appendBooking } from "./googleSheets.js"; // Updated import

export async function registerRoutes(app) { // Types removed
  // --- This is your original code ---
  const httpServer = createServer(app);
  
  // --- New Booking Endpoint ---
  app.post("/api/book-seat", async (req, res, next) => {
    try {
      const { email, hubId, seatNumber, bookingDate } = req.body;

      // 1. Validate data (basic)
      if (!email || !hubId || !seatNumber || !bookingDate) {
        return res.status(400).json({ message: "Missing required booking data." });
      }

      // 2. Save to Google Sheets
      await appendBooking({ email, hubId, seatNumber, bookingDate });

      // 3. Save to in-memory/DB storage (from your original storage.ts)
      const bookingData = {
        learnerEmail: email,
        hubId,
        seatNumber,
        bookingDate,
      };
      await storage.createBooking(bookingData);

      // 4. Send success response
      res.status(201).json({ success: true, data: bookingData });

    } catch (err) {
      // Pass error to the Express error handler
      next(err);
    }
  });


  // --- This is your original code ---
  return httpServer;
}