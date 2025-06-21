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
    maxWidth: "100%",
    margin: "0 auto",
    padding: "0 1rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
    height: 60,
    backgroundColor: "#121821",
    boxSizing: "border-box",
    flexWrap: "wrap",
  },
};
