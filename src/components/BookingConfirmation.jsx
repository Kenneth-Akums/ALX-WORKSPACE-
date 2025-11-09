import { CheckCircle2, Calendar, Armchair, Mail, Clock, MapPin } from "lucide-react";
import { format, parse } from "date-fns";
import { HUBS } from "./HubSelector"; // Import from our converted component
import "./components.css"; // Shared component styles
import "./BookingConfirmation.css"; // Component-specific styles

export default function BookingConfirmation({ 
  email, 
  seatNumber, 
  bookingDate,
  hubId,
  onBookAnother 
}) {
  const formattedDate = format(parse(bookingDate, "yyyy-MM-dd", new Date()), "EEEE, MMMM d, yyyy");
  const timestamp = format(new Date(), "h:mm a");
  const hub = HUBS.find(h => h.id === hubId);

  return (
    <div className="confirmation-page">
      <div className="card confirmation-card">
        <div className="card-header confirmation-header">
          {/* Guidelines: Confirmation icon at top */}
          <div className="confirmation-icon-wrapper">
            <CheckCircle2 className="confirmation-icon" />
          </div>
          <div>
            {/* Guidelines: Success message: "Your seat is reserved!" */}
            <h1 className="card-title">Booking Confirmed!</h1>
            <p className="card-description">
              Your seat is reserved
            </p>
          </div>
        </div>
        
        <div className="card-content confirmation-content">
          {/* Guidelines: Bordered card with sections */}
          <div className="details-box">
            
            <div className="detail-item">
              <Mail className="detail-icon" />
              <div className="detail-text">
                <p className="detail-label">Email</p>
                {/* Guidelines: Learner email (bold) */}
                <p className="detail-value" data-testid="text-email">{email}</p>
              </div>
            </div>
            
            <div className="detail-item">
              <MapPin className="detail-icon" />
              <div className="detail-text">
                <p className="detail-label">Hub Location</p>
                <p className="detail-value" data-testid="text-hub">{hub?.name}</p>
              </div>
            </div>
            
            <div className="detail-item">
              <Armchair className="detail-icon" />
              <div className="detail-text">
                <p className="detail-label">Seat Number</p>
                {/* Guidelines: Selected seat number (large, prominent) */}
                <p className="detail-value-large" data-testid="text-seat-number">{seatNumber}</p>
              </div>
            </div>
            
            <div className="detail-item">
              <Calendar className="detail-icon" />
              <div className="detail-text">
                <p className="detail-label">Booking Date</p>
                {/* Guidelines: Selected day (formatted date) */}
                <p className="detail-value" data-testid="text-booking-date">{formattedDate}</p>
              </div>
            </div>
            
            <div className="detail-item">
              <Clock className="detail-icon" />
              <div className="detail-text">
                <p className="detail-label">Booked At</p>
                {/* Guidelines: Timestamp of booking */}
                <p className="detail-value">{timestamp}</p>
              </div>
            </div>
          </div>

          <div className="info-box">
            <p>
              A confirmation has been sent to your email and recorded in the system.
            </p>
          </div>

          {/* Guidelines: Secondary action: "Book Another Seat" button */}
          <button
            onClick={onBookAnother}
            className="button button-outline"
            data-testid="button-book-another"
          >
            Book Another Seat
          </button>
        </div>
      </div>
    </div>
  );
}