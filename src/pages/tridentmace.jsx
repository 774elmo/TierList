import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GamemodeTabs from "../components/gamemodetabs";
import ProfileOverlay from "../components/profileoverlay";
import PageHeader from "../components/pageheader";
import SearchBar from "../components/searchbar";

import HT1 from "../assets/HT1.webp";
import HT2 from "../assets/HT2.webp";
import HT3 from "../assets/HT3.webp";
import caretDoubleUp from "../assets/caret-double-up.svg";
import caretUp from "../assets/caret-up.svg";

const validGamemodes = ["lifesteal", "trident_mace"];

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

export default function TridentMace() {
  const { gamemode: rawGamemode } = useParams();
  const navigate = useNavigate();
  const gamemode = rawGamemode || "trident_mace";

  const [players, setPlayers] = useState([]);
  const [overallPlayers, setOverallPlayers] = useState([]);
  const [hoveredPlayer, setHoveredPlayer] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const isMobile = window.innerWidth <= 640;

  useEffect(() => {
    if (!validGamemodes.includes(gamemode)) {
      navigate("/rankings/trident_mace", { replace: true });
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
      <PageHeader>
        <GamemodeTabs />
        <SearchBar />
      </PageHeader>

      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
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
                        height: isMobile ? 30 : 40,
                        width: isMobile ? 30 : 40,
                        objectFit: "contain",
                        marginRight: 8,
                      }}
                    />
                  )}
                  <span
                    style={{
                      color: tier.color,
                      fontWeight: "700",
                      fontSize: isMobile ? 18 : 24,
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
                          fontSize: isMobile ? 10 : 14,
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
                      <span style={{ ...styles.username, fontSize: isMobile ? 10 : 14 }}>
                        {player.username}
                      </span>
                      <img
                        src={caretDoubleUp}
                        alt="HT icon"
                        style={{
                          width: isMobile ? 20 : 25,
                          height: isMobile ? 16 : 20,
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
                          fontSize: isMobile ? 10 : 14,
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
                      <span style={{ ...styles.username, fontSize: isMobile ? 10 : 14 }}>
                        {player.username}
                      </span>
                      <img
                        src={caretUp}
                        alt="LT icon"
                        style={{
                          width: isMobile ? 20 : 25,
                          height: isMobile ? 16 : 20,
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
    paddingTop: "4rem",
    minHeight: "100vh",
  },
  container: {
    minWidth: 800,
    maxWidth: 1200,
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
    gap: 12,
  },
  strip: {
    flex: 1,
    borderRadius: 12,
    display: "flex",
    flexDirection: "column",
    gap: 3,
    overflow: "hidden",
  },
  tierEntry: {
    height: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 8px",
    color: "#e5e7eb",
    fontWeight: "600",
    fontSize: 14,
    position: "relative",
  },
  regionStrip: {
    width: 5,
    height: "100%",
    borderRadius: 2,
    marginRight: 6,
    transition: "width 0.3s ease, background-color 0.3s ease",
  },
  skinFrame: {
    width: 27,
    height: 27,
    borderRadius: 8,
    backgroundColor: "#1E2836",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginRight: 6,
  },
  skin: {
    width: 25,
    height: 25,
    borderRadius: 4,
  },
  username: {
    flex: 1,
    textAlign: "left",
    paddingLeft: 8,
    fontSize: 14,
  },
};
