import express from "express";
import cors from "cors";
import { registerRoutes } from "./routes.js";

// Set a port for our API server
const PORT = 3001;

const app = express();

// --- Middleware ---
// Allow our React app (on port 5173) to talk to this server
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
// Parse JSON bodies (for req.body)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --- Register All Routes ---
// This function will add your /api/book-seat route
registerRoutes(app);

// --- Error Handler ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`[server] API server listening on http://localhost:${PORT}`);
});