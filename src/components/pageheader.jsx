// components/PageHeader.js
import React from "react";

export default function PageHeader({ children }) {
  return (
    <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
      <header style={styles.wrapper}>
        {children}
      </header>
    </div>
  );
}

const styles = {
  wrapper: {
    minWidth: 1150, // enforce minimum width to prevent squashing
    margin: "0 auto",
    padding: "0 2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
    height: 60,
    backgroundColor: "#121821",
    boxSizing: "border-box",
  },
};
