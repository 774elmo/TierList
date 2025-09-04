import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import GamemodeRanking from "./pages/rankings/GamemodeRanking";
import Overall from "./pages/rankings/Overall";
import DiscordPage from "./pages/discord/discord";
import Posts from "./pages/posts/posts";

export default function App() {
  return (
    <Router>
      <div className="app-wrapper">

      <Routes>
        <Route path="/" element={<Navigate to="/rankings/overall" replace />} />
        <Route path="/rankings/overall" element={<Overall />} />
        
        {/* Dynamic gamemode route */}
        <Route path="/rankings/:gamemode" element={<GamemodeRanking />} />

        <Route path="/discords" element={<DiscordPage />} />

        <Route path="/posts/*" element={<Posts />} />
      </Routes>

      </div>
    </Router>
  );
}
