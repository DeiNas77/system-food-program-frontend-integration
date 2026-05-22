import type { ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  color?: keyof typeof colorVariants;
  description: string;
}

const colorVariants = {
  white: {
    border: "border-white/20",
    bg: "bg-white/10",
    hover: "hover:bg-white/20",
  },

  fuchsia: {
    border: "border-fuchsia-400/20",
    bg: "bg-fuchsia-500/10",
    hover: "hover:bg-fuchsia-500/20",
  },

  cyan: {
    border: "border-cyan-400/20",
    bg: "bg-cyan-500/10",
    hover: "hover:bg-cyan-500/20",
  },

  red: {
    border: "border-red-400/20",
    bg: "bg-red-500/10",
    hover: "hover:bg-red-500/20",
  },

  emerald: {
    border: "border-emerald-400/20",
    bg: "bg-emerald-500/10",
    hover: "hover:bg-emerald-500/20",
  },
  orange: {
    border: "border-orange-400/20",
    bg: "bg-orange-500/10",
    hover: "hover:bg-orange-500/20",
  },
};

export const ButtonAction = ({
  className = "",
  description,
  color = "white",
  ...props
}: ButtonProps) => {
  const variant = colorVariants[color];

  return (
    <button
      {...props}
      className={[
        "rounded-2xl",
        "border",
        "px-6 py-4",
        "text-sm font-semibold",
        "transition-all",
        "hover:scale-[1.02]",
        "active:scale-[0.98]",
        "cursor-pointer",

        variant.border,
        variant.bg,
        variant.hover,

        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {description}
    </button>
  );
};
