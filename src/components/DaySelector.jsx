import { format, addDays } from "date-fns";
import { Calendar } from "lucide-react";
import "./components.css"; // Shared component styles
import "./DaySelector.css";  // Component-specific styles

export default function DaySelector({ 
  selectedDate, 
  onSelectDate,
  availabilityByDate = {},
  totalSeats = 50
}) {
  // Generate days excluding Sundays
  const days = [];
  let currentOffset = 0;
  
  while (days.length < 5) {
    const date = addDays(new Date(), currentOffset);
    const dayOfWeek = date.getDay();
    
    // Skip Sundays (0 = Sunday)
    if (dayOfWeek !== 0) {
      const dateStr = format(date, "yyyy-MM-dd");
      const available = availabilityByDate[dateStr] ?? totalSeats;
      
      days.push({
        date: dateStr,
        dayName: format(date, "EEEE"),
        dayNumber: format(date, "d"),
        monthName: format(date, "MMM"),
        available,
      });
    }
    
    currentOffset++;
  }

  // Helper function to replace cn()
  const classNames = (...classes) => {
    return classes.filter(Boolean).join(' ');
  }

  return (
    <div className="day-selector-container">
      <div className="day-selector-header">
        <Calendar className="day-selector-icon" />
        <h2 className="day-selector-title">Select Day</h2>
      </div>
      
      <div className="day-selector-grid">
        {days.map((day) => (
          <div
            key={day.date}
            className={classNames(
              "card day-card",
              "hover-elevate",
              "active-elevate-2",
              selectedDate === day.date && "is-selected"
            )}
            onClick={() => onSelectDate(day.date)}
            data-testid={`card-day-${day.date}`}
          >
            <div className="card-content day-card-content">
              <div className={classNames(
                "day-card-name",
                selectedDate === day.date && "text-primary"
              )}>
                {day.dayName}
              </div>
              <div className="day-card-number">
                {day.dayNumber}
              </div>
              <div className="day-card-month">
                {day.monthName}
              </div>
              <div className={classNames(
                "day-card-availability",
                day.available > 0 ? "text-primary" : "text-destructive"
              )}>
                {day.available} seats
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}