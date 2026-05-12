import type { CSSProperties } from 'react';

type StatusTagProps = {
  text: string;
  color: string;
  style?: CSSProperties;
};

export function StatusTag({ text, color, style }: StatusTagProps) {
  return (
    <span
      className="status-tag"
      style={{
        background: `${color}1A`,
        borderColor: `${color}4D`,
        color,
        ...style,
      }}
    >
      {text}
    </span>
  );
}
