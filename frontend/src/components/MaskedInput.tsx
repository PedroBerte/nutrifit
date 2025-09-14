import { useRef } from "react";
import { getDigitsBeforeCaret, caretFromDigitsIndex } from "@/lib/caret";
import type { ChangeEvent, InputHTMLAttributes } from "react";
import { Input } from "./ui/input";

type MaskedInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
> & {
  value: string;
  onChange: (val: string) => void;
  formatter: (raw: string) => string;
};

export function MaskedInput({
  value,
  onChange,
  formatter,
  ...props
}: MaskedInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const before = getDigitsBeforeCaret(input.value, input.selectionStart ?? 0);
    const formatted = formatter(input.value);
    onChange(formatted);

    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (!el) return;
      const pos = caretFromDigitsIndex(formatted, before);
      el.setSelectionRange(pos, pos);
    });
  }

  return (
    <Input
      {...props}
      ref={(n) => {
        inputRef.current = n;
      }}
      value={value}
      onChange={handleChange}
      inputMode={props.inputMode ?? "numeric"}
      autoComplete={props.autoComplete ?? "off"}
    />
  );
}
