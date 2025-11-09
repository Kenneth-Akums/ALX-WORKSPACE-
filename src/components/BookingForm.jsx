import { useState } from "react";
import SeatGrid from "./SeatGrid";
import DaySelector from "./DaySelector";
import HubSelector, { HUBS } from "./HubSelector";
import BrandLogo from "./BrandLogo";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

// Import the new CSS files
import "./components.css"; // Shared component styles (card, button)
import "./BookingForm.css";  // Page-specific styles

export default function BookingForm({ email, onBookingComplete }) {
  const [selectedHub, setSelectedHub] = useState("costain");
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentHub = HUBS.find(h => h.id === selectedHub);
  const totalSeats = currentHub?.totalSeats || 50;

  // TODO: Replace with actual API call
  const bookedSeats = [3, 7, 12, 18, 25, 31, 42];
  
  const handleHubChange = (hubId) => {
    setSelectedHub(hubId);
    setSelectedSeat(null);
  };

  const handleSubmit = async () => {
    if (!selectedSeat) return;
    
    setIsSubmitting(true);
    console.log("Booking seat:", { email, seatNumber: selectedSeat, date: selectedDate, hubId: selectedHub });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    onBookingComplete(selectedSeat, selectedDate, selectedHub);
  };

  return (
    <div className="booking-page-container">
      <div className="booking-page-content">
        
        <div className="card">
          <div className="card-header card-header-welcome">
            <div className="card-logo">
              <BrandLogo />
            </div>
            <h1 className="card-title">
              Welcome, <span className="text-primary">{email}</span>
            </h1>
          </div>
        </div>

        <HubSelector
          selectedHub={selectedHub}
          onSelectHub={handleHubChange}
        />

        <DaySelector
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        <SeatGrid
          totalSeats={totalSeats}
          selectedSeat={selectedSeat}
          onSelectSeat={setSelectedSeat}
          bookedSeats={bookedSeats}
        />

        <div className="booking-page-footer">
          <button
            onClick={handleSubmit}
            disabled={!selectedSeat || isSubmitting}
            className="button button-primary button-lg"
            data-testid="button-confirm-booking"
          >
            {isSubmitting ? (
              <>
                <span className="spinner"><Loader2 /></span>
                <span>Confirming...</span>
              </>
            ) : (
              "Confirm Booking"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}