// GamemodeIcons.jsx
import TridentMaceIcon from "../assets/trident_mace.webp";

const gamemodeIcons = {
  trident_mace: TridentMaceIcon,
};

/**
 * Returns the icon image path for a given gamemode string
 * @param {string} gamemode
 * @returns {string} URL of the icon
 */
export function getGamemodeIcon(gamemode) {
  return gamemodeIcons[gamemode] || null;
}
