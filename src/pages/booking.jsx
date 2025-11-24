// import { useState, useEffect } from "react";
// import EmailVerification from "../components/EmailVerification.jsx";
// import SignupModal from "../components/SignupModal.jsx";
// import BookingForm from "../components/BookingForm.jsx";
// import BookingConfirmation from "../components/BookingConfirmation.jsx";

// export default function BookingPage() {
//   const [step, setStep] = useState("email"); // "email" | "booking" | "confirmation"
//   const [email, setEmail] = useState("");
//   const [userName, setUserName] = useState(""); // --- NEW: Store the user's name ---
//   const [showSignupModal, setShowSignupModal] = useState(false);
//   const [bookingDetails, setBookingDetails] = useState(null);
//   const [allBookings, setAllBookings] = useState([]);

//   // Fetch bookings on every page load so UI reflects current sheet state
//   useEffect(() => {
//     const fetchBookings = async () => {
//       try {
//         console.log("Fetching bookings on mount...");
//         const res = await fetch("/api/get-bookings");
//         if (!res.ok) {
//           console.error("Failed to fetch bookings on mount", res.status);
//           return;
//         }
//         const bookings = await res.json();
//         setAllBookings(bookings);
//       } catch (err) {
//         console.error("Error fetching bookings on mount:", err);
//       }
//     };

//     fetchBookings();
//   }, []);

//   const handleVerified = async (verifiedEmail, verificationData) => {
//     // --- UPDATED: Receive name from API response ---
//     try {
//       console.log("Fetching all bookings...");
//       const response = await fetch("/api/get-bookings");
      
//       if (!response.ok) {
//         throw new Error("Failed to fetch booking data");
//       }
      
//       const data = await response.json();
//       setAllBookings(data); 
      
//       // 2. Now proceed to the booking form
//       setEmail(verifiedEmail);
//       setUserName(verificationData.name || ""); // Store the name
//       setStep("booking");

//     } catch (error) {
//       console.error("Failed to fetch bookings:", error);
//       alert("Could not load booking data. Please try again.");
//     }
//   };

//   const handleUnverified = (unverifiedEmail) => {
//     setEmail(unverifiedEmail);
//     setShowSignupModal(true);
//     console.log("Sending signup email to:", unverifiedEmail);
//   };

//   const handleBookingComplete = async (seatNumber, date, hubId, bookingTime) => {
//     const bookingData = {
//       email: email,
//       seatNumber: seatNumber,
//       bookingDate: date,
//       bookingTime: bookingTime, // Pass time
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

//           if (response.status === 409) {
//             alert(errorMessage); 
//             console.log("Re-fetching bookings after conflict...");
//             const bookingsRes = await fetch("/api/get-bookings");
//             const bookings = await bookingsRes.json();
//             setAllBookings(bookings);
//             return; 
//           }
//         } catch (e) {
//           // Response wasn't JSON
//         }
//         throw new Error(errorMessage);
//       }
      
//       setBookingDetails({ seatNumber, bookingDate: date, hubId, bookingTime });
//       setStep("confirmation");

//       setAllBookings(currentBookings => [
//         ...currentBookings,
//         { 
//           ...bookingData, 
//           seatNumber: Number(seatNumber),
//           bookingStatus: "Booked"
//         }
//       ]);
//     } catch (error) {
//       console.error("Failed to submit booking:", error);
//       alert(error.message); 
//     }
//   };


// const handleCancelBooking = async (dateToCancel) => {
//     if (!window.confirm(`Are you sure you want to cancel this booking ${dateToCancel}?`)) return;
    
//     try {
//       const response = await fetch("/api/cancel-booking", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ 
//           email: email, 
//           date: dateToCancel 
//         }),
//       });

//       if (!response.ok) throw new Error("Failed to cancel");

//       alert("Booking Cancelled Successfully");
      
//       // Refresh data
//       const bookingsRes = await fetch("/api/get-bookings");
//       const bookings = await bookingsRes.json();
//       setAllBookings(bookings);
      
//       if (step === "confirmation") {
//       setBookingDetails(null);
//       setStep("booking");
//       }

//     } catch (error) {
//       console.error(error);
//       alert("Error cancelling booking");
//     }
//   };



//   const handleBookAnother = () => {
//     setStep("booking");
//     setBookingDetails(null);
//   };

//   return (
//     <>
//       {step === "email" && (
//         <EmailVerification
//           onVerified={handleVerified} // handleVerified now expects (email, data)
//           onUnverified={handleUnverified}
//         />
//       )}

//       {step === "booking" && (
//         <BookingForm
//           email={email}
//           userName={userName} // --- NEW: Pass the name down ---
//           onBookingComplete={handleBookingComplete}
//           onCancelBooking={handleCancelBooking}
//           allBookings={allBookings}
//         />
//       )}

//       {step === "confirmation" && bookingDetails && (
//         <BookingConfirmation
//           email={email}
//           userName={userName}
//           seatNumber={bookingDetails.seatNumber}
//           bookingDate={bookingDetails.bookingDate}
//           bookingTime={bookingDetails.bookingTime} // Pass time
//           hubId={bookingDetails.hubId}
//           onBookAnother={handleBookAnother}
//           onCancelBooking={() => handleCancelBooking(bookingDetails.bookingDate)} // Pass cancel
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



import { useState, useEffect, useCallback } from "react";
import EmailVerification from "../components/EmailVerification.jsx";
import SignupModal from "../components/SignupModal.jsx";
import BookingForm from "../components/BookingForm.jsx";
import BookingConfirmation from "../components/BookingConfirmation.jsx";

export default function BookingPage() {
  // --- FIX 1: LAZY INITIALIZATION (Reads LocalStorage BEFORE first render) ---
  const [email, setEmail] = useState(() => {
    return localStorage.getItem("alx_user_email") || "";
  });

  const [userName, setUserName] = useState(() => {
    return localStorage.getItem("alx_user_name") || "";
  });

  // If email exists in storage, start directly at 'booking' step
  const [step, setStep] = useState(() => {
    return localStorage.getItem("alx_user_email") ? "booking" : "email";
  });
  // -------------------------------------------------------------------------

  const [showSignupModal, setShowSignupModal] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [allBookings, setAllBookings] = useState([]);

  // Stable fetch function
  const fetchBookings = useCallback(async () => {
    try {
      console.log("Fetching latest bookings...");
      const response = await fetch("/api/get-bookings");
      if (!response.ok) throw new Error("Failed to fetch booking data");
      const data = await response.json();
      setAllBookings(data);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    }
  }, []);

  // --- FIX 2: Fetch Data Immediately if Logged In ---
  useEffect(() => {
    if (email) {
      fetchBookings();
    }
  }, [email, fetchBookings]); 
  // -------------------------------------------------

  const handleVerified = async (verifiedEmail, verificationData) => {
    const name = verificationData.name || "";
    
    // Save to LocalStorage
    localStorage.setItem("alx_user_email", verifiedEmail);
    localStorage.setItem("alx_user_name", name);

    // Update State
    setEmail(verifiedEmail);
    setUserName(name);
    
    // Move to Booking Step
    setStep("booking");
    // fetchBookings will run automatically due to useEffect dependency on 'email'
  };

  const handleUnverified = (unverifiedEmail) => {
    setEmail(unverifiedEmail);
    setShowSignupModal(true);
  };

  const handleBookingComplete = async (seatNumber, date, hubId, bookingTime) => {
    // generate client idempotency key
    const clientBookingId = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    const bookingData = {
      email: email,
      seatNumber: seatNumber,
      bookingDate: date,
      bookingTime: bookingTime,
      hubId: hubId,
      clientBookingId,
    };

    try {
      const response = await fetch("/api/book-seat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        let errorMessage = "Booking failed on server.";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          
          if (response.status === 409) {
            alert(errorMessage);
            await fetchBookings(); 
            return; 
          }
        } catch (e) {}
        throw new Error(errorMessage);
      }

      const respJson = await response.json();
      const isIdempotentHit = respJson && respJson.existing;
      const bookingRecord = isIdempotentHit ? respJson.existing : { ...bookingData, seatNumber: Number(seatNumber), bookingStatus: "Booked" };

      setBookingDetails({ seatNumber, bookingDate: date, hubId, bookingTime });
      setStep("confirmation");

      setAllBookings(prev => {
        if (isIdempotentHit) {
          const already = prev.find(b => (b.clientBookingId || '') === bookingRecord.clientBookingId);
          if (already) return prev;
          return [...prev, bookingRecord];
        }
        return [...prev, bookingRecord];
      });

    } catch (error) {
      console.error("Failed to submit booking:", error);
      alert(error.message); 
    }
  };

  const handleCancelBooking = async (dateToCancel) => {
    if (!window.confirm(`Are you sure you want to cancel this booking for ${dateToCancel}?`)) return;
    
    try {
      const response = await fetch("/api/cancel-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, date: dateToCancel }),
      });

      if (!response.ok) throw new Error("Failed to cancel");

      alert("Booking Cancelled Successfully");
      await fetchBookings(); 
      
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

  const handleBackToVerification = () => {
    // Clear stored session and return to verification
    localStorage.removeItem("alx_user_email");
    localStorage.removeItem("alx_user_name");
    setEmail("");
    setUserName("");
    setAllBookings([]);
    setBookingDetails(null);
    setStep("email");
  };

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
          userName={userName}
          onBookingComplete={handleBookingComplete}
          onCancelBooking={handleCancelBooking}
          allBookings={allBookings}
          onBackToVerify={handleBackToVerification}
        />
      )}

      {step === "confirmation" && bookingDetails && (
        <BookingConfirmation
          email={email}
          userName={userName}
          seatNumber={bookingDetails.seatNumber}
          bookingDate={bookingDetails.bookingDate}
          bookingTime={bookingDetails.bookingTime}
          hubId={bookingDetails.hubId}
          onBookAnother={handleBookAnother}
          onCancelBooking={() => handleCancelBooking(bookingDetails.bookingDate)}
          onBackToVerify={handleBackToVerification}
        
        />
      )}

      <SignupModal
        isOpen={showSignupModal}
        onClose={() => { setShowSignupModal(false); setEmail(""); }}
        email={email}
      />
    </>
  );
}