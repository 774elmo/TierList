// components/PageHeader.js
import React from "react";

export default function PageHeader({ children }) {
  return (
    <header style={styles.wrapper}>
      {children}
    </header>
  );
}

const styles = {
  wrapper: {
    maxWidth: 1600,
    minWidth: 1600,       // fixed width to match container
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
