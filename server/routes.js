import { createServer } from "http";
import { appendBooking, isEmailApproved } from "./googleSheets.js"; // Updated import

export async function registerRoutes(app) { // Types removed
  // --- This is your original code ---
  const httpServer = createServer(app);

  app.post("/api/verify-email", async (req, res, next) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required." });
      }
      
      // Call our new Google Sheets function
      const isVerified = await isEmailApproved(email);
      
      // Send back the result
      res.json({ isVerified: isVerified });

    } catch (err) {
      next(err);
    }
  });
  
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

      // 4. Send success response
      res.status(201).json({ success: true, data: req.body });

    } catch (err) {
      // Pass error to the Express error handler
      next(err);
    }
  });
  return httpServer;
}