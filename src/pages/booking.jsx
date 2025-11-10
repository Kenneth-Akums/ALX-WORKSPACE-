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

  const handleVerified = (verifiedEmail) => {
    setEmail(verifiedEmail);
    setStep("booking");
  };

  const handleUnverified = (unverifiedEmail) => {
    setEmail(unverifiedEmail);
    setShowSignupModal(true);
    // TODO: Trigger API call to send email with signup link
    console.log("Sending signup email to:", unverifiedEmail);
  };

  // const handleBookingComplete = (seatNumber, date, hubId) => {
  //   setBookingDetails({ seatNumber, date, hubId });
  //   setStep("confirmation");
  //   // TODO: Send booking data to Google Sheets
  //   console.log("Saving to Google Sheets:", { email, seatNumber, date, hubId });
  // };


  const handleBookingComplete = async (seatNumber, date, hubId) => {
    const bookingData = {
      email: email,
      seatNumber: seatNumber,
      bookingDate: date,
      hubId: hubId,
    };

    try {
      // 1. Call our new backend endpoint
      const response = await fetch("/api/book-seat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        // Handle server errors (e.g., "Sheet not found")
        const errorData = await response.json();
        throw new Error(errorData.message || "Booking failed on server.");
      }
      
      // 2. If successful, update state to show confirmation
      setBookingDetails({ seatNumber, date, hubId });
      setStep("confirmation");

    } catch (error) {
      console.error("Failed to submit booking:", error);
      // Here you could use a toast or modal to show the error
      // For now, we'll log it and not proceed to the confirmation
    }
  };

  const handleBookAnother = () => {
    setStep("email");
    setEmail("");
    setBookingDetails(null);
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
          onBookingComplete={handleBookingComplete}
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