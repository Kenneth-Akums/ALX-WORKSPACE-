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
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [allBookings, setAllBookings] = useState([]);

  // This logic moves into the handleVerified function
  // useEffect(() => { ... }, []);

  const handleVerified = async (verifiedEmail) => {
    // 1. Fetch all bookings *after* verification
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

  const handleBookingComplete = async (seatNumber, date, hubId) => {
    const bookingData = {
      email: email,
      seatNumber: seatNumber,
      bookingDate: date,
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
      
      // If successful, update state to show confirmation
      setBookingDetails({ seatNumber, date, hubId });
      setStep("confirmation");

      // --- THIS IS FIX #1 ---
      // Add the new booking to our local state *with* the correct status
      // This ensures the UI is up-to-date for "Book Another"
      setAllBookings(currentBookings => [
        ...currentBookings,
        { 
          ...bookingData, 
          seatNumber: Number(seatNumber),
          bookingStatus: "Booked" // This was the missing piece
        }
      ]);
      // --- END FIX #1 ---

    } catch (error) {
      console.error("Failed to submit booking:", error);
      alert(error.message); 
    }
  };


  // --- THIS IS FIX #2 ---
  const handleBookAnother = () => {
    // Go back to the booking form, not the email page.
    // We keep the email and the (now updated) allBookings data.
    setStep("booking");
    setBookingDetails(null);
  };
  // --- END FIX #2 ---

  return (
    <>
      {step === "email" && (
        <EmailVerification
          onVerified={handleVerified}
          onUnverified={handleUnverified}
        />
      )}

      {step === "booking" && (
        <BookingForm
          email={email}
          onBookingComplete={handleBookingComplete}
          allBookings={allBookings}
        />
      )}

      {step === "confirmation" && bookingDetails && (
        <BookingConfirmation
          email={email}
          seatNumber={bookingDetails.seatNumber}
          bookingDate={bookingDetails.date}
          hubId={bookingDetails.hubId}
          onBookAnother={handleBookAnother}
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