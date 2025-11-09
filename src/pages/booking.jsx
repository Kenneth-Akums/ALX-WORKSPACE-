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

  const handleBookingComplete = (seatNumber, date, hubId) => {
    setBookingDetails({ seatNumber, date, hubId });
    setStep("confirmation");
    // TODO: Send booking data to Google Sheets
    console.log("Saving to Google Sheets:", { email, seatNumber, date, hubId });
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