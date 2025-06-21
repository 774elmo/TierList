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
    maxWidth: 1150,
    margin: "0 auto",
    padding: "0 2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
    height: 60,  // fixed height for consistent header size
    backgroundColor: "#121821", // or your header bg color
    boxSizing: "border-box",
  },
};