import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Leaderboard from "./components/leaderboard";
import Lifesteal from "./pages/lifesteal";
import Infuse from "./pages/infuse";
import Glitch from "./pages/glitch";
import Strength from "./pages/strength";
import Bliss from "./pages/bliss";

export default function App() {
  return (
    <Routes>
      {/* Redirect root to /rankings/overall */}
      <Route path="/" element={<Navigate to="/rankings/overall" replace />} />

      {/* Redirect /rankings to /rankings/overall */}
      <Route path="/rankings" element={<Navigate to="/rankings/overall" replace />} />

      {/* Actual leaderboard routes */}
      <Route path="/rankings/overall" element={<Leaderboard />} />
      <Route path="/rankings/lifesteal" element={<Lifesteal />} />
      <Route path="/rankings/infuse" element={<Infuse />} />
      <Route path="/rankings/bliss" element={<Bliss />} />
      <Route path="/rankings/strength" element={<Strength />} />
      <Route path="/rankings/glitch" element={<Glitch />} />


      {/* Catch all redirect */}
      <Route path="*" element={<Navigate to="/rankings/overall" replace />} />
    </Routes>
  );
}
