import { useState } from "react";
import { Loader2 } from "lucide-react";
import BrandLogo from "./BrandLogo";
import "./EmailVerification.css"; // Import the CSS file

export default function EmailVerification({ onVerified, onUnverified }) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    console.log("Verifying email:", email);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // TODO: Replace with actual API call to check email
    // For demo: emails ending with @alx.com are verified
    const isVerified = email.toLowerCase().endsWith("@alx.com");
    
    setIsLoading(false);
    
    if (isVerified) {
      onVerified(email);
    } else {
      onUnverified(email);
    }
  };

  return (
    <div className="email-verification-page">
      <div className="card">
        <div className="card-header">
          <div className="card-logo">
            <BrandLogo />
          </div>
          <div className="card-title-group">
            <h1 className="card-title">Welcome to ALX Workspace</h1>
            <p className="card-description">
              Enter your email to book your seat
            </p>
          </div>
        </div>
        <div className="card-content">
          <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="your.email@alx.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="form-input"
                data-testid="input-email"
              />
              <p className="form-helper-text">
                Enter your ALX email to continue
              </p>
            </div>
            <button
              type="submit"
              className="button button-primary"
              disabled={isLoading}
              data-testid="button-verify-email"
            >
              {isLoading ? (
                <>
                  <span className="spinner"><Loader2 /></span>
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Continue to Booking</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}