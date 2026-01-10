import { create } from "zustand";

interface AppState {
  isGenerating: boolean;
  activeWebsite: {
    html: string;
    css: string;
    js: string;
    id?: string;
  } | null;
  websiteType: string;
  setGenerating: (val: boolean) => void;
  setActiveWebsite: (site: AppState["activeWebsite"]) => void;
  setWebsiteType: (type: string) => void;
}

export const useStore = create<AppState>((set) => ({
  isGenerating: false,
  activeWebsite: null,
  websiteType: "Landing Page",
  setGenerating: (val) => set({ isGenerating: val }),
  setActiveWebsite: (site) => set({ activeWebsite: site }),
  setWebsiteType: (type) => set({ websiteType: type }),
}));
