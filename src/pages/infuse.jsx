import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GamemodeTabs from "../components/gamemodetabs";
import ProfileOverlay from "../components/profileoverlay";
import PageHeader from "../components/pageheader"; // <- import the header
import SearchBar from "../components/searchbar";
import DiscordIcon from "../assets/discord.svg";
import SMPTiersImage from "../assets/smptiers.png";
import HomeIcon from "../assets/home.svg";
import RankingsIcon from "../assets/rankings.svg";
import { getGamemodeIcon } from "../components/gamemodeicons";


import HT1 from "../assets/HT1.webp";
import HT2 from "../assets/HT2.webp";
import HT3 from "../assets/HT3.webp";
import caretDoubleUp from "../assets/caret-double-up.svg";
import caretUp from "../assets/caret-up.svg";

const validGamemodes = ["lifesteal", "infuse", "glitch", "strength", "bliss"];;

const topStripColors = [
  "#41361B",
  "#343843",
  "#352620",
  "#161E2A",
  "#161E2A",
];

const tierData = [
  { label: "Tier 1", color: "#F0B857", img: HT1 },
  { label: "Tier 2", color: "#A9B1AD", img: HT2 },
  { label: "Tier 3", color: "#D5914E", img: HT3 },
  { label: "Tier 4", color: "#B1C0CC", img: null },
  { label: "Tier 5", color: "#B1C0CC", img: null },
];

function getBrightRegionColor(region) {
  switch (region) {
    case "EU":
      return "#89F19C";
    case "NA":
      return "#D95C6A";
    case "AS":
      return "#AF7F91";
    default:
      return "#444";
  }
}

function getDarkRegionColor(region) {
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

// Simple in-file cache for fetch responses
const fetchCache = {};

async function cachedFetch(url) {
  if (fetchCache[url]) {
    return fetchCache[url];
  }
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch: ${url}`);
  const data = await response.json();
  fetchCache[url] = data;
  return data;
}

export default function Infuse() {
  const { gamemode: rawGamemode } = useParams();
  const navigate = useNavigate();
  const gamemode = rawGamemode || "infuse";

  const [players, setPlayers] = useState([]);
  const [overallPlayers, setOverallPlayers] = useState([]);
  const [hoveredPlayer, setHoveredPlayer] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const [discordPopupOpen, setDiscordPopupOpen] = useState(false);
  const discordRef = useRef(null);

  const [lifestealLink] = useState("https://discord.gg/lifestealpvp");
  const [strengthLink] = useState("https://discord.gg/W58sv4nrRS");
  const [infuseLink] = useState("https://discord.gg/HF3m4b3HQF");
  const [glitchLink] = useState("https://discord.gg/G2BJc8NfDd");
  const [blissLink] = useState("https://discord.gg/WkTkYMUGsK");

  useEffect(() => {
    if (!validGamemodes.includes(gamemode)) {
      navigate("/rankings/infuse", { replace: true });
    }
  }, [gamemode, navigate]);

  useEffect(() => {
    async function fetchData() {
      try {
        const gamemodeUrl = `https://api.lifestealpvp.xyz/api/v1/data?gamemode=${gamemode}`;
        const overallUrl = "https://api.lifestealpvp.xyz/api/v1/data";

        const [dataGamemode, dataOverall] = await Promise.all([
          cachedFetch(gamemodeUrl),
          cachedFetch(overallUrl),
        ]);

        setPlayers(dataGamemode);
        setOverallPlayers(dataOverall);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, [gamemode]);

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

  function getPlayersForTierEnding(ending) {
    return {
      HT: players
        .map((p) => ({
          player: p,
          kits: p.kits.filter(
            (k) =>
              k.kit_name === gamemode &&
              k.tier_name === `HT${ending}` &&
              !k.retired
          ),
        }))
        .filter(({ kits }) => kits.length > 0),

      LT: players
        .map((p) => ({
          player: p,
          kits: p.kits.filter(
            (k) =>
              k.kit_name === gamemode &&
              k.tier_name === `LT${ending}` &&
              !k.retired
          ),
        }))
        .filter(({ kits }) => kits.length > 0),
    };
  }

  function handlePlayerClick(uuid) {
    const overallPlayer = overallPlayers.find((p) => p.uuid === uuid);
    if (overallPlayer) {
      setSelectedPlayer(overallPlayer);
    }
  }

  return (
    <div style={styles.outerWrapper}>
      {/* Top Card (with Rankings added between Home and Discord) */}
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

      {/* Reusable Header */}
      <PageHeader>
        <GamemodeTabs />
        <SearchBar />
      </PageHeader>

      {/* Page Content */}
      <div style={styles.container}>
        {[1, 2, 3, 4, 5].map((num, idx) => {
          const tier = tierData[num - 1];
          const { HT, LT } = getPlayersForTierEnding(num);

          return (
            <div key={num} style={styles.strip}>
              <div
                style={{
                  height: 60,
                  backgroundColor: topStripColors[idx],
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {tier.img && (
                  <img
                    src={tier.img}
                    alt={tier.label}
                    style={{
                      height: 40,
                      width: 40,
                      objectFit: "contain",
                      marginRight: 8,
                    }}
                  />
                )}
                <span
                  style={{
                    color: tier.color,
                    fontWeight: "700",
                    fontSize: 24,
                    userSelect: "none",
                  }}
                >
                  {tier.label}
                </span>
              </div>

              {HT.map(({ player }, i) => {
                const isLastHT = HT.length > 0 && LT.length === 0 && i === HT.length - 1;
                const brightColor = getBrightRegionColor(player.region);
                const darkColor = getDarkRegionColor(player.region);
                const isHovered = hoveredPlayer === player.uuid;

                return (
                  <div
                    key={player.uuid}
                    style={{
                      ...styles.tierEntry,
                      backgroundColor: "#263244",
                      borderBottomLeftRadius: isLastHT ? 8 : 0,
                      borderBottomRightRadius: isLastHT ? 8 : 0,
                      cursor: "pointer",
                    }}
                    onMouseEnter={() => setHoveredPlayer(player.uuid)}
                    onMouseLeave={() => setHoveredPlayer(null)}
                    onClick={() => handlePlayerClick(player.uuid)}
                  >
                    <div
                      style={{
                        ...styles.regionStrip,
                        backgroundColor: isHovered ? darkColor : brightColor,
                        width: isHovered ? 30 : 5,
                        transition: "width 0.3s ease, background-color 0.3s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        paddingLeft: 0,
                        color: brightColor,
                        fontWeight: "700",
                        fontSize: 14,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        borderRadius: 2,
                        marginRight: 6,
                        userSelect: "none",
                      }}
                    >
                      {isHovered && player.region}
                    </div>

                    <div style={styles.skinFrame}>
                      <img
                        src={`https://render.crafty.gg/3d/bust/${player.uuid}`}
                        alt={player.username}
                        style={styles.skin}
                      />
                    </div>
                    <span style={styles.username}>{player.username}</span>
                    <img
                      src={caretDoubleUp}
                      alt="HT icon"
                      style={{
                        width: 25,
                        height: 20,
                        marginLeft: 6,
                        filter:
                          "invert(38%) sepia(51%) saturate(344%) hue-rotate(190deg) brightness(90%) contrast(85%)",
                      }}
                    />
                  </div>
                );
              })}

              {LT.map(({ player }, i) => {
                const isLastLT = i === LT.length - 1;
                const brightColor = getBrightRegionColor(player.region);
                const darkColor = getDarkRegionColor(player.region);
                const isHovered = hoveredPlayer === player.uuid;

                return (
                  <div
                    key={player.uuid}
                    style={{
                      ...styles.tierEntry,
                      backgroundColor: "#161E2A",
                      borderBottomLeftRadius: isLastLT ? 8 : 0,
                      borderBottomRightRadius: isLastLT ? 8 : 0,
                      cursor: "pointer",
                    }}
                    onMouseEnter={() => setHoveredPlayer(player.uuid)}
                    onMouseLeave={() => setHoveredPlayer(null)}
                    onClick={() => handlePlayerClick(player.uuid)}
                  >
                    <div
                      style={{
                        ...styles.regionStrip,
                        backgroundColor: isHovered ? darkColor : brightColor,
                        width: isHovered ? 30 : 5,
                        transition: "width 0.3s ease, background-color 0.3s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        paddingLeft: 0,
                        color: brightColor,
                        fontWeight: "700",
                        fontSize: 14,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        borderRadius: 2,
                        marginRight: 6,
                        userSelect: "none",
                      }}
                    >
                      {isHovered && player.region}
                    </div>

                    <div style={styles.skinFrame}>
                      <img
                        src={`https://render.crafty.gg/3d/bust/${player.uuid}`}
                        alt={player.username}
                        style={styles.skin}
                      />
                    </div>
                    <span style={styles.username}>{player.username}</span>
                    <img
                      src={caretUp}
                      alt="LT icon"
                      style={{
                        width: 25,
                        height: 20,
                        marginLeft: 6,
                        filter:
                          "invert(20%) sepia(45%) saturate(310%) hue-rotate(200deg) brightness(80%) contrast(85%)",
                      }}
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {selectedPlayer && (
        <ProfileOverlay player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}
    </div>
  );
}


const styles = {
  outerWrapper: {
    backgroundColor: "#121821",
    paddingBottom: "6rem",
    paddingTop: "2rem",
  },
  container: {
    maxWidth: 1200,
    minWidth: 1200,        // fixed width to match main container style
    margin: "0 auto 3rem auto",
    padding: "3rem 2rem 2rem",
    backgroundColor: "#121821",
    borderRadius: 24,
    border: "2px solid #1f2937",
    color: "#e5e7eb",
    fontSize: 20,
    position: "relative",
    zIndex: 1,
    display: "flex",
    gap: 24,
    overflowX: "auto",     // enable horizontal scroll on narrow viewports
    WebkitOverflowScrolling: "touch",
  },
  strip: {
    flex: "1 1 240px",     // fixed-ish width so 5 strips fit in 1200px with gaps
    borderRadius: 12,
    display: "flex",
    flexDirection: "column",
    gap: 6,
    overflow: "hidden",
  },
  tierEntry: {
    height: 48,            // taller for better click/touch area
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 12px",
    color: "#e5e7eb",
    fontWeight: "600",
    fontSize: 16,
    position: "relative",
    cursor: "pointer",
    borderRadius: 8,
    userSelect: "none",
    backgroundColor: "#263244",
  },
  regionStrip: {
    width: 6,
    height: "100%",
    borderRadius: 2,
    marginRight: 8,
    transition: "width 0.3s ease, background-color 0.3s ease",
  },
  skinFrame: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#1E2836",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginRight: 8,
    flexShrink: 0,
  },
  skin: {
    width: 32,
    height: 32,
    borderRadius: 6,
  },
  username: {
    flex: 1,
    textAlign: "left",
    paddingLeft: 10,
    fontSize: 16,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
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
};

