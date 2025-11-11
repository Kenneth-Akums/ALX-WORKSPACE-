// import { Armchair } from "lucide-react";
// import "./components.css"; // Shared component styles
// import "./SeatGrid.css";   // Component-specific styles

// export default function SeatGrid({ 
//   totalSeats, 
//   selectedSeat, 
//   onSelectSeat,
//   bookedSeats = []
// }) {
//   const seats = Array.from({ length: totalSeats }, (_, i) => i + 1);

//   // Helper function to replace cn()
//   const classNames = (...classes) => {
//     return classes.filter(Boolean).join(' ');
//   }

//   return (
//     <div className="seat-grid-container">
//       <div>
//         <h2 className="seat-grid-title">Select Your Seat</h2>
        
//         {/* Guidelines: Legend above grid with state indicators */}
//         <div className="seat-grid-legend">
//           <div className="legend-item">
//             <div className="legend-box legend-available" />
//             <span className="legend-label">Available</span>
//           </div>
//           <div className="legend-item">
//             <div className="legend-box legend-selected" />
//             <span className="legend-label">Selected</span>
//           </div>
//           <div className="legend-item">
//             <div className="legend-box legend-booked" />
//             <span className="legend-label">Booked</span>
//           </div>
//         </div>
//       </div>

//       {/* Guidelines: Grid layout: Auto-fit columns (min 60px, max 80px per seat) */}
//       <div className="seat-grid">
//         {seats.map((seatNumber) => {
//           const isBooked = bookedSeats.includes(seatNumber);
//           const isSelected = selectedSeat === seatNumber;
          
//           return (
//             <button
//               key={seatNumber}
//               onClick={() => !isBooked && onSelectSeat(seatNumber)}
//               disabled={isBooked}
//               className={classNames(
//                 "seat-button",
//                 "hover-elevate",
//                 "active-elevate-2",
//                 !isBooked && !isSelected && "is-available",
//                 isSelected && "is-selected",
//                 isBooked && "is-booked"
//               )}
//               data-testid={`button-seat-${seatNumber}`}
//             >
//               <Armchair className={classNames(
//                 "seat-icon",
//                 isSelected && "is-selected-icon"
//               )} />
//               <span className="seat-number">{seatNumber}</span>
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

import { Armchair, User } from "lucide-react"; // Import User icon
import "./components.css";
import "./SeatGrid.css";

export default function SeatGrid({ 
  totalSeats, 
  selectedSeat, 
  onSelectSeat,
  bookedSeats = [], // This is now *other* people's bookings
  myBookedSeat = null // --- NEW PROP ---
}) {
  const seats = Array.from({ length: totalSeats }, (_, i) => i + 1);

  const classNames = (...classes) => {
    return classes.filter(Boolean).join(' ');
  }

  return (
    <div className="seat-grid-container">
      <div>
        <h2 className="seat-grid-title">Select Your Seat</h2>
        
        <div className="seat-grid-legend">
          <div className="legend-item">
            <div className="legend-box legend-available" />
            <span className="legend-label">Available</span>
          </div>
          {/* --- NEW: "Your Seat" Legend Item --- */}
          <div className="legend-item">
            <div className="legend-box legend-my-seat" />
            <span className="legend-label">Your Seat</span>
          </div>
          {/* --- END NEW --- */}
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

      <div className="seat-grid">
        {seats.map((seatNumber) => {
          const isBookedByOther = bookedSeats.includes(seatNumber);
          const isSelected = selectedSeat === seatNumber;
          
          // --- NEW: Check if this is *my* seat ---
          const isMySeat = myBookedSeat === seatNumber;
          // --- END NEW ---
          
          return (
            <button
              key={seatNumber}
              onClick={() => onSelectSeat(seatNumber)}
              // --- UPDATED: Disable if booked by other OR if it's my seat ---
              disabled={isBookedByOther || isMySeat}
              // --- END UPDATE ---
              className={classNames(
                "seat-button",
                "hover-elevate",
                "active-elevate-2",
                // --- UPDATED: New class logic ---
                isMySeat && "is-my-seat",
                !isMySeat && isSelected && "is-selected",
                !isMySeat && !isSelected && isBookedByOther && "is-booked",
                !isMySeat && !isSelected && !isBookedByOther && "is-available"
                // --- END UPDATE ---
              )}
              data-testid={`button-seat-${seatNumber}`}
            >
              {/* --- UPDATED: Show User icon for my seat --- */}
              {isMySeat ? (
                <User className="seat-icon" />
              ) : (
                <Armchair className={classNames(
                  "seat-icon",
                  isSelected && "is-selected-icon"
                )} />
              )}
              {/* --- END UPDATE --- */}

              <span className="seat-number">{seatNumber}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}