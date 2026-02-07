import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import HomePage from "./pages/HomePage";

/**
 * INSIGHTFORGE - Premium Analytics Platform
 * Main Application with Routing
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page - Marketing/SEO optimized */}
        <Route path="/" element={<LandingPage />} />

        {/* Home Page - Main Application Dashboard */}
        <Route path="/home" element={<HomePage />} />

        {/* Catch-all redirect to landing */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </Router>
  );
}

export default App;
