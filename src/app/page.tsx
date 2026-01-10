"use client";

import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <h1>Flowboard</h1>
          <span className={styles.badge}>v0.1</span>
        </div>
        <div className={styles.controls}>
          <select className={styles.select}>
            <option>Landing Page</option>
            <option>Portfolio</option>
            <option>Dashboard</option>
          </select>
          <button className={styles.generateBtn}>
            Generate Site
          </button>
          <button className={styles.exportBtn}>
            Export ZIP
          </button>
        </div>
      </header>

      <div className={styles.canvasWrapper}>
        <Tldraw 
          inferDarkMode
          persistenceKey="flowboard-canvas"
        />
      </div>

      <footer className={styles.footer}>
        <p>Drawing is better than words. 🎨 + 🤖</p>
      </footer>
    </main>
  );
}
