// import { useState, useMemo } from "react";
// import SeatGrid from "./SeatGrid.jsx";
// import DaySelector from "./DaySelector.jsx";
// import HubSelector, { HUBS } from "./HubSelector.jsx";
// import BrandLogo from "./BrandLogo.jsx";
// import { format, addDays } from "date-fns";
// import { Loader2 } from "lucide-react";
// import "./components.css";
// import "./BookingForm.css";

// // --- NEW HELPER FUNCTION ---
// // Generates the 5 valid booking days (skipping Sunday)
// const getNextFiveWorkDays = () => {
//   const days = [];
//   let currentOffset = 0;
//   while (days.length < 5) {
//     const date = addDays(new Date(), currentOffset);
//     if (date.getDay() !== 0) { // 0 = Sunday
//       days.push(format(date, "yyyy-MM-dd"));
//     }
//     currentOffset++;
//   }
//   return days;
// };
// // --- END HELPER ---

// export default function BookingForm({ email, onBookingComplete, allBookings = [] }) {
//   const [selectedHub, setSelectedHub] = useState("costain");
//   const [selectedSeat, setSelectedSeat] = useState(null);
  
//   // --- UPDATED: Get days and set default date ---
//   const fiveDayList = useMemo(() => getNextFiveWorkDays(), []);
//   const [selectedDate, setSelectedDate] = useState(fiveDayList[0]);
//   // --- END UPDATE ---
  
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const currentHub = HUBS.find(h => h.id === selectedHub);
//   const totalSeats = currentHub?.totalSeats || 50;

//   // --- NEW: Calculate availability from allBookings prop ---
//   const availabilityData = useMemo(() => {
//     const availability = {
//       byDate: {},
//       byHub: {},
//     };

//     // Initialize counts
//     fiveDayList.forEach(date => {
//       availability.byDate[date] = 0; // Start with 0 booked
//     });
//     HUBS.forEach(hub => {
//       availability.byHub[hub.id] = 0; // Start with 0 booked
//     });

//     // Count bookings
//     allBookings.forEach(booking => {
//       if (availability.byDate[booking.bookingDate] !== undefined) {
//         availability.byDate[booking.bookingDate]++;
//       }
//       if (availability.byHub[booking.hubId] !== undefined) {
//         availability.byHub[booking.hubId]++;
//       }
//     });

//     return availability;
//   }, [allBookings, fiveDayList, HUBS]);

//   // --- NEW: Calculate booked seats for the *current* grid ---
//   const currentBookedSeats = useMemo(() => {
//     return allBookings
//       .filter(
//         b => b.hubId === selectedHub && b.bookingDate === selectedDate
//       )
//       .map(b => b.seatNumber);
//   }, [allBookings, selectedHub, selectedDate]);
//   // --- END NEW ---

//   // Reset seat selection when hub or date changes
//   const handleHubChange = (hubId) => {
//     setSelectedHub(hubId);
//     setSelectedSeat(null);
//   };
  
//   const handleDateChange = (date) => {
//     setSelectedDate(date);
//     setSelectedSeat(null);
//   }

//   const handleSubmit = async () => {
//     if (!selectedSeat) return;
//     setIsSubmitting(true);
    
//     // We no longer simulate here. We just call the function from props.
//     await onBookingComplete(selectedSeat, selectedDate, selectedHub);
    
//     setIsSubmitting(false);
//   };

//   return (
//     <div className="booking-page-container">
//       <div className="booking-page-content">
        
//         <div className="card">
//           <div className="card-header card-header-welcome">
//             <div className="card-logo">
//               <BrandLogo />
//             </div>
//             <h1 className="card-title">
//               Welcome, <span className="text-primary">{email}</span>
//             </h1>
//           </div>
//         </div>

//         <HubSelector
//           selectedHub={selectedHub}
//           onSelectHub={handleHubChange}
//           // --- NEW PROP ---
//           availabilityByHub={availabilityData.byHub}
//           // --- END NEW PROP ---
//         />

//         <DaySelector
//           selectedDate={selectedDate}
//           onSelectDate={handleDateChange}
//           // --- NEW PROP ---
//           availabilityByDate={availabilityData.byDate} // Pass byDate object
//           dayList={fiveDayList}
//           // --- END NEW PROP ---
//         />

//         <SeatGrid
//           totalSeats={totalSeats}
//           selectedSeat={selectedSeat}
//           onSelectSeat={setSelectedSeat}
//           // --- UPDATED PROP ---
//           bookedSeats={currentBookedSeats}
//           // --- END UPDATED PROP ---
//         />

//         <div className="booking-page-footer">
//           <button
//             onClick={handleSubmit}
//             disabled={!selectedSeat || isSubmitting}
//             className="button button-primary button-lg"
//             data-testid="button-confirm-booking"
//           >
//             {isSubmitting ? (
//               <>
//                 <span className="spinner"><Loader2 /></span>
//                 Confirming...
//               </>
//             ) : (
//               "Confirm Booking"
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState, useMemo } from "react";
import SeatGrid from "./SeatGrid.jsx";
import DaySelector from "./DaySelector.jsx";
import HubSelector, { HUBS } from "./HubSelector.jsx";
import BrandLogo from "./BrandLogo.jsx";
import { format, addDays } from "date-fns";
import { Loader2 } from "lucide-react";
import "./components.css";
import "./BookingForm.css";

// Helper function
const getNextFiveWorkDays = () => {
  const days = [];
  let currentOffset = 0;
  while (days.length < 5) {
    const date = addDays(new Date(), currentOffset);
    if (date.getDay() !== 0) { // 0 = Sunday
      days.push(format(date, "yyyy-MM-dd"));
    }
    currentOffset++;
  }
  return days;
};

export default function BookingForm({ email, onBookingComplete, allBookings = [] }) {
  const [selectedHub, setSelectedHub] = useState("costain");
  const [selectedSeat, setSelectedSeat] = useState(null);
  
  const fiveDayList = useMemo(() => getNextFiveWorkDays(), []);
  const [selectedDate, setSelectedDate] = useState(fiveDayList[0]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentHub = HUBS.find(h => h.id === selectedHub);
  const totalSeats = currentHub?.totalSeats || 50;

  // --- THIS IS FIX #1 ---
  // This calculation now ONLY counts bookings in the next 5 days
  // This fixes the "99 seats" bug.
  const availabilityDataByHub = useMemo(() => {
    const availability = {};
    HUBS.forEach(hub => {
      availability[hub.id] = 0; // Start with 0 booked
    });

    // --- NEW: Only count bookings that are in the upcoming 5 days ---
    const upcomingBookings = allBookings.filter(b => fiveDayList.includes(b.bookingDate));
    // --- END NEW ---

    // Now, we count from the *filtered* list
    upcomingBookings.forEach(booking => {
      if (availability[booking.hubId] !== undefined) {
        availability[booking.hubId]++;
      }
    });
    return availability;
  }, [allBookings, HUBS, fiveDayList]); // Added fiveDayList to dependencies
  // --- END FIX #1 ---


  // This calculation is correct - it filters by the selected hub
  const dayAvailabilityForSelectedHub = useMemo(() => {
    const dailyCounts = {};
    fiveDayList.forEach(date => {
      dailyCounts[date] = 0;
    });
    const hubBookings = allBookings.filter(b => b.hubId === selectedHub);
    hubBookings.forEach(booking => {
      if (dailyCounts[booking.bookingDate] !== undefined) {
        dailyCounts[booking.bookingDate]++;
      }
    });
    return dailyCounts;
  }, [allBookings, selectedHub, fiveDayList]);

  // This calculation is also correct
  const currentBookedSeats = useMemo(() => {
    return allBookings
      .filter(
        b => b.hubId === selectedHub && b.bookingDate === selectedDate
      )
      .map(b => b.seatNumber);
  }, [allBookings, selectedHub, selectedDate]);

  const handleHubChange = (hubId) => {
    setSelectedHub(hubId);
    setSelectedSeat(null);
  };
  
  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedSeat(null);
  }

  const handleSubmit = async () => {
    if (!selectedSeat) return;
    setIsSubmitting(true);
    await onBookingComplete(selectedSeat, selectedDate, selectedHub);
    setIsSubmitting(false);
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
          availabilityByHub={availabilityDataByHub} // This prop now has the correct data
        />

        <DaySelector
          selectedDate={selectedDate}
          onSelectDate={handleDateChange}
          dayList={fiveDayList}
          availabilityForSelectedHub={dayAvailabilityForSelectedHub}
          // totalSeatsForHub prop is removed as it's not needed
        />

        <SeatGrid
          totalSeats={totalSeats}
          selectedSeat={selectedSeat}
          onSelectSeat={setSelectedSeat}
          bookedSeats={currentBookedSeats}
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
                Confirming...
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