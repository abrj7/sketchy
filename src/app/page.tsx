"use client";

import { useState, useEffect } from "react";
import { Home, Info, LayoutGrid, HandHeart, HelpCircle, Users } from "lucide-react";
import styles from "./page.module.css";
import Dashboard from "@/components/ui/Dashboard";
import CustomCanvas from "@/components/canvas/CustomCanvas";
import AuthPage from "@/components/auth/AuthPage";
import { getCurrentUser } from "@/lib/auth";

// View states: AUTH (login/signup) -> LANDING -> DASHBOARD -> CANVAS
type ViewState = "AUTH" | "LANDING" | "DASHBOARD" | "CANVAS";

interface CurrentProject {
  id: string;
  name: string;
}

export default function HomePage() {
  // Start with AUTH view - user must login/signup first
  const [view, setView] = useState<ViewState>("AUTH");
  const [currentProject, setCurrentProject] = useState<CurrentProject | null>(null);

  // Check for existing session on page load
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setView("LANDING"); // Skip auth if already logged in
    }
  }, []);

  // Handle logout - return to auth page
  const handleLogout = () => {
    setView("AUTH");
  };

  // Handle opening a project
  const handleOpenProject = (projectId: string, projectName: string) => {
    setCurrentProject({ id: projectId, name: projectName });
    setView("CANVAS");
  };

  // Auth page - login/signup
  if (view === "AUTH") {
    return <AuthPage onAuthSuccess={() => setView("LANDING")} />;
  }

  // Dashboard - project gallery
  if (view === "DASHBOARD") {
    return (
      <Dashboard
        onCreateNew={() => setView("CANVAS")}
        onHome={() => setView("LANDING")}
        onLogout={handleLogout}
        onOpenProject={handleOpenProject}
      />
    );
  }

  // Canvas - drawing area
  if (view === "CANVAS") {
    return (
      <CustomCanvas
        onBack={() => {
          setCurrentProject(null);
          setView("DASHBOARD");
        }}
        projectId={currentProject?.id}
        projectName={currentProject?.name}
      />
    );
  }

  // Landing page (shown after auth)
  return (
    <main className="mesh-background">
      <div className={styles.landingContainer}>

        <h1 className={styles.heroTitle}>
          Webber
        </h1>

        <p className={styles.subtitle}>The world is your canvas.</p>

        <button
          className={styles.startBtn}
          onClick={() => setView("DASHBOARD")}
        >
          Start Creating
        </button>

        <div style={{ marginTop: '2rem', fontSize: '0.9rem', opacity: 0.6, fontFamily: 'VT323, monospace' }}>
          Draw it. Build it. Ship it.
        </div>

        {/* Bottom Dock */}
        <div className={styles.dock}>
          <div className={styles.dockItem}>
            <Home size={20} />
          </div>
          <div className={styles.dockItem}>
            <Info size={20} />
          </div>
          <div className={styles.dockItem}>
            <LayoutGrid size={20} />
          </div>
          <div className={styles.dockItem}>
            <HandHeart size={20} />
          </div>
          <div className={styles.dockItem}>
            <HelpCircle size={20} />
          </div>
          <div className={styles.dockItem}>
            <Users size={20} />
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: '1rem', right: '2rem', fontSize: '0.8rem', opacity: 0.5 }}>
          MLH Code of Conduct
        </div>
      </div>
    </main>
  );
}
