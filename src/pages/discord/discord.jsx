import React from "react";
import TopBar from "../../components/TopBar";
import "../../css/Overall.css"; // reusing the outer-wrapper, container, etc.

export default function DiscordPage() {
  const discordLinks = [
    { mode: "Diamond OP", url: "https://discord.gg/diamond_op" },
    { mode: "Shieldless SMP", url: "https://discord.gg/shieldless_smp" },
    { mode: "Neth Sword", url: "https://discord.gg/neth_sword" },
    { mode: "Iron Pot", url: "https://discord.gg/iron_pot" },
    { mode: "TNT", url: "https://discord.gg/tnt" },
    { mode: "Sumo", url: "https://discord.gg/sumo" },
    { mode: "Spleef", url: "https://discord.gg/spleef" },
    { mode: "Crossbow", url: "https://discord.gg/crossbow" },
    { mode: "Ice", url: "https://discord.gg/ice" },
  ];

  return (
    <div className="outer-wrapper">
      <TopBar />

      <div className="container" style={{ padding: "2rem", maxWidth: "800px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "2rem", textAlign: "center" }}>
          Join Our Discord Servers
        </h1>

        <div className="discord-buttons" style={{ display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "center" }}>
          {discordLinks.map((link) => (
            <a
              key={link.mode}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="discord-button"
              style={{
                backgroundColor: "#1f2937",
                color: "#fff",
                padding: "12px 20px",
                borderRadius: "12px",
                fontWeight: 600,
                textDecoration: "none",
                textAlign: "center",
                minWidth: "120px",
                transition: "background 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#374151")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#1f2937")}
            >
              {link.mode}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
