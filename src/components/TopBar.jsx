import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HomeIcon from "../assets/home.svg";
import RankingsIcon from "../assets/rankings.svg";
import DiscordIcon from "../assets/discord.svg";
import SearchBar from "./SearchBar";
import "../css/TopBar.css";

export default function TopBar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const NavItem = ({ icon, label, onClick }) => (
    <div className="nav-item slide-menu-item" onClick={onClick}>
      <img src={icon} alt={label} className="nav-icon" />
      <span>{label}</span>
    </div>
  );

  return (
    <>
      <div className="top-card">
        {isMobile ? (
          <>
            <div className="mobile-left">
              <div
                className="mobile-menu-button"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <span className="burger-line" />
                <span className="burger-line" />
                <span className="burger-line" />
              </div>
            </div>

            <div className="mobile-right">
              <SearchBar />
            </div>
          </>
        ) : (
          <>
            <div className="top-card-center nav-items-desktop">
              <NavItem
                icon={HomeIcon}
                label="Home"
                onClick={() => navigate("/posts")}
              />
              <NavItem
                icon={RankingsIcon}
                label="Rankings"
                onClick={() => navigate("/rankings/overall")}
              />
              <NavItem
                icon={DiscordIcon}
                label="Discord"
                onClick={() => navigate("/discords")}
              />
            </div>

            <div className="search-bar-wrapper desktop-search">
              <SearchBar />
            </div>
          </>
        )}
      </div>

      {isMobile && (
        <>
          <div
            className={`slide-menu-overlay ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen(false)}
          />
          <div className={`slide-out-menu ${menuOpen ? "open" : ""}`}>
            <NavItem
              icon={HomeIcon}
              label="Home"
              onClick={() => {
                navigate("/posts");
                setMenuOpen(false);
              }}
            />
            <NavItem
              icon={RankingsIcon}
              label="Rankings"
              onClick={() => {
                navigate("/rankings/overall");
                setMenuOpen(false);
              }}
            />
            <NavItem
              icon={DiscordIcon}
              label="Discord"
              onClick={() => {
                navigate("/discords");
                setMenuOpen(false);
              }}
            />
          </div>
        </>
      )}
    </>
  );
}
