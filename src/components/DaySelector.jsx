// import { format, parse } from "date-fns";
// import { Calendar } from "lucide-react";
// import "./components.css";
// import "./DaySelector.css";

// // --- Props are simplified. We only need the booked counts. ---
// export default function DaySelector({ 
//   selectedDate, 
//   onSelectDate,
//   dayList = [],
//   availabilityForSelectedHub = {}
// }) {
// // --- END UPDATE ---

//   const days = dayList.map(dateStr => {
//     const dateObj = parse(dateStr, "yyyy-MM-dd", new Date());
    
//     // Use the new, pre-filtered data
//     const bookedCount = availabilityForSelectedHub[dateStr] || 0;
    
//     return {
//       date: dateStr,
//       dayName: format(dateObj, "EEEE"),
//       dayNumber: format(dateObj, "d"),
//       monthName: format(dateObj, "MMM"),
//       // --- UPDATED: Use bookedCount ---
//       bookedCount: bookedCount,
//       // --- END UPDATE ---
//     };
//   });

//   const classNames = (...classes) => {
//     return classes.filter(Boolean).join(' ');
//   }

//   return (
//     <div className="day-selector-container">
//       <div className="day-selector-header">
//         <Calendar className="day-selector-icon" />
//         <h2 className="day-selector-title">Select Day</h2>
//       </div>
      
//       <div className="day-selector-grid">
//         {days.map((day) => (
//           <div
//             key={day.date}
//             className={classNames(
//               "card day-card",
//               "hover-elevate",
//               "active-elevate-2",
//               selectedDate === day.date && "is-selected"
//             )}
//             onClick={() => onSelectDate(day.date)}
//             data-testid={`card-day-${day.date}`}
//           >
//             <div className="card-content day-card-content">
//               <div className={classNames(
//                 "day-card-name",
//                 selectedDate === day.date && "text-primary"
//               )}>
//                 {day.dayName}
//               </div>
//               <div className="day-card-number">
//                 {day.dayNumber}
//               </div>
//               <div className="day-card-month">
//                 {day.monthName}
//               </div>
              
//               {/* --- UPDATED: Show "X booked" with red text --- */}
//               <div className={classNames(
//                 "day-card-availability",
//                 day.bookedCount > 0 && "text-destructive-light"
//               )}>
//                 {day.bookedCount} booked
//               </div>
//               {/* --- END UPDATE --- */}

//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

import { format, parse } from "date-fns";
import { Calendar } from "lucide-react";
import "./components.css";
import "./DaySelector.css";

export default function DaySelector({ 
  selectedDate, 
  onSelectDate,
  dayList = [],
  availabilityForSelectedHub = {},
  myBookings = [],
  selectedHub // --- NEW PROP ---
}) {

  const days = dayList.map(dateStr => {
    const dateObj = parse(dateStr, "yyyy-MM-dd", new Date());
    
    // Total booked seats for this day *at this hub*
    const bookedCount = availabilityForSelectedHub[dateStr] || 0;
    
    // --- UPDATED LOGIC ---
    // Check if my booking is for *this day* AND *this hub*
    const myBookingForThisDay = myBookings.find(
      b => b.bookingDate === dateStr && b.hubId === selectedHub
    );
    // --- END UPDATE ---

    return {
      date: dateStr,
      dayName: format(dateObj, "EEEE"),
      dayNumber: format(dateObj, "d"),
      monthName: format(dateObj, "MMM"),
      bookedCount: bookedCount,
      hasMyBooking: !!myBookingForThisDay // Is true only for the correct hub
    };
  });

  const classNames = (...classes) => {
    return classes.filter(Boolean).join(' ');
  }

  return (
    <div className="day-selector-container">
      <div className="day-selector-header">
        <Calendar className="day-selector-icon" />
        <h2 className="day-selector-title">Select Day</h2>
      </div>
      
      <div className="day-selector-grid">
        {days.map((day) => (
          <div
            key={day.date}
            className={classNames(
              "card day-card",
              "hover-elevate",
              "active-elevate-2",
              selectedDate === day.date && "is-selected",
              day.hasMyBooking && "is-my-booking"
            )}
            onClick={() => onSelectDate(day.date)}
            data-testid={`card-day-${day.date}`}
          >
            <div className="card-content day-card-content">
              <div className={classNames(
                "day-card-name",
                selectedDate === day.date && "text-primary"
              )}>
                {day.dayName}
              </div>
              <div className="day-card-number">
                {day.dayNumber}
              </div>
              <div className="day-card-month">
                {day.monthName}
              </div>
              
              <div className={classNames(
                "day-card-availability",
                day.hasMyBooking && "text-accent",
                !day.hasMyBooking && day.bookedCount > 0 && "text-destructive-light"
              )}>
                {day.hasMyBooking 
                  ? "Booked by You" 
                  // Show the count of *other* people's bookings
                  : `${day.bookedCount - (day.hasMyBooking ? 1 : 0)} booked`
                }
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}