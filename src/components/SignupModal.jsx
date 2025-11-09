import { AlertCircle, ExternalLink } from "lucide-react";
import "./SignupModal.css"; // Import the new CSS file

export default function SignupModal({ 
  isOpen, 
  onClose, 
  email, 
  signupUrl = "https://alx.com/signup" 
}) {
  
  const handleSignup = () => {
    console.log("Opening signup URL:", signupUrl);
    window.open(signupUrl, "_blank");
  };

  // Render nothing if the modal is not open
  if (!isOpen) {
    return null;
  }

  // Stop clicks inside the modal from closing it
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="modal-overlay" onClick={onClose} data-testid="modal-signup">
      <div className="modal-content" onClick={handleContentClick}>
        
        <div className="modal-header">
          <div className="modal-icon-wrapper">
            <AlertCircle className="modal-icon" />
          </div>
          <div className="modal-title-group">
            <h2 className="modal-title">Complete Your Registration</h2>
            <p className="modal-description">
              Your email <span className="modal-email">{email}</span> is not registered in our system.
            </p>
          </div>
        </div>
        
        <div className="modal-info-box">
          <p>
            We've sent instructions to <span className="modal-email">{email}</span> with details on how to get onboarded.
          </p>
        </div>

        <div className="modal-footer">
          <button
            onClick={handleSignup}
            className="button button-primary"
            data-testid="button-signup"
          >
            <span>Go to Sign Up</span>
            <ExternalLink />
          </button>
          <button
            variant="outline"
            onClick={onClose}
            className="button button-outline"
            data-testid="button-try-different-email"
          >
            Try Different Email
          </button>
        </div>

      </div>
    </div>
  );
}