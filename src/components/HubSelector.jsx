// import { MapPin } from "lucide-react";
// import "./components.css"; // Shared component styles
// import "./HubSelector.css";  // Component-specific styles

// export const HUBS = [
//   { id: "costain", name: "Costain Hub", location: "Costain", totalSeats: 100 },
//   { id: "ralno", name: "Ralno Hub", location: "Ralno", totalSeats: 40 },
//   { id: "ajah", name: "Ajah Hub", location: "Ajah", totalSeats: 50 },
// ];

// export default function HubSelector({ selectedHub, onSelectHub }) {
  
//   // Helper function to replace cn()
//   const classNames = (...classes) => {
//     return classes.filter(Boolean).join(' ');
//   }
  
//   return (
//     <div className="hub-selector-container">
//       <div className="hub-selector-header">
//         <MapPin className="hub-selector-icon" />
//         <h2 className="hub-selector-title">Select Hub Location</h2>
//       </div>
      
//       <div className="hub-selector-grid">
//         {HUBS.map((hub) => (
//           <div
//             key={hub.id}
//             className={classNames(
//               "card hub-card",
//               "hover-elevate",
//               "active-elevate-2",
//               selectedHub === hub.id && "is-selected"
//             )}
//             onClick={() => onSelectHub(hub.id)}
//             data-testid={`card-hub-${hub.id}`}
//           >
//             <div className="card-content hub-card-content">
//               <div className="hub-card-header">
//                 <div className="hub-card-title-group">
//                   <h3 className={classNames(
//                     "hub-card-title",
//                     selectedHub === hub.id && "text-primary"
//                   )}>
//                     {hub.name}
//                   </h3>
//                   <p className="hub-card-location">{hub.location}</p>
//                 </div>
//               </div>
//               <div className="hub-card-footer">
//                 <p className="hub-card-seats">
//                   {hub.totalSeats} seats available
//                 </p>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

import { MapPin } from "lucide-react";
import "./components.css"; 
import "./HubSelector.css"; 

export const HUBS = [
  { id: "costain", name: "Costain Hub", location: "Costain", totalSeats: 100 },
  { id: "ralno", name: "Ralno Hub", location: "Ralno", totalSeats: 40 },
  { id: "ajah", name: "Ajah Hub", location: "Ajah", totalSeats: 50 },
];

export default function HubSelector({ 
  selectedHub, 
  onSelectHub, 
  availabilityByHub = {}, 
  myBookings = [],
  selectedDate // --- NEW PROP ---
}) {
  
  const classNames = (...classes) => {
    return classes.filter(Boolean).join(' ');
  }
  
  return (
    <div className="hub-selector-container">
      <div className="hub-selector-header">
        <MapPin className="hub-selector-icon" />
        <h2 className="hub-selector-title">Select Hub Location</h2>
      </div>
      
      <div className="hub-selector-grid">
        {HUBS.map((hub) => {
          // Total booked (by everyone) for all 5 days
          const totalBooked = availabilityByHub[hub.id] || 0;
          const available = hub.totalSeats - totalBooked;
          
          // --- UPDATED LOGIC ---
          // Check if I have a booking for *this specific hub* on the *selected day*
          const myBookingForSelectedDateAndHub = myBookings.find(
            b => b.hubId === hub.id && b.bookingDate === selectedDate
          );
          
          // Check if I have *any* booking at this hub (for the purple border)
          const hasMyBookingAtThisHub = myBookings.some(b => b.hubId === hub.id);
          // --- END UPDATED LOGIC ---
          
          return (
            <div
              key={hub.id}
              className={classNames(
                "card hub-card",
                "hover-elevate",
                "active-elevate-2",
                selectedHub === hub.id && "is-selected",
                available <= 0 && !hasMyBookingAtThisHub && "is-disabled",
                // Show purple border if I have *any* booking here
                hasMyBookingAtThisHub && "is-my-booking" 
              )}
              onClick={() => available > 0 && onSelectHub(hub.id)} 
              data-testid={`card-hub-${hub.id}`}
            >
              <div className="card-content hub-card-content">
                <div className="hub-card-header">
                  <div className="hub-card-title-group">
                    <h3 className={classNames(
                      "hub-card-title",
                      selectedHub === hub.id && "text-primary"
                    )}>
                      {hub.name}
                    </h3>
                    <p className="hub-card-location">{hub.location}</p>
                  </div>
                </div>
                <div className="hub-card-footer">
                  {/* --- UPDATED TEXT AND STYLE LOGIC --- */}
                  <p className={classNames(
                    "hub-card-seats",
                    available <= 0 && "text-destructive",
                    myBookingForSelectedDateAndHub && "text-accent" // Purple if booked *today*
                  )}>
                    {myBookingForSelectedDateAndHub
                      ? "Booked by You" // Text if booked *today*
                      : `${available} seats available`
                    }
                  </p>
                  {/* --- END UPDATE --- */}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}