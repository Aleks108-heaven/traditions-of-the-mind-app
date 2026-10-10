interface CardProps {
  onClick?: () => void;
  children: React.ReactNode;
}

export function Card({ onClick, children }: CardProps) {
  return (
    <button type="button" className="ds-card" onClick={onClick}>
      {children}
    </button>
  );
}

export function CardRow({ children }: { children: React.ReactNode }) {
  return <div className="ds-card-row">{children}</div>;
}

export function CardName({ children }: { children: React.ReactNode }) {
  return <span className="ds-card-name">{children}</span>;
}

export function CardYears({ children }: { children: React.ReactNode }) {
  return <span className="ds-card-years">{children}</span>;
}

export function CardTagline({ children }: { children: React.ReactNode }) {
  return <div className="ds-card-tagline">{children}</div>;
}
