import React, { createContext, useContext, useState, useEffect } from "react";

const ScannerContext = createContext();

const STORAGE_KEY = "healu_last_prescription_scan";

export function ScannerProvider({ children }) {
  const [scanState, setScanState] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore storage errors
    }
    return {
      fileName: "",
      fileType: "image/jpeg",
      previewUrl: null,
      resultData: null,
      saveSuccess: false
    };
  });

  // Persist scan state across navigation and refreshes
  useEffect(() => {
    try {
      const toStore = {
        fileName: scanState.fileName || "",
        fileType: scanState.fileType || "image/jpeg",
        // Store preview DataURL only if reasonably sized (< 1.5MB) to respect sessionStorage quota
        previewUrl:
          scanState.previewUrl && scanState.previewUrl.length < 1_500_000
            ? scanState.previewUrl
            : null,
        resultData: scanState.resultData || null,
        saveSuccess: !!scanState.saveSuccess
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch {
      // Fallback: save without previewUrl if quota exceeded
      try {
        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            fileName: scanState.fileName || "",
            fileType: scanState.fileType || "image/jpeg",
            previewUrl: null,
            resultData: scanState.resultData || null,
            saveSuccess: !!scanState.saveSuccess
          })
        );
      } catch {
        // Ignore if storage completely unavailable
      }
    }
  }, [scanState]);

  const setSelectedScanFile = ({ fileName, fileType, previewUrl }) => {
    setScanState({
      fileName,
      fileType: fileType || "image/jpeg",
      previewUrl,
      resultData: null,
      saveSuccess: false
    });
  };

  const setScanResult = (resultData) => {
    setScanState((prev) => ({
      ...prev,
      resultData,
      saveSuccess: false
    }));
  };

  const markScanSaved = (saved = true) => {
    setScanState((prev) => ({
      ...prev,
      saveSuccess: saved
    }));
  };

  const clearScan = () => {
    setScanState({
      fileName: "",
      fileType: "image/jpeg",
      previewUrl: null,
      resultData: null,
      saveSuccess: false
    });
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  return (
    <ScannerContext.Provider
      value={{
        ...scanState,
        setSelectedScanFile,
        setScanResult,
        markScanSaved,
        clearScan
      }}
    >
      {children}
    </ScannerContext.Provider>
  );
}

export function useScanner() {
  const ctx = useContext(ScannerContext);
  if (!ctx) {
    throw new Error("useScanner must be used within a ScannerProvider");
  }
  return ctx;
}
