import { useEffect, useState } from "react";
import { TopBar } from "./components/TopBar";
import { TraditionsView } from "./components/Traditions/TraditionsView";
import { AboutModal } from "./components/Modals/AboutModal";
import { SettingsModal } from "./components/Settings/SettingsModal";

type OpenModal = "about" | "settings" | null;

export function App() {
  const [openModal, setOpenModal] = useState<OpenModal>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenModal(null);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div id="app">
      <TopBar onAbout={() => setOpenModal("about")} onSettings={() => setOpenModal("settings")} />

      <TraditionsView onAbout={() => setOpenModal("about")} />

      <AboutModal open={openModal === "about"} onClose={() => setOpenModal(null)} />
      <SettingsModal open={openModal === "settings"} onClose={() => setOpenModal(null)} />
    </div>
  );
}
