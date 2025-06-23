import lifestealIcon from "../assets/lifesteal.webp";
import infuseIcon from "../assets/infuse.webp";
import glitchIcon from "../assets/glitch.webp";
import strengthIcon from "../assets/strength.webp";
import blissIcon from "../assets/bliss.webp";

const tabIcons = {
    infuse: infuseIcon,
    lifesteal: lifestealIcon,
    glitch: glitchIcon,
    strength: strengthIcon,
    bliss: blissIcon,
};

export function getTabIcon(gamemode) {
  return tabIcons[gamemode] || "";
}

