import React, { useState, useEffect } from "react";
import overallIcon from "../assets/overall.svg";
import { getGamemodeIcon } from "./GamemodeIcons";

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
import namemcIcon from "../assets/namemc.png";
import leaveIcon from "../assets/leave.png";
import skin404 from "../assets/skin-404.avif";


import "../css/ProfileOverlay.css";

const titleInfo = [
  { title: "Rookie", icon: rookieIcon, description: "Starting rank for players with less than 10 points.", minPoints: 0, maxPoints: 9, backgroundColor: "#2C323E", color: "#D1D5DB" },
  { title: "Combat Novice", icon: combatNoviceIcon, description: "Obtained 10+ total points.", minPoints: 10, maxPoints: 19, backgroundColor: "#2F374D", color: "#C4B5F7" },
  { title: "Combat Cadet", icon: combatCadetIcon, description: "Obtained 20+ total points.", minPoints: 20, maxPoints: 49, backgroundColor: "#282F4D", color: "#ABA8FD" },
  { title: "Combat Specialist", icon: combatSpecialistIcon, description: "Obtained 50+ total points.", minPoints: 50, maxPoints: 99, backgroundColor: "#463863", color: "#D8A8D7" },
  { title: "Combat Ace", icon: combatAceIcon, description: "Obtained 100+ total points.", minPoints: 100, maxPoints: 249, backgroundColor: "#562333", color: "#FDA4AB" },
  { title: "Combat Master", icon: combatMasterIcon, description: "Obtained 250+ total points.", minPoints: 250, maxPoints: 399, backgroundColor: "#414029", color: "#FDC732" },
  { title: "Combat God", icon: combatGodIcon, description: "Obtained 400+ total points.", minPoints: 400, maxPoints: Infinity, backgroundColor: "#414029", color: "#FDC732" },
];

function getTitleInfo(points) {
  return titleInfo.find(info => points >= info.minPoints && points <= info.maxPoints) || titleInfo[0];
}

const validGamemodes = ["trident_mace"];

function getTierColors(tierName) {
  const tierMap = { 
    LT3: { backgroundColor: "#593722", color: "#C67B42" }, HT3: { backgroundColor: "#6B4B36", color: "#F79E59" },
    LT2: { backgroundColor: "#4A505A", color: "#A0A7B2" }, HT2: { backgroundColor: "#5E6979", color: "#C4D3E7" },
    LT1: { backgroundColor: "#584C25", color: "#D5B355" }, HT1: { backgroundColor: "#6D5D2C", color: "#E8BA3A" } 
  };
  if (!tierName || ["LT4","HT4","LT5","HT5"].includes(tierName)) return { backgroundColor: "#303144", color: "#81749A" };
  return tierMap[tierName] || { backgroundColor: "#303144", color: "#81749A" };
}

function getShimmerUrl(position) {
  const shimmerUrls = { 1: shimmer1, 2: shimmer2, 3: shimmer3, other: shimmerOther };
  return shimmerUrls[position] || shimmerUrls.other;
}

export default function ProfileOverlay({ playerUuid, onClose }) {
  const [playerData, setPlayerData] = useState(null);
  const [hoveredBadge, setHoveredBadge] = useState(null);
  const [hoverTitle, setHoverTitle] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlayer() {
      try {
        setLoading(true);
        const res = await fetch("https://api.tridentmace.xyz/api/v1/data");
        const allPlayers = await res.json();
        setPlayerData(allPlayers.find(p => p.uuid === playerUuid));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (playerUuid) fetchPlayer();
  }, [playerUuid]);

  if (!playerUuid || loading) return <div className="profileOverlay">Loading...</div>;
  if (!playerData) return <div className="profileOverlay">Player not found</div>;

  const userTitle = getTitleInfo(playerData.total_points || 0);

  return (
    <div className="profileOverlay">
      <div className="profileCard">
        <button className="closeButton" onClick={onClose}>×</button>

        {/* Skin */}
        <div className="skinOutline">
          <img
            src={`https://render.crafty.gg/3d/bust/${playerData.uuid}`}
            alt={playerData.username}
            className="profileSkin"
            onError={(e) => {
              e.currentTarget.onerror = null; // Prevent infinite loop
              e.currentTarget.src = skin404;  // Fallback image
            }}
          />
        </div>

        {/* Username */}
        <div className="profileUsername">{playerData.username}</div>

        {/* Title */}
        <div className="titleWrapper" style={{ backgroundColor: userTitle.backgroundColor, color: userTitle.color }}
             onMouseEnter={() => setHoverTitle(true)} onMouseLeave={() => setHoverTitle(false)}>
          <img src={userTitle.icon} alt={userTitle.title} className="titleIcon" draggable={false} />
          <span className="titleText">{userTitle.title}</span>
          {hoverTitle && (
            <div className="tierTooltip">
              <div className="tooltipTitle">{userTitle.title}</div>
              <div className="tooltipPoints">{userTitle.description}</div>
            </div>
          )}
        </div>

        {/* Region */}
        <div className="profileRegion">
          {playerData.region === "AS" ? "Asia" : playerData.region === "NA" ? "North America" : playerData.region === "EU" ? "Europe" : "N/A"}
        </div>

        {/* NameMC Button */}
        <a 
          href={`https://namemc.com/profile/${playerData.uuid}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="nameMCButton"
        >
          <img src={namemcIcon} alt="NameMC" className="nameMCIcon" />
          <span className="nameMCText">NameMC</span>
          <img src={leaveIcon} alt="Leave" className="leaveIcon" />
        </a>

        {/* Position */}
        <div className="profileCardSection">
          <div className="sectionHeader">Position</div>
          <div className="profilePositionCard">
            <div className="ribbonProfile">
              <img src={getShimmerUrl(playerData.position)} alt="shimmer" className="shimmerImageProfile" draggable={false} />
              <span className="positionNumberProfile">{playerData.position}.</span>
            </div>
            <div className="overallInfo">
              <img src={overallIcon} alt="overall" className="overallIcon" />
              <div className="overallTextWrapper">
                <div className="overallText">Overall</div>
                <div className="overallPoints">{playerData.total_points?.toLocaleString() ?? "0"} points</div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Tiers */}
        <div className="profileCardSection">
          <div className="sectionHeader">Tiers</div>
          <div className="profileTiersCard">
            {(() => {
              const ranked = validGamemodes
                .map(mode => ({ mode, kit: (playerData.kits || []).find(k => [k.kit_name, k.gamemode, k.name, k.type].includes(mode) && !k.retired) }))
                .filter(k => k.kit);
              const unranked = validGamemodes
                .filter(mode => !ranked.some(r => r.mode === mode))
                .map(mode => ({ mode, kit: null }));

              return [...ranked, ...unranked].map(({ mode, kit }) => {
                const tierNameRaw = kit?.tier_name;
                const peakTierNameRaw = kit?.peak_tier_name;
                const displayTierName = peakTierNameRaw && peakTierNameRaw !== tierNameRaw ? `Peak ${peakTierNameRaw}` : tierNameRaw || "N/A";
                const isRanked = !!tierNameRaw;
                const tierColors = getTierColors(tierNameRaw);
                const points = kit?.points ?? 0;

                return (
                  <div key={mode} className="tierBadge"
                      onMouseEnter={() => setHoveredBadge(mode)}
                      onMouseLeave={() => setHoveredBadge(null)}>
                    <div className="iconCircleWrapper">
                      {isRanked ? (
                        <>
                          <img src={getGamemodeIcon(mode)} alt="tier icon" className="tierIcon" />
                          <div className="iconOutline" style={{ borderColor: tierColors.backgroundColor }} />
                        </>
                      ) : (
                        <div className="iconOutline unranked" />
                      )}
                    </div>
                    <div className="tierName" style={{ backgroundColor: isRanked ? tierColors.backgroundColor : "#212B39", color: isRanked ? tierColors.color : "#354153" }}>
                      {isRanked ? tierNameRaw : "-"}
                    </div>
                    {hoveredBadge === mode && (
                      <div className="tierTooltip">
                        {isRanked ? (
                          <>
                            <div className="tooltipTitle">{displayTierName}</div>
                            <div className="tooltipPoints">{points.toLocaleString()} points</div>
                          </>
                        ) : (
                          <>
                            <div className="tooltipTitle">N/A</div>
                            <div className="tooltipPoints">0 points</div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Retired Tiers */}
        <div className="profileCardSection">
          <div className="sectionHeader">Retired</div>
          <div className="profileRetiredCard">
            {(() => {
              const retired = validGamemodes
                .map(mode => ({ mode, kit: (playerData.kits || []).find(k => [k.kit_name, k.gamemode, k.name, k.type].includes(mode) && k.retired) }))
                .filter(k => k.kit);
              const unretired = validGamemodes
                .filter(mode => !retired.some(r => r.mode === mode))
                .map(mode => ({ mode, kit: null }));

              return [...retired, ...unretired].map(({ mode, kit }) => {
                const tierNameRaw = kit?.tier_name;
                const tierColors = getTierColors(tierNameRaw);
                const displayTierName = tierNameRaw || "N/A";
                const isRetired = !!kit?.retired;
                const points = kit?.points ?? 0;

                return (
                  <div key={mode+"_retired"} className="tierBadge retired"
                      onMouseEnter={() => setHoveredBadge(mode+"_retired")}
                      onMouseLeave={() => setHoveredBadge(null)}>
                    <div className="iconCircleWrapper">
                      {isRetired ? (
                        <>
                          <img src={getGamemodeIcon(mode)} alt="tier icon" className="tierIcon" />
                          <div className="iconOutline" style={{ borderColor: tierColors.backgroundColor }} />
                        </>
                      ) : (
                        <div className="iconOutline unranked" />
                      )}
                    </div>
                    <div className="tierName" style={{ backgroundColor: isRetired ? tierColors.backgroundColor : "#212B39", color: isRetired ? tierColors.color : "#354153" }}>
                      {isRetired ? displayTierName : "-"}
                    </div>
                    {hoveredBadge === mode+"_retired" && (
                      <div className="tierTooltip">
                        {isRetired ? (
                          <>
                            <div className="tooltipTitle">{displayTierName}</div>
                            <div className="tooltipPoints">{points.toLocaleString()} points</div>
                          </>
                        ) : (
                          <>
                            <div className="tooltipTitle">N/A</div>
                            <div className="tooltipPoints">0 points</div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
