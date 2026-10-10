import { appData } from "../../lib/appData";
import { t } from "../../lib/i18n";
import { Modal } from "../Modal";
import { useAppState } from "../../state/AppStateContext";
import { ListTable } from "./LineageModal";

interface TraditionsModalProps {
  open: boolean;
  onClose: () => void;
  onOpenPersona: (idx: number) => void;
}

export function TraditionsModal({ open, onClose, onOpenPersona }: TraditionsModalProps) {
  const { lang } = useAppState();
  if (!appData.traditions) return null;
  return (
    <Modal open={open} onClose={onClose} title={t(lang, "traditions_title")} maxWidth={760}>
      <p>{t(lang, "traditions_intro")}</p>
      <ListTable rows={appData.traditions} lang={lang} onOpenPersona={onOpenPersona} />
    </Modal>
  );
}
