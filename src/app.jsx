import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Leaderboard from "./components/leaderboard";
import Lifesteal from "./pages/lifesteal";
import TridentMace from "./pages/tridentmace";

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
      <Route path="/rankings/trident_mace" element={<TridentMace />} />

      {/* Catch all redirect */}
      <Route path="*" element={<Navigate to="/rankings/overall" replace />} />
    </Routes>
  );
}
