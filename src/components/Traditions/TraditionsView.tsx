import { useMemo, type CSSProperties } from "react";
import { appData } from "../../lib/appData";
import { t } from "../../lib/i18n";
import { traditionText } from "../../lib/traditions";
import { useAppState } from "../../state/AppStateContext";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";

interface TraditionsViewProps {
  onAbout: () => void;
}

const contentStyle: CSSProperties = { maxWidth: "var(--content-max)", margin: "0 auto", width: "100%" };
const footnoteStyle: CSSProperties = { color: "var(--ink-muted)", fontSize: "var(--fs-sm)", margin: "var(--space-2) 0 0" };

function matches(lang: string, idx: number, q: string): boolean {
  if (!q) return true;
  const lower = q.toLowerCase();
  const txt = traditionText(lang, idx);
  return (
    appData.traditions[idx].n.toLowerCase().includes(lower) ||
    txt.tag.toLowerCase().includes(lower) ||
    txt.terms.join(" ").toLowerCase().includes(lower)
  );
}

export function TraditionsView({ onAbout }: TraditionsViewProps) {
  const { lang, search, setSearch } = useAppState();

  const visible = useMemo(() => {
    const q = search.trim();
    return appData.traditions.map((_, i) => i).filter((i) => matches(lang, i, q));
  }, [lang, search]);

  return (
    // The id is what the stylesheet's `#view-library` rule keys on to make `.library-scroll` the scroll container.
    <div className="view" id="view-library">
      <div className="library-head">
        <h1>{t(lang, "traditions_title")}</h1>
        <p className="lede">{t(lang, "traditions_intro")}</p>
        <div className="toolbar">
          <div className="search-box">
            <Icon name="search" />
            <input
              type="search"
              aria-label={t(lang, "search_placeholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t(lang, "search_placeholder")}
              autoComplete="off"
            />
          </div>
          <span className="count-pill" aria-live="polite">
            {visible.length} / {appData.traditions.length}
          </span>
        </div>
      </div>
      <div className="library-scroll">
        <div style={contentStyle}>
          {visible.length > 0 ? (
            <table className="master-table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">{t(lang, "th_name")}</th>
                  <th scope="col">{t(lang, "th_known_for")}</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((i) => (
                  <tr key={appData.traditions[i].num}>
                    <td className="num mono">{appData.traditions[i].num}</td>
                    <td>{appData.traditions[i].n}</td>
                    <td>{traditionText(lang, i).tag}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">{t(lang, "empty_state")}</div>
          )}
          <p style={footnoteStyle}>
            {t(lang, "disclaimer_line")}{" "}
            <Button variant="ghost" inline onClick={onAbout}>
              {t(lang, "disclaimer_full_link")}
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}
