// GamemodeIcons.jsx
import diamondOpIcon from "../assets/diamond_op.webp";
import shieldlessSmpIcon from "../assets/shieldless_smp.webp";
import ironPotIcon from "../assets/iron_pot.webp";
import nethSwordIcon from "../assets/neth_sword.webp";
import crossbowIcon from "../assets/crossbow.webp";
import spleefIcon from "../assets/spleef.webp";
import iceIcon from "../assets/ice.webp";
import sumoIcon from "../assets/sumo.webp";
import tntIcon from "../assets/tnt.webp";

const gamemodeIcons = {
  diamond_op: diamondOpIcon,
  shieldless_smp: shieldlessSmpIcon,
  iron_pot: ironPotIcon,
  neth_sword: nethSwordIcon,
  crossbow: crossbowIcon,
  spleef: spleefIcon,
  ice: iceIcon,
  sumo: sumoIcon,
  tnt: tntIcon,
};

/**
 * Returns the icon image path for a given gamemode string
 * @param {string} gamemode
 * @returns {string} URL of the icon
 */
export function getGamemodeIcon(gamemode) {
  return gamemodeIcons[gamemode] || null;
}
