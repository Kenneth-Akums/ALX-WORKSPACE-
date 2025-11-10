import { randomUUID } from "crypto";

export class MemStorage {
  approvedLearners;
  bookings;

  constructor() {
    this.approvedLearners = new Map();
    this.bookings = new Map();
    
    // TODO: Remove mock data - seed with some approved learners for testing
    const mockLearners = [
      { id: randomUUID(), email: "learner@alx.com", name: "Test Learner" },
      { id: randomUUID(), email: "student@alx.com", name: "Test Student" },
    ];
    
    mockLearners.forEach(learner => {
      this.approvedLearners.set(learner.email.toLowerCase(), learner);
    });
  }

  async isLearnerApproved(email) {
    return this.approvedLearners.has(email.toLowerCase());
  }

  async createBooking(insertBooking) {
    const id = randomUUID();
    const booking = {
      ...insertBooking,
      id,
      createdAt: new Date(),
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async getBookingsByDate(date) {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.bookingDate === date,
    );
  }

  async getBookedSeatsByDate(date) {
    const bookings = await this.getBookingsByDate(date);
    return bookings.map(b => b.seatNumber);
  }
}

export const storage = new MemStorage();