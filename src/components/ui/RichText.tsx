import { Fragment } from "react";

/**
 * Renders the small inline-markup subset used in the i18n strings (<b>/<strong>)
 * as React nodes, so no string is ever injected as raw HTML.
 */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(<(?:b|strong)>.*?<\/(?:b|strong)>)/gs);
  return (
    <>
      {parts.map((part, i) => {
        const m = /^<(b|strong)>(.*)<\/\1>$/s.exec(part);
        return m ? <strong key={i}>{m[2]}</strong> : <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}
