import { useEffect, useState } from "react";
import { TopBar } from "./components/TopBar";
import { LibraryView } from "./components/Library/LibraryView";
import { ChatView } from "./components/Chat/ChatView";
import { AboutModal } from "./components/Modals/AboutModal";
import { TermsModal } from "./components/Modals/TermsModal";
import { LineageModal } from "./components/Modals/LineageModal";
import { TraditionsModal } from "./components/Modals/TraditionsModal";
import { SettingsModal } from "./components/Settings/SettingsModal";
import { useAppState } from "./state/AppStateContext";

type OpenModal = "about" | "lineage" | "terms" | "traditions" | "settings" | null;

export function App() {
  const { view, openPersona } = useAppState();
  const [openModal, setOpenModal] = useState<OpenModal>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenModal(null);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function handleOpenPersonaFromModal(idx: number) {
    if (idx < 0) return;
    setOpenModal(null);
    openPersona(idx);
  }

  return (
    <div id="app">
      <TopBar
        onLineage={() => setOpenModal("lineage")}
        onTerms={() => setOpenModal("terms")}
        onTraditions={() => setOpenModal("traditions")}
        onAbout={() => setOpenModal("about")}
        onSettings={() => setOpenModal("settings")}
      />

      {view === "library" ? <LibraryView onLineage={() => setOpenModal("lineage")} onAbout={() => setOpenModal("about")} /> : <ChatView onAbout={() => setOpenModal("about")} />}

      <AboutModal open={openModal === "about"} onClose={() => setOpenModal(null)} />
      <LineageModal open={openModal === "lineage"} onClose={() => setOpenModal(null)} onOpenPersona={handleOpenPersonaFromModal} />
      <TermsModal open={openModal === "terms"} onClose={() => setOpenModal(null)} />
      <TraditionsModal open={openModal === "traditions"} onClose={() => setOpenModal(null)} onOpenPersona={handleOpenPersonaFromModal} />
      <SettingsModal open={openModal === "settings"} onClose={() => setOpenModal(null)} />
    </div>
  );
}
