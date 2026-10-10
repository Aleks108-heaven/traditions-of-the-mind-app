import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "md" | "sm";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Sits inside running text: drops the touch-target minimum (WCAG 2.5.8 inline exception). */
  inline?: boolean;
}

export function Button({ variant = "secondary", size = "md", inline, className, type = "button", ...rest }: ButtonProps) {
  const classes = [
    "ds-button",
    `ds-button-${variant}`,
    size === "sm" && "ds-button-sm",
    inline && "ds-button-inline",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return <button type={type} className={classes} {...rest} />;
}
