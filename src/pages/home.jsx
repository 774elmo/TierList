import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/pageheader";
import GamemodeTabs from "../components/gamemodetabs";
import SearchBar from "../components/searchbar";

import SMPTiersImage from "../assets/smptiers.png"; // adjust if needed
import HomeIcon from "../assets/home.svg";
import RankingsIcon from "../assets/rankings.svg";
import DiscordIcon from "../assets/discord.svg";
import caretUp from "../assets/caret-up.svg";
import { getGamemodeIcon } from "../components/gamemodeicons";

export default function Home() {
  const navigate = useNavigate();
  const [discordPopupOpen, setDiscordPopupOpen] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Track which announcement popup is open (full view)
  const [popupAnnouncement, setPopupAnnouncement] = useState(null);
  // Track hovered announcement id for inline hover effect
  const [hoveredId, setHoveredId] = useState(null);

  const lifestealLink = "https://discord.gg/lifestealpvp";
  const strengthLink = "https://discord.gg/W58sv4nrRS";
  const infuseLink = "https://discord.gg/HF3m4b3HQF";
  const glitchLink = "https://discord.gg/G2BJc8NfDd";
  const blissLink = "https://discord.gg/WkTkYMUGsK";

  useEffect(() => {
    fetch("https://api.lifestealpvp.xyz/api/v1/announcements")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch announcements");
        return res.json();
      })
      .then((data) => {
        setAnnouncements(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Close popup handler
  const closePopup = () => {
    setPopupAnnouncement(null);
  };

  return (
    <div style={styles.outerWrapper}>
      {/* Top Card Header (copied exactly from Bliss) */}
      <div style={styles.topCard}>
        <img src={SMPTiersImage} alt="smptiers" style={styles.smptiersImage} />
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: "#ffffff",
              fontWeight: 600,
              fontSize: 18,
              cursor: "pointer",
              userSelect: "none",
            }}
            onClick={() => navigate("/posts")}
          >
            <img
              src={HomeIcon}
              alt="Home"
              style={{
                width: 30,
                height: 30,
                marginRight: 8,
                filter: "invert(100%)",
              }}
              draggable={false}
            />
            Home
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: "#ffffff",
              fontWeight: 600,
              fontSize: 18,
              cursor: "pointer",
              userSelect: "none",
            }}
            onClick={() => navigate("/rankings/overall")}
          >
            <img
              src={RankingsIcon}
              alt="Rankings"
              style={{
                width: 30,
                height: 30,
                marginRight: 8,
              }}
              draggable={false}
            />
            Rankings
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: "#ffffff",
              fontWeight: 600,
              fontSize: 18,
              cursor: "pointer",
              position: "relative",
              zIndex: 1000,
              userSelect: "none",
            }}
            onClick={() => setDiscordPopupOpen(!discordPopupOpen)}
          >
            <img
              src={DiscordIcon}
              alt="Discord"
              style={styles.discordIcon}
              draggable={false}
            />
            Discords{" "}
            <img
              src={caretUp}
              alt="caret up"
              style={{
                width: 15,
                height: 15,
                marginLeft: 6,
                verticalAlign: "middle",
                userSelect: "none",
                filter: "invert(100%)",
              }}
              draggable={false}
            />

            {discordPopupOpen && (
              <div
                style={{
                  ...styles.discordPopup,
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  minWidth: 160,
                  backgroundColor: "#1E293B",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                  borderRadius: 8,
                  padding: "12px 16px",
                  marginTop: 4,
                  zIndex: 1001,
                }}
              >
                {[
                  ["lifesteal", lifestealLink],
                  ["infuse", infuseLink],
                  ["glitch", glitchLink],
                  ["bliss", blissLink],
                  ["strength", strengthLink],
                ].map(([mode, link]) => (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 8,
                      cursor: "pointer",
                    }}
                    key={mode}
                  >
                    <img
                      src={getGamemodeIcon(mode)}
                      alt={mode}
                      style={{ width: 24, height: 24, marginRight: 12 }}
                    />
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#fff", textDecoration: "none", fontWeight: 600 }}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Below TopCard: Big announcement card */}
      <div style={styles.announcementCard}>
        {loading && <p style={{ color: "#ccc" }}>Loading announcements...</p>}
        {error && <p style={{ color: "red" }}>Error: {error}</p>}

        {!loading && !error && announcements.length === 0 && (
          <p style={{ color: "#aaa" }}>No announcements found.</p>
        )}

        {!loading && !error && announcements.length > 0 && (
          <div>
            {announcements.map((a) => (
              <div
                key={a.id}
                onClick={() => setPopupAnnouncement(a)}
                onMouseEnter={() => setHoveredId(a.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  marginBottom: 24,
                  paddingBottom: 16,
                  borderBottom: "1px solid #1f2937",
                  cursor: "pointer",
                  transition: "transform 0.2s ease",
                  transform: hoveredId === a.id ? "translate(5px, -3px)" : "none",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 10px 0",
                    color: "#f0f0f0",
                    fontSize: 24,
                    userSelect: "none",
                  }}
                >
                  {a.title}
                </h3>
                {a.subtitle && (
                  <h4
                    style={{
                      margin: "0 0 14px 0",
                      color: "#ccc",
                      fontWeight: "normal",
                      fontSize: 18,
                      userSelect: "none",
                    }}
                  >
                    {a.subtitle}
                  </h4>
                )}
                {/* Always show truncated body */}
                <p
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    marginBottom: 20,
                    userSelect: "text",
                  }}
                  title={a.body}
                >
                  {a.body}
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
                  <img
                    src={a.author_avatar}
                    alt={a.author_name}
                    style={{ width: 32, height: 32, borderRadius: "50%" }}
                  />
                  <div style={{ fontSize: 14, color: "#888" }}>
                    <div>{a.author_name}</div>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      {new Date(a.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Popup Overlay for full announcement */}
      {popupAnnouncement && (
        <div style={styles.popupOverlay} onClick={closePopup}>
          <div
            style={styles.popupContent}
            onClick={(e) => e.stopPropagation()} // prevent close when clicking inside content
          >
            <button style={styles.closeButton} onClick={closePopup} aria-label="Close">
              ×
            </button>
            <h2 style={{ marginTop: 0, color: "#f0f0f0" }}>{popupAnnouncement.title}</h2>
            {popupAnnouncement.subtitle && (
              <h3 style={{ color: "#ccc", fontWeight: "normal" }}>
                {popupAnnouncement.subtitle}
              </h3>
            )}
            <div style={styles.popupBody}>
              <pre style={{ whiteSpace: "pre-wrap", color: "#ddd", fontFamily: "inherit" }}>
                {popupAnnouncement.body}
              </pre>
            </div>
            <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 12 }}>
              <img
                src={popupAnnouncement.author_avatar}
                alt={popupAnnouncement.author_name}
                style={{ width: 40, height: 40, borderRadius: "50%" }}
              />
              <div style={{ fontSize: 14, color: "#888" }}>
                <div>{popupAnnouncement.author_name}</div>
                <div style={{ fontSize: 12, color: "#666" }}>
                  {new Date(popupAnnouncement.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Optional: You can add PageHeader with Tabs/SearchBar if you want here */}
      {/* <PageHeader>
        <GamemodeTabs />
        <SearchBar />
      </PageHeader> */}
    </div>
  );
}

// Styles (add more or adjust as you want)
const styles = {
  outerWrapper: {
    backgroundColor: "#121821",
    paddingBottom: "6rem",
    paddingTop: "2rem",
  },
  topCard: {
  backgroundColor: "#121821",
  border: "2px solid #1f2937",
  borderRadius: 24,
  paddingLeft: "2rem",
  paddingRight: "2rem",
  maxWidth: 1200,
  minWidth: 1200,
  display: "flex",
  minHeight: 60,
  justifyContent: "center",
  alignItems: "center",
  margin: "0 auto 2rem auto",
  textAlign: "center",
  position: "relative",
},
  smptiersImage: {
    width: 200,
    height: 100,
    userSelect: "none",
    position: "absolute",
    left: 0,
  },
  discordIcon: {
    width: 30,
    height: 30,
    marginRight: 8,
    userSelect: "none",
  },
  discordPopup: {
    position: "absolute",
    top: "110%",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "#121821",
    border: "2px solid #1f2937",
    borderRadius: 24,
    padding: "1rem 2rem",
    whiteSpace: "nowrap",
    zIndex: 1000,
    userSelect: "none",
  },
  announcementCard: {
    backgroundColor: "#121821",
    border: "2px solid #1f2937",
    borderRadius: 24,
    padding: 24,
    maxWidth: 1200,
    minWidth: 1200,
    margin: "0 auto",
    color: "#fff",
  },
  popupOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(18, 24, 33, 0.95)",
    zIndex: 1500,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    overflowY: "auto",
  },
  popupContent: {
    backgroundColor: "#121821",
    border: "2px solid #1f2937",
    borderRadius: 24,
    maxWidth: 800,
    width: "100%",
    maxHeight: "90vh",
    padding: 24,
    position: "relative",
    boxSizing: "border-box",
    overflowY: "auto",
  },
  popupBody: {
    maxHeight: "60vh",
    overflowY: "auto",
    marginTop: 12,
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    background: "none",
    border: "none",
    fontSize: 28,
    color: "#ccc",
    cursor: "pointer",
    userSelect: "none",
    padding: 0,
    lineHeight: 1,
  },
};
