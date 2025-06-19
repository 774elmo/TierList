import lifestealTabIcon from "../assets/lifesteal.webp";
import maceTabIcon from "../assets/trident_mace.webp";

const tabIcons = {
  lifesteal: lifestealTabIcon,
  trident_mace: maceTabIcon,
};

export function getTabIcon(gamemode) {
  return tabIcons[gamemode] || "";
}

