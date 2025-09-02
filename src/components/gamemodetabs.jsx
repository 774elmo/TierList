import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getGamemodeIcon } from "./GamemodeIcons";
import overallIcon from "../assets/overall.svg";
import "../css/GamemodeTabs.css";

const gamemodes = [
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

const displayNames = {
  diamond_op: "Diamond OP",
  shieldless_smp: "Shieldless SMP",
  iron_pot: "Iron Pot",
  neth_sword: "Neth Sword",
  crossbow: "Crossbow",
  spleef: "Spleef",
  ice: "Ice",
  sumo: "Sumo",
  tnt: "TNT",
};

export default function GamemodeTabs() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname.split("/")[2] || "overall";

  const getTabClass = (tab) => (tab === activeTab ? "tab active" : "tab");

  return (
    <div className="tab-container">
      {/* Overall tab */}
      <button
        onClick={() => navigate("/rankings/overall")}
        className={getTabClass("overall")}
      >
        <img src={overallIcon} alt="overall" draggable={false} />
        <span>Overall</span>
      </button>

      {/* Gamemode tabs */}
      {gamemodes.map((mode) => (
        <button
          key={mode}
          onClick={() => navigate(`/rankings/${mode}`)}
          className={getTabClass(mode)}
        >
          <img src={getGamemodeIcon(mode)} alt={mode} draggable={false} />
          <span>{displayNames[mode]}</span>
        </button>
      ))}
    </div>
  );
}
