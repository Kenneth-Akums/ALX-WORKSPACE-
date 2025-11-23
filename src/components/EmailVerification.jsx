import { useState } from "react";
import { Loader2 } from "lucide-react";
import BrandLogo from "./BrandLogo.jsx"; // Use .jsx
import "./EmailVerification.css"; 

export default function EmailVerification({ onVerified, onUnverified }) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Verification check failed");
      }
      
      // The API now returns { isVerified: true, name: "Akunwanne Kenneth" }
      const data = await response.json(); 
      
      if (data.isVerified) {
        // FIX: Pass the email AND the full data object (which contains the name)
        onVerified(email, data); 
      } else {
        onUnverified(email);
      }
    } catch (error) {
      console.error("Email verification error:", error);
      alert("An error occurred. Please try again.");
    }
    
    setIsLoading(false);
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
                  Verifying...
                </>
              ) : (
                "Continue to Booking"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}