"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./NamePromptModal.module.css";

interface NamePromptModalProps {
    isOpen: boolean;
    currentName: string;
    onSave: (name: string) => void;
    onCancel: () => void;
}

export default function NamePromptModal({
    isOpen,
    currentName,
    onSave,
    onCancel,
}: NamePromptModalProps) {
    const [name, setName] = useState(currentName);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setName(currentName);
            // Focus input when modal opens
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, currentName]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(name.trim() || currentName);
    };

    const handleSkip = () => {
        onSave(currentName); // Keep current name
    };

    if (!isOpen) return null;

    const isUntitled = currentName.startsWith("Untitled document");

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h2 className={styles.title}>
                    {isUntitled ? "Name your project" : "Rename project"}
                </h2>
                <p className={styles.subtitle}>
                    {isUntitled
                        ? "Give your project a name before leaving"
                        : "Update your project name"}
                </p>

                <form onSubmit={handleSubmit}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter project name"
                        className={styles.input}
                    />

                    <div className={styles.buttons}>
                        {isUntitled && (
                            <button
                                type="button"
                                className={styles.skipButton}
                                onClick={handleSkip}
                            >
                                Keep as Untitled
                            </button>
                        )}
                        <button
                            type="button"
                            className={styles.cancelButton}
                            onClick={onCancel}
                        >
                            Cancel
                        </button>
                        <button type="submit" className={styles.saveButton}>
                            Save & Exit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
