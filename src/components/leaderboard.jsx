import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getGamemodeIcon } from "../components/gamemodeicons";
import GamemodeTabs from "../components/gamemodetabs";
import ProfileOverlay from "../components/profileoverlay";
import PageHeader from "../components/pageheader";
import SearchBar from "./searchbar";
import DiscordIcon from "../assets/discord.svg";
import CaretUpIcon from "../assets/caret-up.svg";
import SMPTiersImage from "../assets/smptiers.png";
import HomeIcon from "../assets/home.svg";
import RankingsIcon from "../assets/rankings.svg";
import RookieIcon from "../assets/rookie.svg";
import CombatNoviceIcon from "../assets/combat_novice.svg";
import CombatCadetIcon from "../assets/combat_cadet.svg";
import CombatSpecialistIcon from "../assets/combat_specialist.svg";
import CombatAceIcon from "../assets/combat_ace.svg";
import CombatMasterIcon from "../assets/combat_master.webp";
import CombatGodIcon from "../assets/combat_god.webp";
import shimmer1 from "../assets/1-shimmer.svg";
import shimmer2 from "../assets/2-shimmer.svg";
import shimmer3 from "../assets/3-shimmer.svg";
import shimmerOther from "../assets/other.svg";

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

const shimmerUrls = {
  1: shimmer1,
  2: shimmer2,
  3: shimmer3,
  other: shimmerOther,
};


function getShimmerUrl(position) {
  return shimmerUrls[position] || shimmerUrls.other;
}

const STORAGE_KEY_PREFIX = "leaderboard_cache_";
const CACHE_EXPIRATION = 10 * 60 * 1000;

// === Title info array with icon imports ===
const titleInfo = [
  { title: "Rookie", icon: RookieIcon, minPoints: 0, maxPoints: 9 },
  { title: "Combat Novice", icon: CombatNoviceIcon, minPoints: 10, maxPoints: 19 },
  { title: "Combat Cadet", icon: CombatCadetIcon, minPoints: 20, maxPoints: 49 },
  { title: "Combat Specialist", icon: CombatSpecialistIcon, minPoints: 50, maxPoints: 99 },
  { title: "Combat Ace", icon: CombatAceIcon, minPoints: 100, maxPoints: 249 },
  { title: "Combat Master", icon: CombatMasterIcon, minPoints: 250, maxPoints: 399 },
  { title: "Combat God", icon: CombatGodIcon, minPoints: 400, maxPoints: Infinity },
];

// Helper to get title info based on total points
function getTitleInfo(points) {
  return titleInfo.find(({ minPoints, maxPoints }) => points >= minPoints && points <= maxPoints);
}

export default function Leaderboard() {
  const { gamemode: rawGamemode } = useParams();
  const navigate = useNavigate();
  const gamemode = rawGamemode || "overall";

  // State to track if popup is open (click toggle)
  const [discordPopupOpen, setDiscordPopupOpen] = useState(false);

  const [lifestealLink] = useState("https://discord.gg/lifestealpvp");
  const [strengthLink] = useState("https://discord.gg/W58sv4nrRS");
  const [infuseLink] = useState("https://discord.gg/HF3m4b3HQF");
  const [glitchLink] = useState("https://discord.gg/G2BJc8NfDd");
  const [blissLink] = useState("https://discord.gg/WkTkYMUGsK");

  const [players, setPlayers] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [hoveredTierIndex, setHoveredTierIndex] = useState({ row: null, col: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const isMounted = useRef(true);
  const discordRef = useRef(null); // ref for discord popup container

  function fetchLeaderboardData() {
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
  }

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
    } else {
      fetchLeaderboardData();
    }

    const interval = setInterval(() => {
      fetchLeaderboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, [gamemode, navigate]);

  // Close popup if clicking outside Discord popup
  useEffect(() => {
    function handleClickOutside(event) {
      if (discordRef.current && !discordRef.current.contains(event.target)) {
        setDiscordPopupOpen(false);
      }
    }

    if (discordPopupOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [discordPopupOpen]);

  if (loading) return null;
  if (error) return <p style={{ ...styles.message, color: "#ef4444" }}>{error}</p>;

  return (
    <div style={styles.outerWrapper}>
      {/* Top Card with Home / Rankings / Discord */}
      <div style={styles.topCard}>
        <img src={SMPTiersImage} alt="smptiers" style={styles.smptiersImage} />
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <div
            onClick={() => navigate("/posts")}
            style={{
              display: "flex",
              alignItems: "center",
              color: "#ffffff",
              fontWeight: 600,
              fontSize: 18,
              cursor: "pointer",
              userSelect: "none",
            }}
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
            onClick={() => navigate("/rankings/overall")}
            style={{
              display: "flex",
              alignItems: "center",
              color: "#ffffff",
              fontWeight: 600,
              fontSize: 18,
              cursor: "pointer",
              userSelect: "none",
            }}
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
            ref={discordRef}
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
            <img src={DiscordIcon} alt="Discord" style={styles.discordIcon} draggable={false} />
            Discords{" "}
            <img
              src={CaretUpIcon}
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
                    key={mode}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 8,
                      cursor: "pointer",
                    }}
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

          // Calculate player's total points — adjust property name as needed!
          // You may also sum over kits if you want total points from all kits:
          // const totalPoints = player.kits?.reduce((acc, kit) => acc + (kit.points || 0), 0) || 0;
          const totalPoints = player.total_points || 0;

          // Get player's title object for points
          const titleObj = getTitleInfo(totalPoints);

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
                flexWrap: "nowrap",
              }}
            >
              <div style={styles.ribbon}>
                <img src={shimmerUrl} alt="shimmer" style={styles.shimmerImage} draggable={false} />
                <span style={styles.positionNumber}>{player.position}.</span>
                <img
                  src={`https://render.crafty.gg/3d/bust/${player.uuid}`}
                  alt={player.username}
                  style={styles.skinImageInRibbon}
                  draggable={false}
                />
              </div>

                <div style={styles.usernameColRow} title={player.username}>
                <div>{player.username}</div>
                {titleObj && (
                    <div
                    style={{
                        marginTop: 4,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        userSelect: "none",
                        color: "#54627D",
                        fontWeight: "600",
                        fontSize: 20,
                        // ensure it aligns left with username above:
                        justifyContent: "flex-start",
                    }}
                    >
                    <img
                        src={titleObj.icon}
                        alt={`${titleObj.title} icon`}
                        style={{ width: 30, height: 30, objectFit: "contain" }}
                        draggable={false}
                    />
                    <span>{titleObj.title}</span>
                    </div>
                )}
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

              <div style={{ ...styles.tierColRow, display: "flex", gap: 10, flexWrap: "wrap" }}>
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

                    const showTooltip =
                      hoveredTierIndex.row === index && hoveredTierIndex.col === idx;

                    const badge = (
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

                        {showTooltip && (
                          <div style={styles.tierTooltip}>
                            <div style={{ fontWeight: "1000", fontSize: 18 }}>
                              {displayTierName || "N/A"}
                            </div>
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

                  return [...rankedBadges, ...unrankedBadges];
                })()}
              </div>
            </div>
          );
        })}
      </>
    );
  }
}



const styles = {
  outerWrapper: {
    backgroundColor: "#121821",
    paddingBottom: "6rem",
    paddingTop: "2rem",
  },
  container: {
    maxWidth: 1600,
    minWidth: 1600,
    margin: "0 auto 3rem auto",
    padding: "3rem 2rem 2rem",
    backgroundColor: "#121821",
    borderRadius: 24,
    border: "2px solid #1f2937",
    color: "#e5e7eb",
    fontSize: 20,
    position: "relative",
    zIndex: 1,
    overflowX: "auto",
    WebkitOverflowScrolling: "touch",
  },
  headerRow: {
    display: "flex",
    padding: "0 0.5rem",
    color: "#9ca3af",
    fontWeight: "700",
    fontSize: 30,
    gap: 28,
    textTransform: "uppercase",
    alignItems: "center",
    height: "auto",
    flexWrap: "nowrap",
  },
  ribbonHeaderCol: {
    width: 200,
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  hashHeader: {
    fontSize: 30,
    fontWeight: 700,
    fontStyle: "italic",
    color: "#9ca3af",
    paddingLeft: 14,
  },
  usernameCol: {
    width: 400,
    fontWeight: 700,
    fontSize: 20,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  regionCol: {
    width: 250,
    fontWeight: 700,
    fontSize: 20,
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  tierCol: {
    width: 400,
    fontWeight: 700,
    fontSize: 20,
    textAlign: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  row: {
    display: "flex",
    alignItems: "center",
    padding: "1rem 1rem",
    borderRadius: 12,
    border: "2px solid #1f2937",
    marginBottom: 12,
    gap: 24,
    minHeight: 70,
    cursor: "pointer",
    flexWrap: "nowrap",
  },
  ribbon: {
    position: "relative",
    width: 200,
    height: 70,
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
    width: 200,
    height: 70,
    borderRadius: 15,
    objectFit: "cover",
    pointerEvents: "none",
    userSelect: "none",
    zIndex: 0,
  },
  positionNumber: {
    position: "absolute",
   top: "50%",
    left: 14,
    transform: "translateY(-50%)",
    fontSize: 42,
    fontWeight: 700,
    fontStyle: "italic",
    color: "#ffffff",
    zIndex: 2,
    userSelect: "none",
    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)",
  },
  skinImageInRibbon: {
    position: "absolute",
    top: "50%",
    right: 30,
    transform: "translateY(-50%)",
    width: 70,
    height: 70,
    borderRadius: 8,
    zIndex: 2,
    userSelect: "none",
  },
  usernameColRow: {
    width: 400,
    fontWeight: 600,
    color: "#CAD5E2",
    fontSize: 25,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  region: {
    fontSize: 20,
    padding: "6px 12px",
    borderRadius: 15,
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
    width: 400,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
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
    fontSize: 14,
    zIndex: 1001,
    userSelect: "none",
  },
  topCard: {
    backgroundColor: "#121821",
    border: "2px solid #1f2937",
    borderRadius: 24,
    paddingLeft: "2rem",
    paddingRight: "2rem",
    maxWidth: 1600,
    minWidth: 1600,
    display: "flex",
    minHeight: 60,
    justifyContent: "center",
    alignItems: "center",
    margin: "0 auto 2rem auto",
    textAlign: "center",
    position: "relative",
  },
  discordWrapper: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    justifyContent: "center",
    position: "relative",
  },
  discordIcon: {
    width: 30,
    height: 30,
    marginRight: 8,
    userSelect: "none",
  },
  discordText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#e5e7eb",
    userSelect: "none",
    position: "relative",
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
  popupItem: {
    display: "flex",
    alignItems: "center",
    marginBottom: 12,
  },
  popupIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
    userSelect: "none",
  },
  popupLink: {
    color: "#e5e7eb",
    textDecoration: "none",
    fontWeight: "700",
    fontSize: 18,
  },
  message: {
    fontSize: 20,
    textAlign: "center",
    marginTop: "2rem",
  },
  smptiersImage: {
    width: 200,
    height: 100,
    userSelect: "none",
    position: "absolute",
    left: 0,
  },
};
