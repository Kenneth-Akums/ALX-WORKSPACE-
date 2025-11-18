// import { Armchair, User } from "lucide-react"; // Import User icon
// import "./components.css";
// import "./SeatGrid.css";

// export default function SeatGrid({ 
//   totalSeats, 
//   selectedSeat, 
//   onSelectSeat,
//   bookedSeats = [], // This is now *other* people's bookings
//   myBookedSeat = null, // --- NEW PROP ---
//   onCancelSeat
// }) {
//   const seats = Array.from({ length: totalSeats }, (_, i) => i + 1);

//   const classNames = (...classes) => {
//     return classes.filter(Boolean).join(' ');
//   }

//   return (
//     <div className="seat-grid-container">
//       <div>
//         <h2 className="seat-grid-title">Select Your Seat</h2>
        
//         <div className="seat-grid-legend">
//           <div className="legend-item">
//             <div className="legend-box legend-available" />
//             <span className="legend-label">Available</span>
//           </div>
//           <div className="legend-item">
//             <div className="legend-box legend-my-seat" />
//             <span className="legend-label">Your Seat (Click to Cancel)</span>
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

//       <div className="seat-grid">
//         {seats.map((seatNumber) => {
//           const isBookedByOther = bookedSeats.includes(seatNumber);
//           const isSelected = selectedSeat === seatNumber;
//           const isMySeat = myBookedSeat === seatNumber;
          
//           return (
//             <button
//               key={seatNumber}
//               onClick={() => {
//                 if (isMySeat) {
//                   // If it's my seat, trigger cancellation
//                   onCancelSeat(seatNumber);
//                 } else {
//                   // Otherwise, select it
//                   onSelectSeat(seatNumber);
//                 }
//               }}
//               // UPDATED: Only disable if booked by SOMEONE ELSE
//               disabled={isBookedByOther} 
//               className={classNames(
//                 "seat-button",
//                 "hover-elevate",
//                 "active-elevate-2",
//                 isMySeat && "is-my-seat",
//                 !isMySeat && isSelected && "is-selected",
//                 !isMySeat && !isSelected && isBookedByOther && "is-booked",
//                 !isMySeat && !isSelected && !isBookedByOther && "is-available"
//               )}
//               data-testid={`button-seat-${seatNumber}`}
//               // Add title for hover tooltip
//               title={isMySeat ? "Click to cancel this booking" : ""}
//             >
//               {isMySeat ? (
//                 <User className="seat-icon" />
//               ) : (
//                 <Armchair className={classNames(
//                   "seat-icon",
//                   isSelected && "is-selected-icon"
//                 )} />
//               )}

//               <span className="seat-number">{seatNumber}</span>
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// }


import { useState, useMemo } from "react"; // Added useState, useMemo
import { Armchair, User, ChevronLeft, ChevronRight } from "lucide-react"; // Added Chevrons
import "./components.css";
import "./SeatGrid.css";

export default function SeatGrid({ 
  totalSeats, 
  selectedSeat, 
  onSelectSeat,
  bookedSeats = [], 
  myBookedSeat = null,
  onCancelSeat 
}) {
  const SEATS_PER_SECTION = 50; // Expert Tip: Keep this between 40-60 for best mobile UX
  
  // State to track which "Zone" or "Page" we are viewing
  const [activeSection, setActiveSection] = useState(0);

  // Calculate total sections needed
  const totalSections = Math.ceil(totalSeats / SEATS_PER_SECTION);

  // Determine the subset of seats to display right now
  const currentSeats = useMemo(() => {
    const start = activeSection * SEATS_PER_SECTION + 1;
    const end = Math.min((activeSection + 1) * SEATS_PER_SECTION, totalSeats);
    
    const seats = [];
    for (let i = start; i <= end; i++) {
      seats.push(i);
    }
    return seats;
  }, [activeSection, totalSeats]);

  const classNames = (...classes) => {
    return classes.filter(Boolean).join(' ');
  }

  // Helper to change sections
  const handlePrev = () => setActiveSection(p => Math.max(0, p - 1));
  const handleNext = () => setActiveSection(p => Math.min(totalSections - 1, p + 1));

  return (
    <div className="seat-grid-container">
      <div className="seat-grid-header-row">
        <h2 className="seat-grid-title">Select Your Seat</h2>
        
        {/* --- NEW: Section Navigator (Only shows if > 50 seats) --- */}
        {totalSeats > SEATS_PER_SECTION && (
          <div className="section-navigator">
            <button 
              onClick={handlePrev} 
              disabled={activeSection === 0}
              className="nav-button"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="section-label">
              Seats {activeSection * SEATS_PER_SECTION + 1} - {Math.min((activeSection + 1) * SEATS_PER_SECTION, totalSeats)}
            </span>
            <button 
              onClick={handleNext} 
              disabled={activeSection === totalSections - 1}
              className="nav-button"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
        
      <div className="seat-grid-legend">
        <div className="legend-item">
          <div className="legend-box legend-available" />
          <span className="legend-label">Available</span>
        </div>
        <div className="legend-item">
          <div className="legend-box legend-my-seat" />
          <span className="legend-label">Your Seat</span>
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

      <div className="seat-grid">
        {currentSeats.map((seatNumber) => {
          const isBookedByOther = bookedSeats.includes(seatNumber);
          const isSelected = selectedSeat === seatNumber;
          const isMySeat = myBookedSeat === seatNumber;
          
          return (
            <button
              key={seatNumber}
              onClick={() => {
                if (isMySeat) {
                  onCancelSeat(seatNumber);
                } else {
                  onSelectSeat(seatNumber);
                }
              }}
              disabled={isBookedByOther} 
              className={classNames(
                "seat-button",
                "hover-elevate",
                "active-elevate-2",
                isMySeat && "is-my-seat",
                !isMySeat && isSelected && "is-selected",
                !isMySeat && !isSelected && isBookedByOther && "is-booked",
                !isMySeat && !isSelected && !isBookedByOther && "is-available"
              )}
              data-testid={`button-seat-${seatNumber}`}
              title={isMySeat ? "Click to cancel this booking" : `Seat ${seatNumber}`}
            >
              {isMySeat ? (
                <User className="seat-icon" />
              ) : (
                <Armchair className={classNames(
                  "seat-icon",
                  isSelected && "is-selected-icon"
                )} />
              )}

              <span className="seat-number">{seatNumber}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}