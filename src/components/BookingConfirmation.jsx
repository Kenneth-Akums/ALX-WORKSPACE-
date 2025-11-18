import { CheckCircle2, Calendar, Armchair, Mail, Clock, MapPin, Trash2 } from "lucide-react";
import { format, parse } from "date-fns";
import { HUBS } from "./HubSelector.jsx"; // Use .jsx
import "./components.css"; 
import "./BookingConfirmation.css";

// --- NEW: Helper function to get first name ---
const getFirstName = (name) => {
  if (!name) return "";
  return name.split(" ")[0]; // Get the first part of the name
};

export default function BookingConfirmation({ 
  email, 
  userName, 
  seatNumber, 
  bookingDate,
  bookingTime, // NEW PROP
  hubId,
  onBookAnother,
  onCancelBooking // NEW PROP
}) {
  const formattedDate = format(parse(bookingDate, "yyyy-MM-dd", new Date()), "EEEE, MMMM d, yyyy");
  const welcomeName = getFirstName(userName) || email;
  const hub = HUBS.find(h => h.id === hubId);
  
  
  

  return (
    <div className="confirmation-page">
      <div className="card confirmation-card">
        <div className="card-header confirmation-header">
          <div className="confirmation-icon-wrapper">
            <CheckCircle2 className="confirmation-icon" />
          </div>
          <div>
            <h1 className="card-title">Booking Confirmed, {welcomeName}!</h1>
            <p className="card-description">
              Your seat is reserved
            </p>
          </div>
        </div>
        
        <div className="card-content confirmation-content">
          <div className="details-box">
            
            <div className="detail-item">
              <MapPin className="detail-icon" />
              <div className="detail-text">
                <p className="detail-label">Hub Location</p>
                <p className="detail-value">{hub?.name}</p>
              </div>
            </div>
            
            <div className="detail-item">
              <Armchair className="detail-icon" />
              <div className="detail-text">
                <p className="detail-label">Seat Number</p>
                <p className="detail-value-large">{seatNumber}</p>
              </div>
            </div>
            
            <div className="detail-item">
              <Calendar className="detail-icon" />
              <div className="detail-text">
                <p className="detail-label">Date</p>
                <p className="detail-value">{formattedDate}</p>
              </div>
            </div>
            
            <div className="detail-item">
              <Clock className="detail-icon" />
              <div className="detail-text">
                <p className="detail-label">Arrival Time</p>
                <p className="detail-value">{bookingTime}</p>
              </div>
            </div>
          </div>

          <div className="info-box">
            <p>A confirmation has been sent to your email.</p>
          </div>

          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <button
              onClick={onBookAnother}
              className="button button-outline"
            >
              Book Another Seat
            </button>
            
            <button
              onClick={onCancelBooking}
              className="button"
              style={{ 
                backgroundColor: 'hsl(var(--destructive))', 
                color: 'white',
                border: '1px solid hsl(var(--destructive))'
              }}
            >
              <Trash2 style={{ width: '1rem', height: '1rem' }} />
              Cancel Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}