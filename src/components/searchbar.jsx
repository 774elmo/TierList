import React, { useState, useEffect, useRef } from "react";
import ProfileOverlay from "./profileoverlay";

export default function SearchBar() {
  const [searchText, setSearchText] = useState("");
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const errorTimeoutRef = useRef(null);

  // Fetch all players once on mount (cache data)
  const [allPlayers, setAllPlayers] = useState([]);
  useEffect(() => {
    async function fetchAllPlayers() {
      try {
        const res = await fetch("https://lifestealpvp.xyz/api/v1/data");
        const data = await res.json();
        setAllPlayers(data);
      } catch {
        setError("Failed to load player data.");
        startErrorTimeout();
      }
    }
    fetchAllPlayers();

    // Cleanup on unmount
    return () => {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    };
  }, []);

  // Start 2-second timeout to clear error
  function startErrorTimeout() {
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    errorTimeoutRef.current = setTimeout(() => {
      setError("");
    }, 2000);
  }

  // Search player by username on submit or enter
  function handleSearch(e) {
    e.preventDefault();
    setError("");
    setPlayerData(null);

    if (!searchText.trim()) return;

    setLoading(true);

    // Case insensitive search
    const found = allPlayers.find(
      (p) => p.username.toLowerCase() === searchText.toLowerCase()
    );

    if (found) {
      setPlayerData(found);
    } else {
      setError("Player not found");
      setSearchText(""); // Clear input immediately on error
      startErrorTimeout();
    }

    setLoading(false);
  }

  // Close overlay handler
  function closeOverlay() {
    setPlayerData(null);
    setSearchText("");
    setError("");
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
  }

  return (
    <>
      <form
        onSubmit={handleSearch}
        style={{ position: "relative", display: "flex", alignItems: "center" }}
        aria-label="Search Player..."
      >
        <input
          type="text"
          placeholder={error ? "" : "Search Player..."} // Hide placeholder on error
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            if (error) {
              setError(""); // Clear error on typing
              if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
            }
          }}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: error ? "2px solid #ef4444" : "2px solid #1f2937",
            outline: "none",
            fontSize: 16,
            width: 220,
            color: "#e5e7eb",
            backgroundColor: "#161E29",
            transition: "all 0.2s ease",
            boxShadow: "none",
          }}
          spellCheck={false}
          onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
          onBlur={(e) =>
            (e.target.style.borderColor = error ? "#ef4444" : "#1f2937")
          }
        />

        {error && (
          <div
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#ef4444",
              fontWeight: "600",
              fontSize: 14,
              pointerEvents: "none",
              userSelect: "none",
              whiteSpace: "nowrap",
            }}
          >
            {error}
          </div>
        )}
      </form>

      {playerData && (
        <ProfileOverlay player={playerData} onClose={closeOverlay} />
      )}
    </>
  );
}
