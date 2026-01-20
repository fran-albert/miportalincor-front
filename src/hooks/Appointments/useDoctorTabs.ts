import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "shift-doctor-tabs";

export interface DoctorTab {
  doctorId: number;
  doctorName: string;
}

export interface UseDoctorTabsReturn {
  tabs: DoctorTab[];
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  addTab: (doctor: DoctorTab) => void;
  removeTab: (doctorId: number) => void;
  hasOpenTabs: boolean;
}

export const useDoctorTabs = (): UseDoctorTabsReturn => {
  const [tabs, setTabs] = useState<DoctorTab[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as DoctorTab[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTabs(parsed);
          setActiveTab(`doctor-${parsed[0].doctorId}`);
        }
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Save to localStorage when tabs change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
  }, [tabs]);

  const addTab = useCallback((doctor: DoctorTab) => {
    setTabs((prev) => {
      // Don't add if already exists
      if (prev.some((t) => t.doctorId === doctor.doctorId)) {
        setActiveTab(`doctor-${doctor.doctorId}`);
        return prev;
      }
      return [...prev, doctor];
    });
    setActiveTab(`doctor-${doctor.doctorId}`);
  }, []);

  const removeTab = useCallback(
    (doctorId: number) => {
      setTabs((prev) => {
        const newTabs = prev.filter((t) => t.doctorId !== doctorId);
        // If we closed the active tab, switch to first available
        if (activeTab === `doctor-${doctorId}` && newTabs.length > 0) {
          setActiveTab(`doctor-${newTabs[0].doctorId}`);
        } else if (newTabs.length === 0) {
          setActiveTab("");
        }
        return newTabs;
      });
    },
    [activeTab]
  );

  return {
    tabs,
    activeTab,
    setActiveTab,
    addTab,
    removeTab,
    hasOpenTabs: tabs.length > 0,
  };
};
