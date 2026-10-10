import { appData } from "../../lib/appData";
import { t } from "../../lib/i18n";
import { personaText } from "../../lib/personas";
import { Modal } from "../Modal";
import { useAppState } from "../../state/AppStateContext";
import type { ChainItem, ListRow } from "../../types";

interface LineageModalProps {
  open: boolean;
  onClose: () => void;
  onOpenPersona: (idx: number) => void;
}

function ChainList({ chain, notes, onOpenPersona }: { chain: ChainItem[]; notes?: string[]; onOpenPersona: (idx: number) => void }) {
  return (
    <div className="chain-line">
      {chain.map((c, i) => (
        <div className="chain-item" key={i}>
          <div className="cname">
            <button onClick={() => onOpenPersona(c.personaIdx)}>{appData.personaMeta[c.personaIdx].n}</button>
          </div>
          <div className="cnote">{(notes && notes[i]) || ""}</div>
        </div>
      ))}
    </div>
  );
}

function ListTable({ rows, lang, onOpenPersona }: { rows: ListRow[]; lang: string; onOpenPersona: (idx: number) => void }) {
  return (
    <div className="master-scroll">
      <table className="master-table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">{t(lang, "th_name")}</th>
            <th scope="col">{t(lang, "th_known_for")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const idx = row.personaIdx;
            const name = idx > -1 ? appData.personaMeta[idx].n : "";
            const tag = idx > -1 ? personaText(lang, idx).tag : "";
            return (
              <tr key={row.num}>
                <td className="num mono">{row.num}</td>
                <td>
                  <button className="linklike" onClick={() => onOpenPersona(idx)}>
                    {name}
                  </button>
                </td>
                <td>{tag}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function LineageModal({ open, onClose, onOpenPersona }: LineageModalProps) {
  const { lang } = useAppState();
  const l = appData.languages[lang] || appData.languages.en;
  const en = appData.languages.en;

  return (
    <Modal open={open} onClose={onClose} title={t(lang, "lineage_title")} maxWidth={760}>
      <p>{t(lang, "lineage_intro")}</p>
      <ChainList chain={appData.chainA} notes={l.chainANotes || en.chainANotes} onOpenPersona={onOpenPersona} />
    </Modal>
  );
}

export { ListTable };
