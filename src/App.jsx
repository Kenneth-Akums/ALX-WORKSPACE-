import { Switch, Route } from "wouter";
import BookingPage from "./pages/booking";

// A simple component for a 404 Not Found page
function NotFound() {
  return <h2>404: Page Not Found</h2>;
}

export default function App() {
  return (
    <Switch>
      <Route path="/" component={BookingPage} />
      <Route component={NotFound} />
    </Switch>
  );
}