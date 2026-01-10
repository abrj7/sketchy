"use client";

import { useState } from "react";
import { X, ChevronRight } from "lucide-react";
import styles from "./ChatPanel.module.css";

interface ChatPanelProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

export default function ChatPanel({ isCollapsed, onToggle }: ChatPanelProps) {
    const [prompt, setPrompt] = useState("");

    const suggestions = [
        "Make it performative",
        "Change the color to blue",
        "Add more details",
        "Rotate the model 90 degrees",
        "Make it smaller",
        "Add lighting effects"
    ];

    const history = [
        { id: 1, text: "Create a Lego Donkey Kong Labubu", timestamp: "7:11:09 PM" }
    ];

    return (
        <aside className={`${styles.panel} ${isCollapsed ? styles.collapsed : ''}`}>
            {isCollapsed ? (
                <button className={styles.expandBtn} onClick={onToggle} title="Expand chat">
                    <ChevronRight size={20} />
                </button>
            ) : (
                <>
                    <div className={styles.header}>
                        <h2 className={styles.title}>Chat</h2>
                        <button className={styles.closeBtn} onClick={onToggle} title="Collapse">
                            <X size={18} />
                        </button>
                    </div>

                    <div className={styles.content}>
                        {/* Prompt Area */}
                        <div className={styles.promptSection}>
                            <textarea
                                className={styles.textarea}
                                placeholder="Describe changes..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={4}
                            />
                            <button className={styles.applyBtn}>
                                Apply Changes
                            </button>
                        </div>

                        {/* Suggestions */}
                        <div className={styles.suggestions}>
                            {suggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    className={styles.chip}
                                    onClick={() => setPrompt(suggestion)}
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>

                        {/* History */}
                        <div className={styles.historySection}>
                            <h3 className={styles.historyTitle}>History</h3>
                            {history.map((item) => (
                                <div key={item.id} className={styles.historyItem}>
                                    <p className={styles.historyText}>{item.text}</p>
                                    <span className={styles.timestamp}>create • {item.timestamp}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </aside>
    );
}
