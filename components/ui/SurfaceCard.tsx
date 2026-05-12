import type { CSSProperties, ReactNode } from 'react';

type SurfaceCardProps = {
  children: ReactNode;
  eyebrow?: string;
  title?: string;
  className?: string;
  style?: CSSProperties;
  contentStyle?: CSSProperties;
};

export function SurfaceCard({
  children,
  eyebrow,
  title,
  className,
  style,
  contentStyle,
}: SurfaceCardProps) {
  return (
    <div className={className ?? 'page-shell'} style={style}>
      {(eyebrow || title) && (
        <div style={{ marginBottom: 12 }}>
          {eyebrow && <p className="section-eyebrow">{eyebrow}</p>}
          {title && (
            <h2 className="section-heading" style={{ fontSize: '1.02rem', marginTop: eyebrow ? 4 : 0 }}>
              {title}
            </h2>
          )}
        </div>
      )}
      <div style={contentStyle}>{children}</div>
    </div>
  );
}
