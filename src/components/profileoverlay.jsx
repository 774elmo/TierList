import React, { useState } from "react";
import overallIcon from "../assets/overall.svg";
import { getGamemodeIcon } from "./gamemodeicons";

import rookieIcon from "../assets/rookie.svg";
import combatNoviceIcon from "../assets/combat_novice.svg";
import combatCadetIcon from "../assets/combat_cadet.svg";
import combatSpecialistIcon from "../assets/combat_specialist.svg";
import combatAceIcon from "../assets/combat_ace.webp";
import combatMasterIcon from "../assets/combat_master.webp";
import combatGodIcon from "../assets/combat_god.webp";
import shimmer1 from "../assets/1-shimmer.svg";
import shimmer2 from "../assets/2-shimmer.svg";
import shimmer3 from "../assets/3-shimmer.svg";
import shimmerOther from "../assets/other.svg";

// Title data with icon and description
const titleInfo = [
  {
    title: "Rookie",
    icon: rookieIcon,
    description: "Starting rank for players with less than 10 points.",
    minPoints: 0,
    maxPoints: 9,
    backgroundColor: "#2C323E",
    color: "#D1D5DB",
  },
  {
    title: "Combat Novice",
    icon: combatNoviceIcon,
    description: "Obtained 10+ total points.",
    minPoints: 10,
    maxPoints: 19,
    backgroundColor: "#2F374D",
    color: "#C4B5F7",
  },
  {
    title: "Combat Cadet",
    icon: combatCadetIcon,
    description: "Obtained 20+ total points.",
    minPoints: 20,
    maxPoints: 49,
    backgroundColor: "#282F4D",
    color: "#ABA8FD",
  },
  {
    title: "Combat Specialist",
    icon: combatSpecialistIcon,
    description: "Obtained 50+ total points.",
    minPoints: 50,
    maxPoints: 99,
    backgroundColor: "#463863",
    color: "#D8A8D7",
  },
  {
    title: "Combat Ace",
    icon: combatAceIcon,
    description: "Obtained 100+ total points.",
    minPoints: 100,
    maxPoints: 249,
    backgroundColor: "#562333",
    color: "#FDA4AB",
  },
  {
    title: "Combat Master",
    icon: combatMasterIcon,
    description: "Obtained 250+ total points.",
    minPoints: 250,
    maxPoints: 399,
    backgroundColor: "#414029",
    color: "#FDC732",
  },
  {
    title: "Combat God",
    icon: combatGodIcon,
    description: "Obtained 400+ total points.",
    minPoints: 400,
    maxPoints: Infinity,
    backgroundColor: "#414029",
    color: "#FDC732",
  },
];

// Get title info by points
function getTitleInfo(points) {
  for (const info of titleInfo) {
    if (points >= info.minPoints && points <= info.maxPoints) {
      return info;
    }
  }
  return titleInfo[0]; // default to Rookie
}

const validGamemodes = ["lifesteal", "infuse", "glitch", "strength", "bliss"];

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
    1: shimmer1,
    2: shimmer2,
    3: shimmer3,
    other: shimmerOther,
  };
  return shimmerUrls[position] || shimmerUrls.other;
}

export default function ProfileOverlay({ player, onClose }) {
  const [hoveredTierIndex, setHoveredTierIndex] = useState(null);
  const [hoverTitle, setHoverTitle] = useState(false);

  if (!player) return null;

  const userTitle = getTitleInfo(player.total_points || 0);

  return (
    <div style={styles.profileOverlay}>
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
    ...styles.titleWrapper,
    backgroundColor: userTitle.backgroundColor,
    color: userTitle.color,
    padding: "6px 12px",
    borderRadius: 20,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1,
  }}
  onMouseEnter={() => setHoverTitle(true)}
  onMouseLeave={() => setHoverTitle(false)}
>
  <img
    src={userTitle.icon}
    alt={userTitle.title}
    style={{
      width: 24,
      height: 24,
      objectFit: "contain",
      display: "block",
    }}
    draggable={false}
  />
  <span
    style={{
      fontSize: 18,
      fontWeight: 700,
      color: userTitle.color,
      userSelect: "none",
      position: "relative",
      top: "1px", // tweak this to align vertically
    }}
  >
    {userTitle.title}
  </span>

  {hoverTitle && (
    <div style={styles.tierTooltip}>
      <div style={{ fontWeight: "600", fontSize: 24}}>{userTitle.title}</div>
      <div>{userTitle.description}</div>
    </div>
  )}
</div>


            <div
            style={{
                marginTop: 10,
                marginBottom: 16,
                fontSize: 22,
                fontWeight: 600,
                color: "#222A38",
            }}
            >
            {player.region === "AS"
                ? "Asia"
                : player.region === "NA"
                ? "North America"
                : player.region === "EU"
                ? "Europe"
                : "N/A"}
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
            <span style={styles.positionNumberProfile}>{player.position}.</span>
          </div>
          <div style={styles.overallInfo}>
            <img src={overallIcon} alt="overall" style={styles.overallIcon} />
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={styles.overallText}>OVERALL</div>
              <div style={styles.overallPoints}>
                {player.total_points !== undefined && player.total_points !== null
                  ? `${player.total_points.toLocaleString()} points`
                  : "0 points"}
              </div>
            </div>
          </div>
        </div>

        <div style={styles.sectionHeader}>TIERS</div>

        <div style={styles.profileTiersCard}>
          {(() => {
            const rankedBadges = [];
            const unrankedBadges = [];

            validGamemodes.forEach((mode, idx) => {
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

              const badge = (
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
                          borderStyle: "dashed",
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
                    {isRanked ? tierName : "-"}
                  </div>

                  {hoveredTierIndex === idx && (
                    <div style={styles.tierTooltip}>
                      <div style={{ fontWeight: "1000", fontSize: 24 }}>{displayTierName || "N/A"}</div>
                      <div>{points.toLocaleString()} points</div>
                    </div>
                  )}
                </div>
              );

              if (isRanked) {
                rankedBadges.push(badge);
              } else {
                unrankedBadges.push(badge);
              }
            });

            return (
              <>
                {rankedBadges}
                {unrankedBadges}
              </>
            );
          })()}
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
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  profileCard: {
    backgroundColor: "#121821",
    padding: "2rem",
    borderRadius: 16,
    width: "90%",
    maxWidth: 600,
    color: "#e5e7eb",
    textAlign: "center",
    position: "relative",
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
    fontWeight: "700",
    marginBottom: 10,
    color: "#CAD5E2",
  },
  titleWrapper: {
    marginTop: 6,
    marginBottom: 8,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    position: "relative",
    cursor: "default",
  },
  titleIcon: {
    width: 30,
    height: 30,
    userSelect: "none",
    marginTop: 12,
  },
  titleText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#e5e7eb",
    userSelect: "none",
    marginTop: 12,
  },
  region: {
    fontSize: 30,
    padding: "6px 8px",
    borderRadius: 15,
    minWidth: 40,
    textAlign: "center",
    textTransform: "uppercase",
    userSelect: "none",
    fontWeight: "700",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    lineHeight: 1,
    marginLeft: 5,
  },
  sectionHeader: {
    fontWeight: "700",
    fontSize: 30,
    textAlign: "left",
    marginBottom: 4,
    marginLeft: 4,
    color: "#9ca3af",
    userSelect: "none",
  },
  profilePositionCard: {
    marginBottom: "2rem",
    backgroundColor: "#18202C",
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    border: "2px solid #1f2937",
    gap: 0,
  },
  ribbonProfile: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    width: 150,
    height: 70,
    borderRadius: 12,
    overflow: "hidden",
    userSelect: "none",
    backgroundColor: "transparent",
    
  },
  shimmerImageProfile: {
    position: "absolute",
    width: 150,
    height: 70,
    objectFit: "cover",
    pointerEvents: "none",
    borderRadius: 12,
    userSelect: "none",
    zIndex: 0,
    boxSizing: "border-box",
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
    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)",
    userSelect: "none",
  },
  overallInfo: {
    display: "flex",
    alignItems: "center",
    gap: 20,
    color: "#e5e7eb",
  },
  overallIcon: {
    width: 45,
    height: 45,
    borderRadius: 12,
    marginLeft: 10, 
  },
  overallText: {
    fontSize: 25,
    fontWeight: 700,
    textAlign: "left",
  },
  overallPoints: {
    fontSize: 15,
    fontWeight: 600,
    color: "#9ca3af",
    textAlign: "left",
  },
  profileTiersCard: {
    backgroundColor: "#18202C",
    borderRadius: 12,
    border: "2px solid #1f2937",
    padding: "1rem 2rem",
    display: "flex",
    justifyContent: "flex-start",
    gap: 15,
    flexWrap: "wrap",
  },
  tierBadge: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 5,
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
    padding: "0px 1px",
    fontWeight: 800,
    fontSize: 15,
    minWidth: 40,
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
    fontSize: 20,
    zIndex: 1001,
    userSelect: "none",
  },
};


