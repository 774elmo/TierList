import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GamemodeTabs from "../../components/GamemodeTabs";
import ProfileOverlay from "../../components/ProfileOverlay";
import TopBar from "../../components/TopBar";

import HT1 from "../../assets/HT1.webp";
import HT2 from "../../assets/HT2.webp";
import HT3 from "../../assets/HT3.webp";
import caretDoubleUp from "../../assets/caret-double-up.svg";
import caretUp from "../../assets/caret-up.svg";

import "../../css/GamemodeRanking.css";

const validGamemodes = [
  "diamond_op",
  "shieldless_smp",
  "iron_pot",
  "neth_sword",
  "crossbow",
  "spleef",
  "ice",
  "sumo",
  "tnt",
];

const topStripColors = ["#41361B", "#343843", "#352620", "#161E2A", "#161E2A"];

const tierData = [
  { label: "Tier 1", color: "#F0B857", img: HT1 },
  { label: "Tier 2", color: "#A9B1AD", img: HT2 },
  { label: "Tier 3", color: "#D5914E", img: HT3 },
  { label: "Tier 4", color: "#B1C0CC", img: null },
  { label: "Tier 5", color: "#B1C0CC", img: null },
];

const fetchCache = {};

async function cachedFetch(url) {
  if (fetchCache[url]) return fetchCache[url];
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch: ${url}`);
  const data = await response.json();
  fetchCache[url] = data;
  return data;
}

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

export default function GamemodeRanking() {
  const { gamemode } = useParams();
  const navigate = useNavigate();

  // Redirect if invalid gamemode
  useEffect(() => {
    if (gamemode && gamemode !== "overall" && !validGamemodes.includes(gamemode)) {
      navigate("/rankings/overall", { replace: true });
    }
  }, [gamemode, navigate]);

  const [players, setPlayers] = useState([]);
  const [overallPlayers, setOverallPlayers] = useState([]);
  const [hoveredPlayer, setHoveredPlayer] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gamemode || gamemode === "overall") return;

    async function fetchData() {
      try {
        setLoading(true);

        const startTime = Date.now();
        const gamemodeUrl = `https://api.extiers.xyz/api/v1/data?gamemode=${gamemode}`;
        const overallUrl = "https://api.extiers.xyz/api/v1/data";

        const [dataGamemode, dataOverall] = await Promise.all([
          cachedFetch(gamemodeUrl),
          cachedFetch(overallUrl),
        ]);

        setPlayers(dataGamemode);
        setOverallPlayers(dataOverall);

        const elapsed = Date.now() - startTime;
        const minLoadingTime = 500; 
        if (elapsed < minLoadingTime) {
          await new Promise((res) => setTimeout(res, minLoadingTime - elapsed));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
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
            (k) => k.kit_name === gamemode && k.tier_name === `HT${ending}` && !k.retired
          ),
        }))
        .filter(({ kits }) => kits.length > 0),
      LT: players
        .map((p) => ({
          player: p,
          kits: p.kits.filter(
            (k) => k.kit_name === gamemode && k.tier_name === `LT${ending}` && !k.retired
          ),
        }))
        .filter(({ kits }) => kits.length > 0),
    };
  }

  return (
    <div className="outer-wrapper">
      <TopBar />

      <div className="tabs-wrapper">
        <GamemodeTabs />
      </div>

      <div className="crossbow-container">
        {[1, 2, 3, 4, 5].map((num, idx) => {
          const tier = tierData[num - 1];
          const { HT, LT } = getPlayersForTierEnding(num);
          const tierPlayers = [...HT, ...LT];

          return (
            <div key={num} className="tier-strip">
              <div className="tier-header" style={{ backgroundColor: topStripColors[idx] }}>
                {tier.img && <img src={tier.img} alt={tier.label} className="tier-header-img" />}
                <span className="tier-header-label" style={{ color: tier.color }}>
                  {tier.label}
                </span>
              </div>

              {loading ? (
                <div className="loading-wrapper">
                  <div className="lds-ellipsis">
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                </div>
              ) : (
                tierPlayers.map(({ player }) => {
                  const isHT = HT.some((p) => p.player.uuid === player.uuid);
                  const isHovered = hoveredPlayer === player.uuid;

                  return (
                    <div
                      key={player.uuid}
                      className={`tier-entry ${isHovered ? "hovered" : ""}`}
                      style={{ backgroundColor: isHT ? "#263244" : "#161E2A" }}
                      onMouseEnter={() => setHoveredPlayer(player.uuid)}
                      onMouseLeave={() => setHoveredPlayer(null)}
                      onClick={() => setSelectedPlayer(player)}
                    >
                      <div
                        className="region-strip"
                        style={{
                          backgroundColor: isHovered
                            ? getDarkRegionColor(player.region)
                            : getBrightRegionColor(player.region),
                          width: isHovered ? 30 : 5,
                        }}
                      >
                        {isHovered && player.region}
                      </div>

                      <div className="skin-frame">
                        <img
                          src={`https://render.crafty.gg/3d/bust/${player.uuid}`}
                          alt={player.username}
                          className="skin"
                        />
                      </div>

                      <span className="username">{player.username}</span>

                      <img src={isHT ? caretDoubleUp : caretUp} alt="tier" className="tier-arrow" />
                    </div>
                  );
                })
              )}
            </div>
          );
        })}
      </div>

      {selectedPlayer && (
        <ProfileOverlay playerUuid={selectedPlayer?.uuid} onClose={() => setSelectedPlayer(null)} />
      )}
    </div>
  );
}
