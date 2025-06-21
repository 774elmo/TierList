import React, { useState } from "react";
import overallIcon from "../assets/overall.webp";
import { getGamemodeIcon } from "./gamemodeicons";

const validGamemodes = ["lifesteal", "trident_mace"];

function regionColor(region) {
  switch (region) {
    case "AS":
      return "#422C3F";
    case "EU":
      return "#1C3E20";
    case "NA":
      return "#442228";
    default:
      return "#6b7280";
  }
}

function regionTextColor(region) {
  switch (region) {
    case "AS":
      return "#AF7F91";
    case "EU":
      return "#89F19C";
    case "NA":
      return "#D95C6A";
    default:
      return "#ffffff";
  }
}

function getTierColors(tierName) {
  if (!tierName) return { backgroundColor: "#303144", color: "#81749A" };
  const tierMap = {
    LT3: { backgroundColor: "#593722", color: "#C67B42" },
    HT3: { backgroundColor: "#6B4B36", color: "#F79E59" },
    LT2: { backgroundColor: "#4A505A", color: "#A0A7B2" },
    HT2: { backgroundColor: "#5E6979", color: "#C4D3E7" },
    LT1: { backgroundColor: "#584C25", color: "#D5B355" },
    HT1: { backgroundColor: "#6D5D2C", color: "#E8BA3A" },
  };
  if (["LT4", "HT4", "LT5", "HT5"].includes(tierName)) {
    return { backgroundColor: "#303144", color: "#81749A" };
  }
  return tierMap[tierName] || { backgroundColor: "#303144", color: "#81749A" };
}

function getShimmerUrl(position) {
  const shimmerUrls = {
    1: "https://mctiers.com/placements/1-shimmer.svg",
    2: "https://mctiers.com/placements/2-shimmer.svg",
    3: "https://mctiers.com/placements/3-shimmer.svg",
    other: "https://mctiers.com/placements/other.svg",
  };
  return shimmerUrls[position] || shimmerUrls.other;
}

export default function ProfileOverlay({ player, onClose }) {
  const [hoveredTierIndex, setHoveredTierIndex] = useState(null);

  if (!player) return null;

  return (
    <div style={styles.profileOverlay}>
      <div
        style={{
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div style={styles.profileCard}>
          <button onClick={onClose} style={styles.closeButton}>
            ×
          </button>

          <div style={styles.skinOutline}>
            <img
              src={`https://render.crafty.gg/3d/bust/${player.uuid}`}
              alt={player.username}
              style={styles.profileSkin}
            />
          </div>

          <div style={styles.profileUsername}>{player.username}</div>

          <div
            style={{
              ...styles.region,
              margin: "1rem auto",
              width: "fit-content",
              fontSize: 20,
              fontWeight: 700,
              backgroundColor: regionColor(player.region),
              color: regionTextColor(player.region),
            }}
          >
            {player.region || "N/A"}
          </div>

          <div style={styles.sectionHeader}>POSITION</div>

          <div style={styles.profilePositionCard}>
            <div style={styles.ribbonProfile}>
              <img
                src={getShimmerUrl(player.position)}
                alt="shimmer"
                style={styles.shimmerImageProfile}
                draggable={false}
              />
              <span style={styles.positionNumberProfile}>{player.position}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={styles.overallText}>OVERALL</div>
              <div style={styles.overallPoints}>
                {`(${
                  player.total_points !== undefined && player.total_points !== null
                    ? player.total_points.toLocaleString()
                    : "0"
                } pts)`}
              </div>
            </div>
            <img src={overallIcon} alt="overall" style={styles.overallIcon} />
          </div>

          <div style={styles.sectionHeader}>TIERS</div>

          <div style={styles.profileTiersCard}>
            {validGamemodes.map((mode, idx) => {
              const kit = (player.kits || []).find(
                (k) =>
                  k.kit_name === mode ||
                  k.gamemode === mode ||
                  k.name === mode ||
                  k.type === mode
              );
              const tierNameRaw = kit?.tier_name;
              const peakTierNameRaw = kit?.peak_tier_name;
              const displayTierName =
                peakTierNameRaw && peakTierNameRaw !== tierNameRaw
                  ? `Peak ${peakTierNameRaw}`
                  : tierNameRaw || "N/A";
              const isRetired = kit?.retired === true;
              const tierName = isRetired && tierNameRaw ? `R${tierNameRaw}` : tierNameRaw;
              const isRanked = !!tierNameRaw;
              const tierColors = getTierColors(tierNameRaw);
              const points = kit?.points ?? 0;

              return (
                <div
                  key={idx}
                  style={styles.tierBadge}
                  onMouseEnter={() => setHoveredTierIndex(idx)}
                  onMouseLeave={() => setHoveredTierIndex(null)}
                >
                  <div style={styles.iconCircleWrapper}>
                    {isRanked ? (
                      <>
                        <img
                          src={getGamemodeIcon(mode)}
                          alt="tier icon"
                          style={styles.tierIcon}
                        />
                        <div
                          style={{
                            ...styles.iconOutline,
                            borderColor: tierColors.backgroundColor,
                            borderStyle: "solid",
                          }}
                        />
                      </>
                    ) : (
                      <div
                        style={{
                          ...styles.iconOutline,
                          borderColor: "#354153",
                          borderStyle: "dotted",
                        }}
                      />
                    )}
                  </div>
                  <div
                    style={{
                      ...styles.tierName,
                      backgroundColor: isRanked ? tierColors.backgroundColor : "#212B39",
                      color: isRanked ? tierColors.color : "#354153",
                    }}
                    title={tierName || "Unranked"}
                  >
                    {isRanked ? tierName : "—"}
                  </div>

                  {hoveredTierIndex === idx && (
                    <div style={styles.tierTooltip}>
                      <div style={{ fontWeight: "1000", fontSize: 24 }}>
                        {displayTierName || "N/A"}
                      </div>
                      <div>{points.toLocaleString()} points</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  profileOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "1rem",
    boxSizing: "border-box",
    overflowY: "auto",
  },
  profileCard: {
    backgroundColor: "#121821",
    padding: "2rem",
    borderRadius: 16,
    width: "100%",
    maxWidth: 600,
    minWidth: 600, // fix width to prevent squashing on narrow screens
    color: "#e5e7eb",
    border: "2px solid #1f2937",
    textAlign: "center",
    position: "relative",
    boxSizing: "border-box",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    background: "none",
    border: "none",
    color: "#ffffff",
    fontSize: 28,
    cursor: "pointer",
    fontWeight: "bold",
    lineHeight: 1,
  },
  skinOutline: {
    display: "inline-block",
    backgroundColor: "#1E2836",
    borderRadius: "50%",
    border: "3px solid #1f2937",
    width: 108,
    height: 108,
    boxSizing: "border-box",
    overflow: "hidden",
    margin: "0 auto",
  },
  profileSkin: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "50%",
    display: "block",
    margin: 0,
  },
  profileUsername: {
    fontSize: 30,
    fontWeight: "800",
    marginTop: 8,
    color: "#ffffff",
    wordBreak: "break-word",
  },
  region: {
    fontSize: 20,
    padding: "6px 8px",
    borderRadius: 12,
    minWidth: 35,
    textAlign: "center",
    textTransform: "uppercase",
    userSelect: "none",
    fontWeight: "800",
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    lineHeight: 1,
    marginLeft: 5,
  },
  sectionHeader: {
    fontWeight: "700",
    fontSize: 28,
    textAlign: "left",
    marginBottom: 8,
    marginLeft: 4,
    color: "#9ca3af",
    userSelect: "none",
  },
  profilePositionCard: {
    marginBottom: "2rem",
    backgroundColor: "#18202C",
    borderRadius: 12,
    border: "2px solid #1f2937",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
    padding: "10px 16px",
    flexWrap: "wrap",
  },
  ribbonProfile: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    width: 150,
    height: 70,
    borderRadius: 8,
    overflow: "hidden",
    userSelect: "none",
    backgroundColor: "transparent",
  },
  shimmerImageProfile: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 150,
    height: 70,
    borderRadius: 8,
    objectFit: "cover",
    pointerEvents: "none",
    userSelect: "none",
    zIndex: 0,
  },
  positionNumberProfile: {
    position: "absolute",
    left: 14,
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: 42,
    fontWeight: 700,
    fontStyle: "italic",
    color: "#ffffff",
    zIndex: 2,
    textShadow: "0 0 4px #000, 1px 1px 2px #000",
    userSelect: "none",
  },
  overallInfo: {
    display: "flex",
    alignItems: "center",
    gap: 20,
    color: "#e5e7eb",
  },
  overallIcon: {
    width: 35,
    height: 35,
    borderRadius: 12,
  },
  overallText: {
    fontSize: 18,
    fontWeight: 700,
    textAlign: "left",
  },
  overallPoints: {
    fontSize: 14,
    fontWeight: 600,
    color: "#9ca3af",
    textAlign: "left",
  },
  profileTiersCard: {
    backgroundColor: "#18202C",
    borderRadius: 12,
    border: "2px solid #1f2937",
    padding: "1rem 1rem",
    display: "flex",
    justifyContent: "center",
    gap: 24,
    flexWrap: "wrap",
  },
  tierBadge: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },
  iconCircleWrapper: {
    position: "relative",
    width: 32,
    height: 32,
  },
  iconOutline: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 32,
    height: 32,
    borderRadius: "50%",
    border: "2px solid",
    boxSizing: "border-box",
    backgroundColor: "transparent",
  },
  tierIcon: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 20,
    height: 20,
    borderRadius: 4,
    objectFit: "contain",
    transform: "translate(-50%, -50%)",
  },
  tierName: {
    borderRadius: 15,
    padding: "0 6px",
    fontWeight: 700,
    fontSize: 18,
    minWidth: 42,
    textAlign: "center",
    marginTop: -5,
    userSelect: "none",
  },
  tierTooltip: {
    position: "absolute",
    bottom: "110%",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "#212B39",
    color: "#e5e7eb",
    padding: "6px 10px",
    borderRadius: 10,
    whiteSpace: "nowrap",
    pointerEvents: "none",
    fontSize: 16,
    zIndex: 1001,
    userSelect: "none",
  },
};
