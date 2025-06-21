import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getGamemodeIcon } from "../components/gamemodeicons";
import GamemodeTabs from "../components/gamemodetabs";
import ProfileOverlay from "../components/profileoverlay";
import PageHeader from "../components/pageheader";
import SearchBar from "./searchbar";
import "../components/leaderboard.css";

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

const shimmerUrls = {
  1: "https://mctiers.com/placements/1-shimmer.svg",
  2: "https://mctiers.com/placements/2-shimmer.svg",
  3: "https://mctiers.com/placements/3-shimmer.svg",
  other: "https://mctiers.com/placements/other.svg",
};

function getShimmerUrl(position) {
  return shimmerUrls[position] || shimmerUrls.other;
}

const STORAGE_KEY_PREFIX = "leaderboard_cache_";
const CACHE_EXPIRATION = 10 * 60 * 1000;

export default function Leaderboard() {
  const { gamemode: rawGamemode } = useParams();
  const navigate = useNavigate();
  const gamemode = rawGamemode || "overall";

  const [players, setPlayers] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [hoveredTierIndex, setHoveredTierIndex] = useState({ row: null, col: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 640 : false
  );

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    function handleResize() {
      setIsMobile(window.innerWidth <= 640);
    }
    window.addEventListener("resize", handleResize);
    return () => {
      isMounted.current = false;
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  function getCachedData(mode) {
    try {
      const cachedString = localStorage.getItem(STORAGE_KEY_PREFIX + mode);
      if (!cachedString) return null;

      const cachedObj = JSON.parse(cachedString);
      if (!cachedObj.timestamp || !cachedObj.data) return null;

      if (Date.now() - cachedObj.timestamp > CACHE_EXPIRATION) {
        localStorage.removeItem(STORAGE_KEY_PREFIX + mode);
        return null;
      }

      return cachedObj.data;
    } catch {
      return null;
    }
  }

  function setCachedData(mode, data) {
    try {
      const cacheObj = { timestamp: Date.now(), data };
      localStorage.setItem(STORAGE_KEY_PREFIX + mode, JSON.stringify(cacheObj));
    } catch {}
  }

  useEffect(() => {
    setLoading(true);
    setError(null);

    if (gamemode !== "overall" && !validGamemodes.includes(gamemode)) {
      navigate("/rankings/overall", { replace: true });
      return;
    }

    const cachedData = getCachedData(gamemode);
    if (cachedData) {
      setPlayers(cachedData);
      setLoading(false);
      return;
    }

    const baseUrl = "https://api.lifestealpvp.xyz/api/v1/data";
    const url = gamemode === "overall" ? baseUrl : `${baseUrl}?gamemode=${gamemode}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch leaderboard");
        return res.json();
      })
      .then((data) => {
        if (!isMounted.current) return;
        setPlayers(data);
        setCachedData(gamemode, data);
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted.current) return;
        setError("Could not load leaderboard data.");
        setLoading(false);
      });
  }, [gamemode, navigate]);

  function renderOverall() {
    return (
      <>
        <div className="leaderboard-header">
          <div className="ribbon-header-col">
            <span className="hash-header">#</span>
          </div>
          <div className="username-col">Player</div>
          <div className="region-col">Region</div>
          <div className="tier-col">Tiers</div>
        </div>
        {players.map((player, index) => {
          const shimmerUrl = getShimmerUrl(player.position);
          const isHovered = hoveredIndex === index;
          return (
            <div
              key={player.username}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => {
                setHoveredIndex(null);
                setHoveredTierIndex({ row: null, col: null });
              }}
              onClick={() => setSelectedPlayer(player)}
              className="leaderboard-row"
              style={{
                backgroundColor: isHovered ? "#1f2937" : "#161E29",
                transform: isHovered ? "translateX(-4px)" : "translateX(0)",
                cursor: "pointer",
                minWidth: isMobile ? "auto" : 600,
                transition: "all 0.2s ease",
              }}
            >
              <div className="ribbon">
                <img
                  src={shimmerUrl}
                  alt="shimmer"
                  className="shimmer-image"
                  draggable={false}
                />
                <span className="position-number">{player.position}</span>
                <img
                  src={`https://render.crafty.gg/3d/bust/${player.uuid}`}
                  alt={player.username}
                  className="skin-image-in-ribbon"
                  draggable={false}
                />
              </div>
              <div className="username-col-row" title={player.username}>
                {player.username}
              </div>
              <div className="region-col">
                <div
                  className="region"
                  style={{
                    backgroundColor: regionColor(player.region),
                    color: regionTextColor(player.region),
                  }}
                >
                  {player.region || "N/A"}
                </div>
              </div>
              <div className="tier-col-row">
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

                  const showTooltip = hoveredTierIndex.row === index && hoveredTierIndex.col === idx;

                  return (
                    <div
                      key={idx}
                      className="tier-badge"
                      onMouseEnter={() => setHoveredTierIndex({ row: index, col: idx })}
                      onMouseLeave={() => setHoveredTierIndex({ row: null, col: null })}
                    >
                      <div className="icon-circle-wrapper">
                        {isRanked ? (
                          <>
                            <img
                              src={getGamemodeIcon(mode)}
                              alt="tier icon"
                              className="tier-icon"
                            />
                            <div
                              className="icon-outline"
                              style={{ borderColor: tierColors.backgroundColor, borderStyle: "solid" }}
                            />
                          </>
                        ) : (
                          <div
                            className="icon-outline"
                            style={{ borderColor: "#354153", borderStyle: "dotted" }}
                          />
                        )}
                      </div>
                      <div
                        className="tier-name"
                        style={{
                          backgroundColor: isRanked ? tierColors.backgroundColor : "#212B39",
                          color: isRanked ? tierColors.color : "#354153",
                          fontSize: isMobile ? 14 : 18,
                        }}
                        title={tierName || "Unranked"}
                      >
                        {isRanked ? tierName : "—"}
                      </div>

                      {showTooltip && (
                        <div className="tier-tooltip" style={{ fontSize: isMobile ? 14 : 18 }}>
                          <div style={{ fontWeight: "1000" }}>{displayTierName || "N/A"}</div>
                          <div>{points.toLocaleString()} points</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </>
    );
  }

  if (loading) {
    return (
      <div className="loading-wrapper">
        <p className="loading-text">Loading Tiers</p>
        <img src="/assets/loading.gif" alt="loading" className="loading-gif" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="message" style={{ color: "#ef4444" }}>
        {error}
      </p>
    );
  }

  return (
    <div className="outer-wrapper">
      <PageHeader>
        <GamemodeTabs activeTab={gamemode} />
        <SearchBar />
      </PageHeader>

      <div className="scroll-wrapper">
        <div className="container">{renderOverall()}</div>
      </div>

      {selectedPlayer && (
        <ProfileOverlay player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}
    </div>
  );
}
