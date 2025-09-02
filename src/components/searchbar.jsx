import React, { useState, useRef } from "react";
import ProfileOverlay from "./ProfileOverlay";
import "../css/SearchBar.css";

export default function SearchBar() {
  const [searchText, setSearchText] = useState("");
  const [playerData, setPlayerData] = useState(null);
  const [error, setError] = useState("");

  const errorTimeoutRef = useRef(null);

  function startErrorTimeout() {
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    errorTimeoutRef.current = setTimeout(() => setError(""), 2000);
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (!searchText.trim()) return;

    setError("");
    setPlayerData(null);

    try {
      const res = await fetch(
        `https://api.extiers.xyz/api/v1/data?search=${encodeURIComponent(
          searchText.trim()
        )}`
      );

      if (res.status === 404) {
        setError("Player not found");
        startErrorTimeout();
      } else if (!res.ok) {
        setError("Failed to fetch player data");
        startErrorTimeout();
      } else {
        const data = await res.json();
        setPlayerData(data[0] || data);
      }
    } catch {
      setError("Failed to fetch player data");
      startErrorTimeout();
    }
  }

  function closeOverlay() {
    setPlayerData(null);
    setSearchText("");
    setError("");
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
  }

  return (
    <>
      <form onSubmit={handleSearch} className="search-bar" aria-label="Search Player">
        <input
          type="text"
          placeholder={error ? "" : "Search Player..."}
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            if (error) {
              setError("");
              if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
            }
          }}
          spellCheck={false}
        />
        <span className="search-icon" />
        {error && <span className="search-error">{error}</span>}
      </form>

      {playerData && (
        <ProfileOverlay playerUuid={playerData.uuid} onClose={closeOverlay} />
      )}
    </>
  );
}
