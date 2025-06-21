import React, { useState, useEffect, useRef } from "react";
import ProfileOverlay from "./profileoverlay";

export default function SearchBar() {
  const [searchText, setSearchText] = useState("");
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const errorTimeoutRef = useRef(null);

  const [allPlayers, setAllPlayers] = useState([]);
  useEffect(() => {
    async function fetchAllPlayers() {
      try {
        const res = await fetch("https://api.lifestealpvp.xyz/api/v1/data");
        const data = await res.json();
        setAllPlayers(data);
      } catch {
        setError("Failed to load player data.");
        startErrorTimeout();
      }
    }
    fetchAllPlayers();

    return () => {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    };
  }, []);

  function startErrorTimeout() {
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    errorTimeoutRef.current = setTimeout(() => setError(""), 2000);
  }

  function handleSearch(e) {
    e.preventDefault();
    if (!searchText.trim()) return;

    setError("");
    setPlayerData(null);
    setLoading(true);

    const found = allPlayers.find(
      (p) => p.username.toLowerCase() === searchText.toLowerCase()
    );

    if (found) {
      setPlayerData(found);
    } else {
      setError("Player not found");
      setSearchText("");
      startErrorTimeout();
    }

    setLoading(false);
  }

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
        style={styles.form}
        aria-label="Search Player"
      >
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
          style={{
            ...styles.input,
            borderColor: error ? "#ef4444" : "#1f2937",
          }}
          spellCheck={false}
          onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
          onBlur={(e) => (e.target.style.borderColor = error ? "#ef4444" : "#1f2937")}
        />

        {loading && <div style={styles.loading}>Loading...</div>}

        {error && <div style={styles.error}>{error}</div>}
      </form>

      {playerData && <ProfileOverlay player={playerData} onClose={closeOverlay} />}
    </>
  );
}

const styles = {
  form: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    width: "100%",
    maxWidth: 300,
  },
  input: {
    padding: "8px 12px",
    borderRadius: 8,
    border: "2px solid #1f2937",
    outline: "none",
    fontSize: 16,
    width: "100%",
    color: "#e5e7eb",
    backgroundColor: "#161E29",
    transition: "all 0.2s ease",
    boxShadow: "none",
  },
  loading: {
    position: "absolute",
    right: -60,
    color: "#e5e7eb",
    fontSize: 14,
  },
  error: {
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
  },
};
