import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getTabIcon } from "./tabicons";
import overallIcon from "../assets/overall.webp";

const gamemodes = ["lifesteal", "trident_mace"];

export default function GamemodeTabs() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const activeTab = currentPath.split("/")[2] || "overall";

  const [hoveredTab, setHoveredTab] = useState(null);

  return (
    <div style={styles.tabContainer}>
      {/* Overall Tab */}
      <button
        onClick={() => navigate("/rankings/overall")}
        onMouseEnter={() => setHoveredTab("overall")}
        onMouseLeave={() => setHoveredTab(null)}
        style={{
          ...styles.tab,
          ...(activeTab === "overall" ? styles.activeTab : {}),
          ...(hoveredTab === "overall" && activeTab !== "overall"
            ? styles.hoverTab
            : {}),
        }}
      >
        <img src={overallIcon} alt="overall" style={styles.icon} draggable={false} />
        <span style={styles.tabText}>Overall</span>
      </button>

      {/* Gamemode Tabs */}
      {gamemodes.map((mode) => {
        const icon = getTabIcon(mode);
        const isActive = activeTab === mode;
        const isHovered = hoveredTab === mode;

        return (
          <button
            key={mode}
            onClick={() => navigate(`/rankings/${mode}`)}
            onMouseEnter={() => setHoveredTab(mode)}
            onMouseLeave={() => setHoveredTab(null)}
            style={{
              ...styles.tab,
              ...(isActive ? styles.activeTab : {}),
              ...(isHovered && !isActive ? styles.hoverTab : {}),
            }}
          >
            <img
              src={icon}
              alt={mode}
              style={styles.icon}
              draggable={false}
            />
            <span style={styles.tabText}>{mode.replace("_", " ")}</span>
          </button>
        );
      })}
    </div>
  );
}

const styles = {
  tabContainer: {
    display: "flex",
    justifyContent: "flex-start",
    gap: "0.3rem",
    marginBottom: "0",
    paddingLeft: "2rem",
    paddingRight: "2rem",
    position: "relative",
    zIndex: 2,
  },
  tab: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    background: "#121821",
    color: "#e5e7eb",
    padding: "10px 16px",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    border: "2px solid #1f2937",
    borderBottom: "none",
    cursor: "pointer",
    fontSize: 18,
    fontWeight: 600,
    transition: "background 0.2s ease",
  },
  activeTab: {
    border: "2px solid #1f2937",
    background: "#1f2937",
    borderBottom: "2px solid #ffffff",
    borderRadius: "12px 12px 0 0",
  },
  hoverTab: {
    background: "#1f2937",
  },
  icon: {
    width: 24,
    height: 24,
    objectFit: "contain",
  },
  tabText: {
    textTransform: "capitalize",
  },
};
