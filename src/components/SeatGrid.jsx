import { Armchair } from "lucide-react";
import "./components.css"; // Shared component styles
import "./SeatGrid.css";   // Component-specific styles

export default function SeatGrid({ 
  totalSeats, 
  selectedSeat, 
  onSelectSeat,
  bookedSeats = []
}) {
  const seats = Array.from({ length: totalSeats }, (_, i) => i + 1);

  // Helper function to replace cn()
  const classNames = (...classes) => {
    return classes.filter(Boolean).join(' ');
  }

  return (
    <div className="seat-grid-container">
      <div>
        <h2 className="seat-grid-title">Select Your Seat</h2>
        
        {/* Guidelines: Legend above grid with state indicators */}
        <div className="seat-grid-legend">
          <div className="legend-item">
            <div className="legend-box legend-available" />
            <span className="legend-label">Available</span>
          </div>
          <div className="legend-item">
            <div className="legend-box legend-selected" />
            <span className="legend-label">Selected</span>
          </div>
          <div className="legend-item">
            <div className="legend-box legend-booked" />
            <span className="legend-label">Booked</span>
          </div>
        </div>
      </div>

      {/* Guidelines: Grid layout: Auto-fit columns (min 60px, max 80px per seat) */}
      <div className="seat-grid">
        {seats.map((seatNumber) => {
          const isBooked = bookedSeats.includes(seatNumber);
          const isSelected = selectedSeat === seatNumber;
          
          return (
            <button
              key={seatNumber}
              onClick={() => !isBooked && onSelectSeat(seatNumber)}
              disabled={isBooked}
              className={classNames(
                "seat-button",
                "hover-elevate",
                "active-elevate-2",
                !isBooked && !isSelected && "is-available",
                isSelected && "is-selected",
                isBooked && "is-booked"
              )}
              data-testid={`button-seat-${seatNumber}`}
            >
              <Armchair className={classNames(
                "seat-icon",
                isSelected && "is-selected-icon"
              )} />
              <span className="seat-number">{seatNumber}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}