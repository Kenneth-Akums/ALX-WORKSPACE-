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
    
   try {
      // --- THIS IS THE NEW LOGIC ---
      const response = await fetch("/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        // If the server itself failed, treat as unverified
        throw new Error("Server verification failed");
      }

      const data = await response.json();

      if (data.isVerified) {
        onVerified(email);
      } else {
        onUnverified(email);
      }
      // --- END OF NEW LOGIC ---

    } catch (error) {
      console.error("Email verification error:", error);
      onUnverified(email); // Show modal on any error
    } finally {
      setIsLoading(false);
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