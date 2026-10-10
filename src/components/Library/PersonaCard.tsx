import { appData } from "../../lib/appData";
import { personaText, schoolLabel } from "../../lib/personas";
import { useAppState } from "../../state/AppStateContext";
import { Card, CardRow, CardName, CardYears, CardTagline } from "../ui/Card";
import { Tag } from "../ui/Tag";

interface PersonaCardProps {
  idx: number;
  onOpen: () => void;
}

export function PersonaCard({ idx, onOpen }: PersonaCardProps) {
  const { lang } = useAppState();
  const meta = appData.personaMeta[idx];
  const txt = personaText(lang, idx);
  return (
    <Card onClick={onOpen}>
      <CardRow>
        <CardName>{meta.n}</CardName>
        <CardYears>{meta.y}</CardYears>
      </CardRow>
      <CardTagline>{txt.tag}</CardTagline>
      <Tag>{schoolLabel(lang, meta.mode)}</Tag>
    </Card>
  );
}
