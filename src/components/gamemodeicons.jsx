import lifestealIcon from "../assets/lifesteal.webp";
import tridentMaceIcon from "../assets/trident_mace.webp";

export function getGamemodeIcon(gamemode) {
  const icons = {
    lifesteal: lifestealIcon,
    trident_mace: tridentMaceIcon,
  };
  return icons[gamemode] || "";
}
