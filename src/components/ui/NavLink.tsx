interface NavLinkProps {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}

export function NavLink({ onClick, active, children }: NavLinkProps) {
  return (
    <button type="button" className={`navlink${active ? " active" : ""}`} onClick={onClick}>
      {children}
    </button>
  );
}
