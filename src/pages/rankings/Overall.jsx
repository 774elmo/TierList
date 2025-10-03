  import React, { useEffect, useState, useRef } from "react";
  import { useParams, useNavigate } from "react-router-dom";
  import { getGamemodeIcon } from "../../components/GamemodeIcons";
  import GamemodeTabs from "../../components/GamemodeTabs";
  import ProfileOverlay from "../../components/ProfileOverlay";
  import TopBar from "../../components/TopBar";

  import RookieIcon from "../../assets/rookie.svg";
  import CombatNoviceIcon from "../../assets/combat_novice.svg";
  import CombatCadetIcon from "../../assets/combat_cadet.svg";
  import CombatSpecialistIcon from "../../assets/combat_specialist.svg";
  import CombatAceIcon from "../../assets/combat_ace.webp";
  import CombatMasterIcon from "../../assets/combat_master.webp";
  import CombatGodIcon from "../../assets/combat_god.webp";

  import shimmer1 from "../../assets/1-shimmer.svg";
  import shimmer2 from "../../assets/2-shimmer.svg";
  import shimmer3 from "../../assets/3-shimmer.svg";
  import shimmerOther from "../../assets/other.svg";
  import skin404 from "../../assets/skin-404.avif";


  import "../../css/Overall.css";

  const validGamemodes = [
    "trident_mace",
  ];

  function regionColor(region) {
    switch (region) {
      case "AS": return "#422C3F";
      case "EU": return "#1C3E20";
      case "NA": return "#442228";
      default: return "#6b7280";
    }
  }

  function regionTextColor(region) {
    switch (region) {
      case "AS": return "#AF7F91";
      case "EU": return "#89F19C";
      case "NA": return "#D95C6A";
      default: return "#ffffff";
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

  const shimmerUrls = { 1: shimmer1, 2: shimmer2, 3: shimmer3, other: shimmerOther };
  function getShimmerUrl(position) { return shimmerUrls[position] || shimmerUrls.other; }

  const STORAGE_KEY_PREFIX = "leaderboard_cache_";
  const CACHE_EXPIRATION = 10 * 60 * 1000; // 10 minutes

  const titleInfo = [
    { title: "Rookie", icon: RookieIcon, minPoints: 0, maxPoints: 9 },
    { title: "Combat Novice", icon: CombatNoviceIcon, minPoints: 10, maxPoints: 19 },
    { title: "Combat Cadet", icon: CombatCadetIcon, minPoints: 20, maxPoints: 49 },
    { title: "Combat Specialist", icon: CombatSpecialistIcon, minPoints: 50, maxPoints: 99 },
    { title: "Combat Ace", icon: CombatAceIcon, minPoints: 100, maxPoints: 249 },
    { title: "Combat Master", icon: CombatMasterIcon, minPoints: 250, maxPoints: 399 },
    { title: "Combat God", icon: CombatGodIcon, minPoints: 400, maxPoints: Infinity },
  ];

  function getTitleInfo(points) {
    return titleInfo.find(({ minPoints, maxPoints }) => points >= minPoints && points <= maxPoints);
  }

  export default function Leaderboard() {
    const { gamemode: rawGamemode } = useParams();
    const navigate = useNavigate();
    const gamemode = rawGamemode || "overall";

    const [players, setPlayers] = useState([]);
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [hoveredTierIndex, setHoveredTierIndex] = useState({ row: null, col: null });
    const [loading, setLoading] = useState(true);
    const [minLoadingDone, setMinLoadingDone] = useState(false);
    const [error, setError] = useState(null);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    const isMounted = useRef(true);

    // Minimum loading time
    useEffect(() => {
      const timer = setTimeout(() => setMinLoadingDone(true), 500);
      return () => clearTimeout(timer);
    }, []);

    // Mount / unmount
    useEffect(() => {
      isMounted.current = true;
      return () => (isMounted.current = false);
    }, []);

    // Resize listener
    useEffect(() => {
      function handleResize() {
        setIsMobile(window.innerWidth <= 768);
      }
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    function fetchLeaderboardData() {
      const baseUrl = "https://api.tridentmace.xyz/api/v1/data";
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
          const cachedData = getCachedData(gamemode);
          if (cachedData) {
            setPlayers(cachedData);
            setLoading(false);
          } else {
            setError("Could not load leaderboard data.");
            setLoading(false);
          }
        });
    }

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
        localStorage.setItem(
          STORAGE_KEY_PREFIX + mode,
          JSON.stringify({ timestamp: Date.now(), data })
        );
      } catch {}
    }

    // Load data
    useEffect(() => {
      setLoading(true);
      setError(null);

      const validGamemodeCheck = gamemode === "overall" || validGamemodes.includes(gamemode);
      if (!validGamemodeCheck) {
        navigate("/rankings/overall", { replace: true });
        return;
      }

      // Always try fresh data first
      fetchLeaderboardData();

      // Use cache only if API fails
      const cachedData = getCachedData(gamemode);
      if (cachedData) {
        setPlayers(cachedData);
        setLoading(false);
      }

      const interval = setInterval(() => fetchLeaderboardData(), 3600000);
      return () => clearInterval(interval);
    }, [gamemode, navigate]);

    const showLoading = loading || !minLoadingDone;
    if (showLoading) {
      return (
        <div className="loading-wrapper">
          <div className="lds-ellipsis">
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      );
    }

    if (error) return <p className="message error">{error}</p>;

return (
  <div className="outer-wrapper">
    <TopBar />
    <div className="tabs-wrapper">
      <GamemodeTabs />
    </div>

    <div className="container leaderboard-container">
      <div className="leaderboard-table">
        {/* Desktop header */}
        {!isMobile && (
          <div className="header-row">
            <div className="ribbon-header-col"><span>#</span></div>
            <div className="username-col">PLAYER</div>
            <div className="region-col">REGION</div>
            <div className="tier-header">TIERS</div>
          </div>
        )}

        {/* Mobile header */}
        {isMobile && (
          <div className="header-row mobile-header">
            <div className="ribbon-header-col"><span>#</span></div>
            <div className="username-col">PLAYER</div>
            <div className="region-col">REGION</div>
          </div>
        )}

        {/* Rows */}
        {players.map((player, index) => {
          const shimmerUrl = getShimmerUrl(player.position);
          const isHovered = hoveredIndex === index;
          const totalPoints = player.total_points || 0;
          const titleObj = getTitleInfo(totalPoints);

          const sortedGamemodes = validGamemodes
            .map((mode, idx) => {
              const kit = (player.kits || []).find((k) =>
                [k.kit_name, k.gamemode, k.name, k.type].includes(mode)
              );
              const tierNameRaw = kit?.tier_name;
              return { mode, idx, kit, tierNameRaw, isRanked: !!tierNameRaw };
            })
            .sort((a, b) => b.isRanked - a.isRanked);

          // 🔹 Mobile card
          if (isMobile) {
            const topBadges = sortedGamemodes.slice(0, 5);
            const bottomBadges = sortedGamemodes.slice(5);

            return (
              <div
                key={player.uuid}
                className={`row mobile-card ${isHovered ? "hovered" : ""}`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => setSelectedPlayer(player)}
              >
                <div className="row-top">
                  {/* Ribbon */}
                  <div className="ribbon">
                    <img src={shimmerUrl} alt="shimmer" className="shimmer-image" />
                    <span className="position-number">{player.position}.</span>
                    <img
                      src={`https://render.crafty.gg/3d/bust/${player.uuid}`}
                      alt={player.username}
                      className="skin-image"
                      onError={(e) => {
                        e.currentTarget.onerror = null; // Prevent infinite loop
                        e.currentTarget.src = skin404;  // Fallback image
                      }}
                    />
                  </div>

                  {/* Username & Title */}
                  <div className="info-block">
                    <div className="username-row">
                      <div className="username-col-row">
                        <span className="username-name">{player.username}</span>
                        {titleObj && (
                          <div className="title-info">
                            <img src={titleObj.icon} alt={titleObj.title} />
                            <span className="title-text">
                              {titleObj.title} <span className="points">({totalPoints.toLocaleString()} points)</span>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Region */}
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
                  </div>
                </div>

                {/* Tiers */}
                <div className="tier-section">
                  <div className="tier-col-row-wrapper">
                    <div className="tier-header">TIERS</div>
                    <div className="tier-col-row all-badges">
                      {sortedGamemodes.map(({ mode, idx, tierNameRaw, isRanked }) => {
                        const tierColors = getTierColors(tierNameRaw);
                        return (
                          <div key={idx} className="tier-badge">
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
                                    style={{ borderColor: tierColors.backgroundColor }}
                                  />
                                </>
                              ) : (
                                <div className="icon-outline unranked" />
                              )}
                            </div>
                            <div
                              className="tier-name"
                              style={{
                                backgroundColor: isRanked
                                  ? tierColors.backgroundColor
                                  : "#212B39",
                                color: isRanked ? tierColors.color : "#354153",
                              }}
                            >
                              {isRanked ? tierNameRaw : "-"}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          // 🔹 Desktop row
          return (
            <div
              key={player.uuid}
              className={`row ${isHovered ? "hovered" : ""}`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => setSelectedPlayer(player)}
            >
              {/* Ribbon */}
              <div className="ribbon">
                <img src={shimmerUrl} alt="shimmer" className="shimmer-image" />
                <span className="position-number">{player.position}.</span>
                <img
                  src={`https://render.crafty.gg/3d/bust/${player.uuid}`}
                  alt={player.username}
                  className="skin-image"
                  onError={(e) => {
                    e.currentTarget.onerror = null; // Prevent infinite loop
                    e.currentTarget.src = skin404;  // Fallback image
                  }}
                />
              </div>

              {/* Username & Title */}
              <div className="username-col-row">
                <span className="username-name">{player.username}</span>
                {titleObj && (
                  <div className="title-info">
                    <img src={titleObj.icon} alt={titleObj.title} />
                    <span className="title-text">
                      {titleObj.title} <span className="points">({totalPoints.toLocaleString()} points)</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Region */}
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

              {/* Tiers */}
              <div className="tier-col-row">
                {sortedGamemodes.map(({ mode, idx, tierNameRaw, isRanked }) => {
                  const tierColors = getTierColors(tierNameRaw);
                  return (
                    <div key={idx} className="tier-badge">
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
                              style={{ borderColor: tierColors.backgroundColor }}
                            />
                          </>
                        ) : (
                          <div className="icon-outline unranked" />
                        )}
                      </div>
                      <div
                        className="tier-name"
                        style={{
                          backgroundColor: isRanked ? tierColors.backgroundColor : "#212B39",
                          color: isRanked ? tierColors.color : "#354153",
                        }}
                      >
                        {isRanked ? tierNameRaw : "-"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>

    {/* Player overlay */}
    {selectedPlayer && (
      <ProfileOverlay
        playerUuid={selectedPlayer?.uuid}
        onClose={() => setSelectedPlayer(null)}
      />
    )}
  </div>
);
}