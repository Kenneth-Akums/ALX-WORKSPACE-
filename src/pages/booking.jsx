// import { useState } from "react";
// import EmailVerification from "../components/EmailVerification.jsx";
// import SignupModal from "../components/SignupModal.jsx";
// import BookingForm from "../components/BookingForm.jsx";
// import BookingConfirmation from "../components/BookingConfirmation.jsx";

// export default function BookingPage() {
//   const [step, setStep] = useState("email"); // "email" | "booking" | "confirmation"
//   const [email, setEmail] = useState("");
//   const [showSignupModal, setShowSignupModal] = useState(false);
//   const [bookingDetails, setBookingDetails] = useState(null);
//   const [allBookings, setAllBookings] = useState([]);

//   // DO NOT fetch on mount. We will fetch AFTER verification.
//   // The useEffect hook has been removed.

//   const handleVerified = async (verifiedEmail) => {
//     // --- THIS IS THE NEW LOGIC ---
//     // First, fetch all the booking data
//     try {
//       console.log("Fetching all bookings...");
//       // 1. Use the correct URL
//       const response = await fetch("/api/get-bookings"); 
      
//       if (!response.ok) {
//         throw new Error("Failed to fetch booking data");
//       }
      
//       const data = await response.json();
//       // 2. Set the data as a direct array
//       setAllBookings(data); 
      
//       // 3. Now that we have the data, proceed to the booking form
//       setEmail(verifiedEmail);
//       setStep("booking");

//     } catch (error) {
//       console.error("Failed to fetch bookings:", error);
//       alert("Could not load booking data. Please try again.");
//     }
//     // --- END NEW LOGIC ---
//   };

//   const handleUnverified = (unverifiedEmail) => {
//     setEmail(unverifiedEmail);
//     setShowSignupModal(true);
//     console.log("Sending signup email to:", unverifiedEmail);
//   };

//   const handleBookingComplete = async (seatNumber, date, hubId) => {
//     const bookingData = {
//       email: email,
//       seatNumber: seatNumber,
//       bookingDate: date,
//       hubId: hubId,
//     };

//     try {
//       const response = await fetch("/api/book-seat", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(bookingData),
//       });

//       if (!response.ok) {
//         let errorMessage = "Booking failed on server.";
//         try {
//           const errorData = await response.json();
//           errorMessage = errorData.message || errorMessage;

//           // --- THIS IS THE FIX for double-booking ---
//           // 409 is the "Conflict" error we set up
//           if (response.status === 409) {
//             alert(errorMessage); // Show the "Seat taken" message
            
//             // Re-fetch bookings to update the UI
//             console.log("Re-fetching bookings after conflict...");
//             const bookingsRes = await fetch("/api/get-bookings");
//             const bookings = await bookingsRes.json();
//             setAllBookings(bookings);
//             return; // Stay on the booking form
//           }
//           // --- END FIX ---
//         } catch (e) {
//           // Response wasn't JSON, just use the generic error
//         }
//         throw new Error(errorMessage);
//       }
      
//       // If successful, update state to show confirmation
//       setBookingDetails({ seatNumber, date, hubId });
//       setStep("confirmation");
      
//       // --- NEW: Add the new booking to our local state ---
//       // This will make the UI update if the user clicks "Book Another"
//       setAllBookings(currentBookings => [
//         ...currentBookings,
//         { ...bookingData, seatNumber: Number(seatNumber) }
//       ]);
//       // --- END NEW ---

//     } catch (error) {
//       console.error("Failed to submit booking:", error);
//       alert(error.message); // Show the error to the user
//     }
//   };

//   const handleBookAnother = () => {
//     setStep("booking"); // Go back to booking form, not email
//     // We keep the email and allBookings data
//     setBookingDetails(null);
//   };

//   return (
//     <>
//       {step === "email" && (
//         <EmailVerification
//           onVerified={handleVerified}
//           onUnverified={handleUnverified}
//         />
//       )}

//       {step === "booking" && (
//         <BookingForm
//           email={email}
//           onBookingComplete={handleBookingComplete}
//           allBookings={allBookings}
//         />
//       )}

//       {step === "confirmation" && bookingDetails && (
//         <BookingConfirmation
//           email={email}
//           seatNumber={bookingDetails.seatNumber}
//           bookingDate={bookingDetails.date}
//           hubId={bookingDetails.hubId}
//           onBookAnother={handleBookAnother}
//         />
//       )}

//       <SignupModal
//         isOpen={showSignupModal}
//         onClose={() => {
//           setShowSignupModal(false);
//           setEmail("");
//         }}
//         email={email}
//       />
//     </>
//   );
// }

import { useState } from "react";
import EmailVerification from "../components/EmailVerification.jsx";
import SignupModal from "../components/SignupModal.jsx";
import BookingForm from "../components/BookingForm.jsx";
import BookingConfirmation from "../components/BookingConfirmation.jsx";

export default function BookingPage() {
  const [step, setStep] = useState("email"); // "email" | "booking" | "confirmation"
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState(""); // --- NEW: Store the user's name ---
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [allBookings, setAllBookings] = useState([]);

  const handleVerified = async (verifiedEmail, verificationData) => {
    // --- UPDATED: Receive name from API response ---
    try {
      console.log("Fetching all bookings...");
      const response = await fetch("/api/get-bookings");
      
      if (!response.ok) {
        throw new Error("Failed to fetch booking data");
      }
      
      const data = await response.json();
      setAllBookings(data); 
      
      // 2. Now proceed to the booking form
      setEmail(verifiedEmail);
      setUserName(verificationData.name || ""); // Store the name
      setStep("booking");

    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      alert("Could not load booking data. Please try again.");
    }
  };

  const handleUnverified = (unverifiedEmail) => {
    setEmail(unverifiedEmail);
    setShowSignupModal(true);
    console.log("Sending signup email to:", unverifiedEmail);
  };

  const handleBookingComplete = async (seatNumber, date, hubId, bookingTime) => {
    const bookingData = {
      email: email,
      seatNumber: seatNumber,
      bookingDate: date,
      bookingTime: bookingTime, // Pass time
      hubId: hubId,
    };

    try {
      const response = await fetch("/api/book-seat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        let errorMessage = "Booking failed on server.";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;

          if (response.status === 409) {
            alert(errorMessage); 
            console.log("Re-fetching bookings after conflict...");
            const bookingsRes = await fetch("/api/get-bookings");
            const bookings = await bookingsRes.json();
            setAllBookings(bookings);
            return; 
          }
        } catch (e) {
          // Response wasn't JSON
        }
        throw new Error(errorMessage);
      }
      
      setBookingDetails({ seatNumber, bookingDate: date, hubId, bookingTime });
      setStep("confirmation");

      setAllBookings(currentBookings => [
        ...currentBookings,
        { 
          ...bookingData, 
          seatNumber: Number(seatNumber),
          bookingStatus: "Booked"
        }
      ]);
    } catch (error) {
      console.error("Failed to submit booking:", error);
      alert(error.message); 
    }
  };


const handleCancelBooking = async (dateToCancel) => {
    if (!window.confirm(`Are you sure you want to cancel this booking ${dateToCancel}?`)) return;
    
    try {
      const response = await fetch("/api/cancel-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email, 
          date: dateToCancel 
        }),
      });

      if (!response.ok) throw new Error("Failed to cancel");

      alert("Booking Cancelled Successfully");
      
      // Refresh data
      const bookingsRes = await fetch("/api/get-bookings");
      const bookings = await bookingsRes.json();
      setAllBookings(bookings);
      
      if (step === "confirmation") {
      setBookingDetails(null);
      setStep("booking");
      }

    } catch (error) {
      console.error(error);
      alert("Error cancelling booking");
    }
  };



  const handleBookAnother = () => {
    setStep("booking");
    setBookingDetails(null);
  };

  return (
    <>
      {step === "email" && (
        <EmailVerification
          onVerified={handleVerified} // handleVerified now expects (email, data)
          onUnverified={handleUnverified}
        />
      )}

      {step === "booking" && (
        <BookingForm
          email={email}
          userName={userName} // --- NEW: Pass the name down ---
          onBookingComplete={handleBookingComplete}
          onCancelBooking={handleCancelBooking}
          allBookings={allBookings}
        />
      )}

      {step === "confirmation" && bookingDetails && (
        <BookingConfirmation
          email={email}
          userName={userName}
          seatNumber={bookingDetails.seatNumber}
          bookingDate={bookingDetails.bookingDate}
          bookingTime={bookingDetails.bookingTime} // Pass time
          hubId={bookingDetails.hubId}
          onBookAnother={handleBookAnother}
          onCancelBooking={() => handleCancelBooking(bookingDetails.bookingDate)} // Pass cancel
        />
      )}

      <SignupModal
        isOpen={showSignupModal}
        onClose={() => {
          setShowSignupModal(false);
          setEmail("");
        }}
        email={email}
      />
    </>
  );
}