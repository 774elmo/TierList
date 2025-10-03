import React from "react";
import TopBar from "../../components/TopBar";
import "../../css/Overall.css"; // reusing the outer-wrapper, container, etc.

export default function DiscordPage() {
  const discordLinks = [
    { mode: "Trident Mace", url: "https://discord.gg/tridentmace" },
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
