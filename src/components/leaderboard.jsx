import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getGamemodeIcon } from "../components/gamemodeicons";
import GamemodeTabs from "../components/gamemodetabs";
import ProfileOverlay from "../components/profileoverlay";
import PageHeader from "../components/pageheader";
import SearchBar from "./searchbar";

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

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
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
        <div style={styles.headerRow}>
          <div style={styles.ribbonHeaderCol}>
            <span style={styles.hashHeader}>#</span>
          </div>
          <div style={styles.usernameCol}>Player</div>
          <div style={styles.regionCol}>Region</div>
          <div style={styles.tierCol}>Tiers</div>
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
              style={{
                ...styles.row,
                backgroundColor: isHovered ? "#1f2937" : "#161E29",
                transform: isHovered ? "translateX(-4px)" : "translateX(0)",
                transition: "all 0.2s ease",
                cursor: "pointer",
              }}
            >
              <div style={styles.ribbon}>
                <img src={shimmerUrl} alt="shimmer" style={styles.shimmerImage} draggable={false} />
                <span style={styles.positionNumber}>{player.position}</span>
                <img
                  src={`https://render.crafty.gg/3d/bust/${player.uuid}`}
                  alt={player.username}
                  style={styles.skinImageInRibbon}
                  draggable={false}
                />
              </div>
              <div style={styles.usernameColRow} title={player.username}>
                {player.username}
              </div>
              <div style={styles.regionCol}>
                <div
                  style={{
                    ...styles.region,
                    backgroundColor: regionColor(player.region),
                    color: regionTextColor(player.region),
                  }}
                >
                  {player.region || "N/A"}
                </div>
              </div>
              <div style={styles.tierColRow}>
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
                      style={styles.tierBadge}
                      onMouseEnter={() => setHoveredTierIndex({ row: index, col: idx })}
                      onMouseLeave={() => setHoveredTierIndex({ row: null, col: null })}
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

                      {showTooltip && (
                        <div style={styles.tierTooltip}>
                          <div style={{ fontWeight: "1000", fontSize: 18 }}>{displayTierName || "N/A"}</div>
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
      <div style={styles.loadingWrapper}>
        <p style={styles.loadingText}>Loading Tiers</p>
        <img src="/assets/loading.gif" alt="loading" style={styles.loadingGif} />
      </div>
    );
  }

  if (error)
    return (
      <p style={{ ...styles.message, color: "#ef4444" }}>
        {error}
      </p>
    );

  return (
    <div style={styles.outerWrapper}>
      <PageHeader>
        <GamemodeTabs activeTab={gamemode} />
        <SearchBar />
      </PageHeader>

      <div style={styles.container}>{renderOverall()}</div>

      {selectedPlayer && (
        <ProfileOverlay player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}
    </div>
  );
}

const styles = {
  outerWrapper: {
    backgroundColor: "#121821",
    paddingTop: "4rem",
  },
  container: {
    maxWidth: 1200,
    minWidth: 1200,          // FIXED minWidth to force container width on mobile
    margin: "0 auto 3rem auto",
    padding: "3rem 2rem 2rem",
    backgroundColor: "#121821",
    borderRadius: 24,
    border: "2px solid #1f2937",
    color: "#e5e7eb",
    fontSize: 20,
    position: "relative",
    zIndex: 1,
    overflowX: "auto",       // allow horizontal scroll on small widths
    WebkitOverflowScrolling: "touch",
  },
  headerRow: {
    display: "flex",
    padding: "0 0.5rem",
    color: "#9ca3af",
    fontWeight: "700",
    fontSize: 14,
    textTransform: "uppercase",
    alignItems: "center",
    gap: 12,
    height: "auto",
    flexWrap: "wrap",       // allow wrapping header on small widths
  },
  ribbonHeaderCol: {
    flex: "1 1 20%",       // flexible width, min 20%
    minWidth: 60,
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  hashHeader: {
    fontSize: 14,
    fontWeight: 700,
    fontStyle: "italic",
    color: "#9ca3af",
    paddingLeft: 8,
  },
  usernameCol: {
    flex: "2 1 40%",       // bigger column, flexible
    fontWeight: 700,
    fontSize: 16,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  regionCol: {
    flex: "1 1 25%",
    fontWeight: 700,
    fontSize: 14,
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    minWidth: 50,
  },
  tierCol: {
    flex: "1 1 100%",
    fontWeight: 700,
    fontSize: 14,
    textAlign: "center",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  row: {
    display: "flex",
    alignItems: "center",
    padding: "0.5rem 0.5rem",
    borderRadius: 12,
    border: "2px solid #1f2937",
    marginBottom: 10,
    gap: 12,
    minHeight: 50,
    cursor: "pointer",
    flexWrap: "wrap",        // allow wrapping on small widths
  },
  ribbon: {
    position: "relative",
    width: 80,
    height: 50,
    borderRadius: 8,
    overflow: "visible",
    flexShrink: 0,
    userSelect: "none",
    backgroundColor: "transparent",
  },
  shimmerImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 80,
    height: 50,
    borderRadius: 8,
    objectFit: "cover",
    pointerEvents: "none",
    userSelect: "none",
    zIndex: 0,
  },
  positionNumber: {
    position: "absolute",
    top: "50%",
    left: 10,
    transform: "translateY(-50%)",
    fontSize: 24,
    fontWeight: 700,
    fontStyle: "italic",
    color: "#ffffff",
    zIndex: 2,
    textShadow: "0 0 4px #000, 1px 1px 2px #000",
    userSelect: "none",
  },
  skinImageInRibbon: {
    position: "absolute",
    top: "50%",
    right: 10,
    transform: "translateY(-50%)",
    width: 40,
    height: 40,
    borderRadius: 8,
    zIndex: 2,
    userSelect: "none",
  },
  usernameColRow: {
    flex: "2 1 40%",
    fontWeight: 700,
    fontSize: 18,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    minWidth: 100,
  },
  region: {
    fontSize: 14,
    padding: "4px 6px",
    borderRadius: 12,
    minWidth: 30,
    textAlign: "center",
    textTransform: "uppercase",
    userSelect: "none",
    fontWeight: "800",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    lineHeight: 1,
    marginLeft: 5,
  },
  tierColRow: {
    flex: "1 1 100%",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    minWidth: 100,
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
    width: 24,
    height: 24,
  },
  iconOutline: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 24,
    height: 24,
    borderRadius: "50%",
    border: "2px solid",
    boxSizing: "border-box",
    backgroundColor: "transparent",
  },
  tierIcon: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 16,
    height: 16,
    borderRadius: 4,
    objectFit: "contain",
    transform: "translate(-50%, -50%)",
  },
  tierName: {
    borderRadius: 12,
    padding: "0 6px",
    fontWeight: 700,
    fontSize: 12,
    minWidth: 30,
    textAlign: "center",
    marginTop: -4,
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
    fontSize: 12,
    zIndex: 1001,
    userSelect: "none",
  },
};

