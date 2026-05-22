import type { InputHTMLAttributes } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  description?: string;
  error?: string;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
}

export const Field = ({
  description,
  error,
  containerClassName = "",
  labelClassName = "",
  inputClassName = "",
  ...inputProps
}: FieldProps) => {
  return (
    <div
      className={`
        relative flex flex-col gap-2
        ${containerClassName}
      `}
    >
      {description && (
        <label
          className={`
             pl-3 text-sm font-medium tracking-wide
            text-zinc-300
            ${labelClassName}
          `}
        >
          {description}
        </label>
      )}

      <div className="relative group">
        {/* Glow */}
        <div
          className="
            absolute -inset-[px]
            rounded-2xl
            blur-md
            opacity-0
            transition-opacity
            duration-300
            group-focus-within:opacity-100
          "
        />

        <input
          {...inputProps}
          className={`
            relative 
            z-10 
            w-full
            rounded-md
            border border-white/10

            bg-white/5
            backdrop-blur-xl

            px-4 py-3

            text-sm text-white
            placeholder:text-zinc-500

            outline-none

            transition-all
            duration-300

            focus:border-cyan-400/40
            focus:bg-white/10
            focus:shadow-[0_0_30px_rgba(34,211,238,0.15)]

            disabled:cursor-not-allowed
            disabled:opacity-50

            ${inputClassName}
          `}
        />
      </div>

      {error && <span className="text-sm text-red-400">{error}</span>}
    </div>
  );
};
