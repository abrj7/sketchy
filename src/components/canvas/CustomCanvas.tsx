"use client";

import { useState, useCallback } from "react";
import styles from "./CustomCanvas.module.css";
import { Menu, ArrowLeft, Send, RotateCcw, Download, Eye, EyeOff } from "lucide-react";
import { Tldraw, Editor } from "tldraw";
import "tldraw/tldraw.css";
import ChatPanel from "./ChatPanel";

export default function CustomCanvas({ onBack }: { onBack: () => void }) {
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<'canvas' | 'split' | 'preview'>('split');
  const [generatedHtml, setGeneratedHtml] = useState("");
  const [editor, setEditor] = useState<Editor | null>(null);

  const handleMount = useCallback((editorInstance: Editor) => {
    setEditor(editorInstance);
  }, []);

  const handleGenerate = () => {
    if (!editor) return;

    // Export tldraw data for Gemini processing
    const snapshot = editor.getSnapshot();
    console.log("Canvas snapshot for generation:", snapshot);

    // TODO: Send to Gemini API
    // For now, set placeholder HTML
    setGeneratedHtml(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { margin: 0; font-family: system-ui; background: #f0f9ff; }
          .container { padding: 2rem; text-align: center; }
          h1 { color: #0c4a6e; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Generated Website Preview</h1>
          <p>Draw your wireframe above and click Generate to see results here.</p>
        </div>
      </body>
      </html>
    `);
  };

  const handleRegenerate = () => {
    console.log("Regenerate clicked");
    handleGenerate();
  };

  const handleExport = () => {
    if (!generatedHtml) {
      alert("No generated code to export yet!");
      return;
    }

    const blob = new Blob([generatedHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "generated-website.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.container}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.leftSection}>
          <button onClick={onBack} className={styles.iconBtn} title="Back to dashboard">
            <ArrowLeft size={20} />
          </button>
          <button className={styles.iconBtn} title="Menu">
            <Menu size={20} />
          </button>
        </div>

        <div className={styles.centerSection}>
          <div className={styles.viewTabs}>
            <button
              className={`${styles.tabBtn} ${viewMode === 'canvas' ? styles.activeTab : ''}`}
              onClick={() => setViewMode('canvas')}
            >
              Canvas
            </button>
            <button
              className={`${styles.tabBtn} ${viewMode === 'split' ? styles.activeTab : ''}`}
              onClick={() => setViewMode('split')}
            >
              Split View
            </button>
            <button
              className={`${styles.tabBtn} ${viewMode === 'preview' ? styles.activeTab : ''}`}
              onClick={() => setViewMode('preview')}
            >
              Preview
            </button>
          </div>
        </div>

        <div className={styles.rightSection}>
          <button className={styles.secondaryBtn} onClick={handleRegenerate} title="Regenerate">
            <RotateCcw size={16} />
            <span>Regenerate</span>
          </button>

          <button className={styles.secondaryBtn} onClick={handleExport} title="Export HTML">
            <Download size={16} />
            <span>Export</span>
          </button>

          <button className={styles.generateBtn} onClick={handleGenerate}>
            <Send size={16} />
            <span>Generate</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={styles.mainArea}>
        <div className={styles.splitContainer}>
          {/* tldraw Canvas */}
          {viewMode !== 'preview' && (
            <div className={`${styles.canvasSection} ${viewMode === 'canvas' ? styles.fullWidth : ''}`}>
              <Tldraw onMount={handleMount} />
            </div>
          )}

          {/* Preview Section */}
          {viewMode !== 'canvas' && (
            <div className={`${styles.previewSection} ${viewMode === 'preview' ? styles.fullWidth : ''}`}>
              <div className={styles.previewHeader}>
                <span>Live Preview</span>
              </div>
              <iframe
                srcDoc={generatedHtml || `
                  <html>
                  <body style="margin:0;padding:2rem;font-family:system-ui;color:#9ca3af;display:flex;align-items:center;justify-content:center;height:100vh;background:#f8fafc;text-align:center;">
                    <div>
                      <p style="font-size:1.25rem;margin:0 0 0.5rem;">Draw your wireframe</p>
                      <p style="font-size:0.875rem;margin:0;color:#d1d5db;">Click Generate to see the preview here</p>
                    </div>
                  </body>
                  </html>
                `}
                className={styles.previewIframe}
                title="Live Preview"
              />
            </div>
          )}
        </div>

        {/* Chat Panel */}
        <ChatPanel
          isCollapsed={isChatCollapsed}
          onToggle={() => setIsChatCollapsed(!isChatCollapsed)}
        />
      </div>
    </div>
  );
}
