import { useMemo } from "react";
import { appData } from "../../lib/appData";
import { t, fillUI } from "../../lib/i18n";
import { personaIdxByName, personaText, schoolLabel } from "../../lib/personas";
import { useAppState } from "../../state/AppStateContext";
import { PersonaCard } from "./PersonaCard";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { Select } from "../ui/Select";

interface LibraryViewProps {
  onLineage: () => void;
  onAbout: () => void;
}

function matches(lang: string, idx: number, q: string): boolean {
  if (!q) return true;
  const lower = q.toLowerCase();
  const meta = appData.personaMeta[idx];
  const txt = personaText(lang, idx);
  return (
    meta.n.toLowerCase().indexOf(lower) > -1 ||
    txt.tag.toLowerCase().indexOf(lower) > -1 ||
    schoolLabel(lang, meta.mode).toLowerCase().indexOf(lower) > -1 ||
    txt.terms.join(" ").toLowerCase().indexOf(lower) > -1
  );
}

export function LibraryView({ onLineage, onAbout }: LibraryViewProps) {
  const { lang, search, setSearch, school, setSchool, openPersona } = useAppState();

  const schoolOptions = useMemo(() => {
    const seen = new Set<string>();
    const order: string[] = [];
    appData.personaMeta.forEach((p) => {
      if (!seen.has(p.mode)) {
        seen.add(p.mode);
        order.push(p.mode);
      }
    });
    order.sort((a, b) => schoolLabel(lang, a).localeCompare(schoolLabel(lang, b)));
    return order;
  }, [lang]);

  const visibleIdx = useMemo(() => {
    const q = search.trim();
    return appData.personaMeta
      .map((_, i) => i)
      .filter((i) => (!school || appData.personaMeta[i].mode === school) && matches(lang, i, q));
  }, [lang, search, school]);

  const startIdx = personaIdxByName("Gautama Buddha");
  const startBtn = (
    <Button variant="ghost" inline onClick={() => openPersona(startIdx)}>
      {appData.personaMeta[startIdx]?.n}
    </Button>
  );
  const lineageBtn = (
    <Button variant="ghost" inline onClick={onLineage}>
      {t(lang, "nav_lineage")}
    </Button>
  );
  const bannerText = fillUI(t(lang, "lineage_banner_text"), { start: "__START__", lineage: "__LINEAGE__" });
  const bannerParts = bannerText.split(/(__START__|__LINEAGE__)/);

  return (
    <div className="view" id="view-library">
      <div className="library-head">
        <h1>{t(lang, "lib_h1")}</h1>
        <p className="lede">
          {t(lang, "lib_lede")}{" "}
          <Button variant="ghost" inline onClick={onAbout}>
            {t(lang, "lib_read_disclaimer")}
          </Button>
        </p>
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
          <Select className="school-filter" aria-label={t(lang, "filter_all_schools")} value={school} onChange={(e) => setSchool(e.target.value)}>
            <option value="">{t(lang, "filter_all_schools")}</option>
            {schoolOptions.map((m) => (
              <option key={m} value={m}>
                {schoolLabel(lang, m)}
              </option>
            ))}
          </Select>
          <span className="count-pill" aria-live="polite">
            {visibleIdx.length} / {appData.personaMeta.length}
          </span>
        </div>
      </div>
      <div className="library-scroll">
        <div className="lineage-banner">
          <span className="lineage-banner-icon"><Icon name="compass" /></span>
          <div className="txt">
            <b>{t(lang, "lineage_banner_new_here")}</b>{" "}
            {bannerParts.map((part, i) =>
              part === "__START__" ? (
                <span key={i}>{startBtn}</span>
              ) : part === "__LINEAGE__" ? (
                <span key={i}>{lineageBtn}</span>
              ) : (
                <span key={i}>{part}</span>
              )
            )}
          </div>
        </div>
        <div className="grid">
          {visibleIdx.map((i) => (
            <PersonaCard key={i} idx={i} onOpen={() => openPersona(i)} />
          ))}
        </div>
        {visibleIdx.length === 0 && <div className="empty-state">{t(lang, "empty_state")}</div>}
      </div>
    </div>
  );
}
