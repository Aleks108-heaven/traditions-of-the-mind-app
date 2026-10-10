import { t } from "../../lib/i18n";
import { Modal } from "../Modal";
import { RichText } from "../ui/RichText";
import { useAppState } from "../../state/AppStateContext";

interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

export function AboutModal({ open, onClose }: AboutModalProps) {
  const { lang } = useAppState();
  return (
    <Modal open={open} onClose={onClose} title={t(lang, "about_title")}>
      <p>
        <RichText text={t(lang, "about_p1")} />
      </p>
      <h3>{t(lang, "about_h_not")}</h3>
      <p>{t(lang, "about_p_not")}</p>
      <h3>{t(lang, "about_h_struggling")}</h3>
      <p>{t(lang, "about_p_struggling")}</p>
      <h3>{t(lang, "about_h_data")}</h3>
      <p>{t(lang, "about_p_data")}</p>
    </Modal>
  );
}
