// import { useState, useMemo } from "react";
// import { format, addDays, isSameDay, parseISO } from "date-fns";
// import SeatGrid from "./SeatGrid.jsx";
// import DaySelector from "./DaySelector.jsx";
// import HubSelector, { HUBS } from "./HubSelector.jsx";
// import BrandLogo from "./BrandLogo.jsx";
// // import { format, addDays } from "date-fns";
// import { Loader2, Clock } from "lucide-react";
// import "./components.css";
// import "./BookingForm.css";

// // Helper function
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

// // --- NEW: Helper function to get first name ---
// const getFirstName = (name) => {
//   if (!name) return "";
//   return name.split(" ")[0]; // Get the first part of the name
// };


// const generateTimeSlots = (selectedDate) => {
//   const slots = [];
//   const startHour = 8; // 8 AM
//   const endHour = 20; // 8 PM
//   const now = new Date();
//   const isToday = isSameDay(parseISO(selectedDate), now);
//   const currentHour = now.getHours();

//   for (let hour = startHour; hour <= endHour; hour++) {
//     // If today, skip past hours
//     if (isToday && hour <= currentHour) {
//       continue;
//     }
    
//     const displayHour = hour > 12 ? hour - 12 : hour;
//     const ampm = hour >= 12 ? 'PM' : 'AM';
//     const timeString = `${displayHour}:00 ${ampm}`;
//     const value = `${hour.toString().padStart(2, '0')}:00`; // "08:00", "14:00"
    
//     slots.push({ value, label: timeString });
//   }
//   return slots;
// };


// export default function BookingForm({ email, userName, onBookingComplete, onCancelBooking, allBookings = [] }) {
//   const [selectedHub, setSelectedHub] = useState("costain");
//   const [selectedSeat, setSelectedSeat] = useState(null);
  
//   const fiveDayList = useMemo(() => getNextFiveWorkDays(), []);
//   const [selectedDate, setSelectedDate] = useState(fiveDayList[0]);
  
//   const [selectedTime, setSelectedTime] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const currentHub = HUBS.find(h => h.id === selectedHub);
//   const totalSeats = currentHub?.totalSeats || 50;
  
//   // Get all valid bookings (status "Booked")
//   const validBookings = useMemo(() => {
//     return allBookings.filter(b => b.bookingStatus === "Booked");
//   }, [allBookings]);

//   // Find *all* of the current user's bookings
//   const myBookings = useMemo(() => {
//     return validBookings.filter(
//       b => b.email.toLowerCase() === email.toLowerCase()
//     );
//   }, [validBookings, email]);
  
//   // Find *all* bookings made by *other* users
//   const otherBookings = useMemo(() => {
//     return validBookings.filter(
//       b => b.email.toLowerCase() !== email.toLowerCase()
//     );
//   }, [validBookings, email]);
  
//   // --- BUG FIX: THIS IS THE LOGIC THAT WAS WRONG ---
//   // Count total *upcoming* bookings for ALL users
//   const upcomingBookings = useMemo(() => {
//     return validBookings.filter(b => 
//       fiveDayList.includes(b.bookingDate)
//     );
//   }, [validBookings, fiveDayList]);

//   // Count bookings for the HubSelector, based on *selected day*
//   const availabilityDataByHub = useMemo(() => {
//     const availability = {};
//     HUBS.forEach(hub => {
//       availability[hub.id] = 0; // Start with 0 booked
//     });
    
//     // Filter bookings for the *selected date* only
//     const dailyBookings = upcomingBookings.filter(b => b.bookingDate === selectedDate);

//     // Count those bookings by hub
//     dailyBookings.forEach(booking => {
//       if (availability[booking.hubId] !== undefined) {
//         availability[booking.hubId]++;
//       }
//     });
//     return availability;
//   }, [upcomingBookings, selectedDate]); // Now depends on selectedDate
//   // --- END BUG FIX ---

//   // Count total upcoming bookings for the selected hub (for DaySelector)
//   const dayAvailabilityForSelectedHub = useMemo(() => {
//     const dailyCounts = {};
//     fiveDayList.forEach(date => {
//       dailyCounts[date] = 0;
//     });

//     const hubBookings = upcomingBookings.filter(b => b.hubId === selectedHub);
    
//     hubBookings.forEach(booking => {
//       if (dailyCounts[booking.bookingDate] !== undefined) {
//         dailyCounts[booking.bookingDate]++;
//       }
//     });
//     return dailyCounts;
//   }, [upcomingBookings, selectedHub, fiveDayList]);


//   // Find *other* people's booked seats for the current grid
//   const otherBookedSeats = useMemo(() => {
//     return otherBookings
//       .filter(
//         b => b.hubId === selectedHub && b.bookingDate === selectedDate
//       )
//       .map(b => b.seatNumber);
//   }, [otherBookings, selectedHub, selectedDate]);
  
//   // Find *my* booked seat for the current grid
//   const myBookedSeatForThisGrid = useMemo(() => {
//     const myBooking = myBookings.find(
//       b => b.hubId === selectedHub && b.bookingDate === selectedDate
//     );
//     return myBooking ? myBooking.seatNumber : null;
//   }, [myBookings, selectedHub, selectedDate]);

//   // 2. ADD THIS: Check if I have a booking ANYWHERE on this date
// const myBookingAnywhereOnDate = useMemo(() => {
//   return myBookings.find(
//     b => b.bookingDate === selectedDate
//   );
// }, [myBookings, selectedDate]);


// const timeSlots = useMemo(() => generateTimeSlots(selectedDate), [selectedDate]);

//   const handleHubChange = (hubId) => {
//     setSelectedHub(hubId);
//     setSelectedSeat(null);
//   };
  
//   const handleDateChange = (date) => {
//     setSelectedDate(date);
//     setSelectedSeat(null);
//     setSelectedTime(""); // Reset time
//   }

//   const handleSubmit = async () => {
//     if (!selectedSeat || !selectedTime) return;
//     setIsSubmitting(true);
//     await onBookingComplete(selectedSeat, selectedDate, selectedHub, selectedTime);
//     setIsSubmitting(false);
//   };

//   // --- NEW: Get the first name, fallback to email ---
//   const welcomeName = getFirstName(userName) || email;
//   // --- END NEW ---

//   return (
//     <div className="booking-page-container">
//       <div className="booking-page-content">
        
//         <div className="card">
//           <div className="card-header card-header-welcome">
//             <div className="card-logo"><BrandLogo /></div>
//             <h1 className="card-title">Welcome, <span className="text-primary">{welcomeName}</span></h1>
//           </div>
//         </div>

//         <HubSelector
//           selectedHub={selectedHub}
//           onSelectHub={handleHubChange}
//           availabilityByHub={availabilityDataByHub}
//           myBookings={myBookings}
//           selectedDate={selectedDate}
//         />

//         <DaySelector
//           selectedDate={selectedDate}
//           onSelectDate={handleDateChange}
//           dayList={fiveDayList}
//           availabilityForSelectedHub={dayAvailabilityForSelectedHub}
//           myBookings={myBookings} 
//           selectedHub={selectedHub}
//         />

//         {/* --- NEW: Time Selector UI --- */}
//         <div className="time-selector-section">
//           <div className="time-selector-header">
//             <Clock className="time-icon" />
//             <h3 className="time-title">Select Arrival Time</h3>
//           </div>
          
//           <div className="time-grid">
//             {timeSlots.length > 0 ? (
//               timeSlots.map((slot) => (
//                 <button
//                   key={slot.value}
//                   className={`time-button ${selectedTime === slot.value ? 'is-selected' : ''}`}
//                   onClick={() => setSelectedTime(slot.value)}
//                   // Disable if I already have a booking this day
//                   disabled={!!myBookingAnywhereOnDate}
//                 >
//                   {slot.label}
//                 </button>
//               ))
//             ) : (
//               <div className="no-slots-message">
//                 No available time slots for today.
//               </div>
//             )}
//           </div>
//         </div>

//         <SeatGrid
//           totalSeats={totalSeats}
//           selectedSeat={selectedSeat}
//           onSelectSeat={setSelectedSeat}
//           bookedSeats={otherBookedSeats}
//           myBookedSeat={myBookedSeatForThisGrid}
//           onCancelSeat={() => onCancelBooking(selectedDate)}
//         />

//         <div className="booking-page-footer">
//           <button
//             onClick={handleSubmit}
//             // Disable if Time is missing or if already booked
//             disabled={!selectedSeat || !selectedTime || isSubmitting || !!myBookingAnywhereOnDate}
//             className="button button-primary button-lg"
//             data-testid="button-confirm-booking"
//           >
//             {isSubmitting ? (
//               <>
//                 <span className="spinner"><Loader2 /></span>
//                 Confirming...
//               </>
//             ) : myBookingAnywhereOnDate ? (
//                 myBookingAnywhereOnDate.hubId === selectedHub 
//                   ? "You have this seat booked" 
//                   : `You are booked at ${HUBS.find(h => h.id === myBookingAnywhereOnDate.hubId)?.name}`
//             ) : (
//               "Confirm Booking"
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState, useMemo, useEffect, useRef } from "react";
import SeatGrid from "./SeatGrid.jsx";
import DaySelector from "./DaySelector.jsx";
import HubSelector, { HUBS } from "./HubSelector.jsx";
import BrandLogo from "./BrandLogo.jsx";
import { format, addDays, isSameDay, parseISO, addMinutes, setHours, setMinutes, isValid } from "date-fns"; // --- ADDED: isValid
import { Loader2, Clock, CalendarCheck, ChevronDown } from "lucide-react";
import "./components.css";
import "./BookingForm.css";

const getNextFiveWorkDays = () => {
  const days = [];
  let currentOffset = 0;
  while (days.length < 5) {
    const date = addDays(new Date(), currentOffset);
    if (date.getDay() !== 0) { 
      days.push(format(date, "yyyy-MM-dd"));
    }
    currentOffset++;
  }
  return days;
};

const getFirstName = (name) => {
  if (!name) return "";
  return name.split(" ")[0];
};

// --- NEW: Robust Time Formatter ---
const safeFormatTime = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return "scheduled";
  try {
    // Attempt to parse ISO string "2025-11-18T14:00"
    const parsedDate = parseISO(`${dateStr}T${timeStr}`);
    if (isValid(parsedDate)) {
      return format(parsedDate, 'h:mm a');
    }
    // If parsing fails (e.g. timeStr is "2pm"), just return the original string
    return timeStr;
  } catch (e) {
    return timeStr; // Fallback to showing raw data
  }
};

const generateTimeSlots = (selectedDate) => {
  if (!selectedDate) return [];
  
  const slots = [];
  const now = new Date();
  // Ensure selectedDate is valid before parsing
  const parsedDate = parseISO(selectedDate);
  if (!isValid(parsedDate)) return [];

  const isToday = isSameDay(parsedDate, now);

  let currentTime = setMinutes(setHours(parsedDate, 8), 0);
  const endTime = setMinutes(setHours(parsedDate, 20), 0);

  while (currentTime <= endTime) {
    if (isToday && currentTime <= now) {
      currentTime = addMinutes(currentTime, 15);
      continue;
    }

    const label = format(currentTime, "h:mm a");
    const value = format(currentTime, "HH:mm");
    
    slots.push({ value, label });
    
    currentTime = addMinutes(currentTime, 15);
  }
  
  return slots;
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

export default function BookingForm({ email, userName, onBookingComplete, onCancelBooking, allBookings = [] }) {
  const [selectedHub, setSelectedHub] = useState(null); 
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null); 
  const [selectedTime, setSelectedTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const daySectionRef = useRef(null);
  const timeSectionRef = useRef(null);
  const seatSectionRef = useRef(null);

  const fiveDayList = useMemo(() => getNextFiveWorkDays(), []);
  const currentHub = HUBS.find(h => h.id === selectedHub);
  const totalSeats = currentHub?.totalSeats || 50;
  
  const validBookings = useMemo(() => allBookings.filter(b => b.bookingStatus === "Booked"), [allBookings]);
  const myBookings = useMemo(() => validBookings.filter(b => b.email.toLowerCase() === email.toLowerCase()), [validBookings, email]);
  const otherBookings = useMemo(() => validBookings.filter(b => b.email.toLowerCase() !== email.toLowerCase()), [validBookings, email]);
  const upcomingBookings = useMemo(() => validBookings.filter(b => fiveDayList.includes(b.bookingDate)), [validBookings, fiveDayList]);

  const availabilityDataByHub = useMemo(() => {
    const availability = {};
    HUBS.forEach(hub => { availability[hub.id] = 0; });
    if (selectedDate) {
        const dailyBookings = upcomingBookings.filter(b => b.bookingDate === selectedDate);
        dailyBookings.forEach(booking => {
        if (availability[booking.hubId] !== undefined) availability[booking.hubId]++;
        });
    }
    return availability;
  }, [upcomingBookings, selectedDate]);

  const dayAvailabilityForSelectedHub = useMemo(() => {
    const dailyCounts = {};
    fiveDayList.forEach(date => dailyCounts[date] = 0);
    if (selectedHub) {
        const hubBookings = upcomingBookings.filter(b => b.hubId === selectedHub);
        hubBookings.forEach(booking => {
        if (dailyCounts[booking.bookingDate] !== undefined) dailyCounts[booking.bookingDate]++;
        });
    }
    return dailyCounts;
  }, [upcomingBookings, selectedHub, fiveDayList]);

  const otherBookedSeats = useMemo(() => {
    return otherBookings
      .filter(b => b.hubId === selectedHub && b.bookingDate === selectedDate)
      .map(b => b.seatNumber);
  }, [otherBookings, selectedHub, selectedDate]);
  
  const myBookedSeatForThisGrid = useMemo(() => {
    const myBooking = myBookings.find(b => b.hubId === selectedHub && b.bookingDate === selectedDate);
    return myBooking ? myBooking.seatNumber : null;
  }, [myBookings, selectedHub, selectedDate]);

  const myBookingAnywhereOnDate = useMemo(() => {
    return myBookings.find(b => b.bookingDate === selectedDate);
  }, [myBookings, selectedDate]);

  const timeSlots = useMemo(() => generateTimeSlots(selectedDate), [selectedDate]);

  const isBookedAtCurrentHub = myBookedSeatForThisGrid !== null && myBookedSeatForThisGrid !== undefined;

  const handleHubChange = (hubId) => {
    setSelectedHub(hubId);
    setSelectedDate(null); 
    setSelectedTime("");
    setSelectedSeat(null);
    setTimeout(() => daySectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };
  
  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTime(""); 
    setSelectedSeat(null);
    setTimeout(() => {
       const target = isBookedAtCurrentHub ? seatSectionRef.current : timeSectionRef.current;
       target?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  }

  const handleTimeChange = (time) => {
    setSelectedTime(time);
    setSelectedSeat(null);
    setTimeout(() => seatSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  }

  const handleSubmit = async () => {
    if (!selectedSeat || !selectedTime) return;
    setIsSubmitting(true);
    await onBookingComplete(selectedSeat, selectedDate, selectedHub, selectedTime);
    setIsSubmitting(false);
  };

  const welcomeName = getFirstName(userName) || email;
  const greeting = getGreeting();
  const todayDisplay = format(new Date(), "EEEE, MMMM do");

  return (
    <div className="booking-page-container">
      <div className="booking-page-content">
        
        <header className="welcome-header">
          <div className="welcome-text-group">
            <div className="welcome-brand">
               <BrandLogo className="welcome-logo" />
               <span className="welcome-date">{todayDisplay}</span>
            </div>
            <h1 className="welcome-title">
              {greeting}, <span className="text-highlight">{welcomeName}</span>
            </h1>
            <p className="welcome-subtitle">Ready to book your workspace today?</p>
          </div>
        </header>

        <HubSelector
          selectedHub={selectedHub}
          onSelectHub={handleHubChange}
          availabilityByHub={availabilityDataByHub}
          myBookings={myBookings}
          selectedDate={selectedDate}
        />

        {selectedHub && (
          <div ref={daySectionRef} className="reveal-section section-divider">
            <DaySelector
              selectedDate={selectedDate}
              onSelectDate={handleDateChange}
              dayList={fiveDayList}
              availabilityForSelectedHub={dayAvailabilityForSelectedHub}
              myBookings={myBookings} 
              selectedHub={selectedHub}
            />
          </div>
        )}

        {selectedHub && selectedDate && !myBookingAnywhereOnDate && (
          <div ref={timeSectionRef} className="reveal-section section-divider">
            <div className="time-selector-section">
              <div className="time-selector-header">
                <Clock className="time-icon" />
                <h3 className="time-title">Select Arrival Time</h3>
              </div>
              
              <div className="time-select-container">
                {timeSlots.length > 0 ? (
                  <div className="select-wrapper">
                    <select 
                      value={selectedTime}
                      onChange={(e) => handleTimeChange(e.target.value)}
                      className="modern-time-select"
                    >
                      <option value="" disabled>Choose a time slot...</option>
                      {timeSlots.map((slot) => (
                        <option key={slot.value} value={slot.value}>
                          {slot.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="select-icon" />
                  </div>
                ) : (
                  <div className="no-slots-message">
                    No available time slots for today.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {selectedHub && selectedDate && myBookingAnywhereOnDate && (
          <div className="reveal-section section-divider">
             <div className="booked-info-card">
                <CalendarCheck className="booked-icon" />
                <div>
                   {isBookedAtCurrentHub ? (
                      <p>
                        <strong>You have a booking here.</strong> Your arrival time is <span>
                          {/* --- USE SAFE FORMAT HERE --- */}
                          {safeFormatTime(selectedDate, myBookingAnywhereOnDate.bookingTime)}
                        </span>.
                      </p>
                   ) : (
                      <p><strong>Conflict:</strong> You are booked at another hub for this date.</p>
                   )}
                   {isBookedAtCurrentHub && <p className="booked-subtext">Select your purple seat below to cancel.</p>}
                </div>
             </div>
          </div>
        )}

        {selectedHub && selectedDate && (selectedTime || isBookedAtCurrentHub) && (
          <div ref={seatSectionRef} className="reveal-section section-divider">
            <SeatGrid
              totalSeats={totalSeats}
              selectedSeat={selectedSeat}
              onSelectSeat={setSelectedSeat}
              bookedSeats={otherBookedSeats}
              myBookedSeat={myBookedSeatForThisGrid}
              onCancelSeat={() => onCancelBooking(selectedDate)} 
            />

            <div className="booking-page-footer">
              <button
                onClick={handleSubmit}
                disabled={!selectedSeat || isSubmitting || !!myBookingAnywhereOnDate}
                className="button button-primary button-lg"
                data-testid="button-confirm-booking"
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"><Loader2 /></span>
                    Confirming...
                  </>
                ) : isBookedAtCurrentHub ? (
                   "Booking Active"
                ) : myBookingAnywhereOnDate ? (
                   "Booked Elsewhere"
                ) : (
                  "Confirm Booking"
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}