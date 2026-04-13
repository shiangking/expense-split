import { THEMES, THEME_KEYS, type ThemeKey } from "../themes";

type Props = { current: ThemeKey; onChange: (key: ThemeKey) => void; accent: string };

export function ThemePicker({ current, onChange, accent }: Props) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 168, flexShrink: 0 }}>
      <span
        style={{
          fontSize: 11,
          color: "var(--color-text-tertiary)",
          letterSpacing: 1,
          textTransform: "uppercase",
          fontWeight: 500,
        }}
      >
        Trip theme
      </span>
      <select
        value={current}
        onChange={(e) => onChange(e.target.value as ThemeKey)}
        aria-label="Trip theme"
        style={{
          padding: "8px 10px",
          borderRadius: 8,
          border: `0.5px solid ${accent}45`,
          fontSize: 14,
          background: "var(--color-background-primary)",
          color: "var(--color-text-primary)",
          cursor: "pointer",
        }}
      >
        {THEME_KEYS.map((key) => {
          const t = THEMES[key];
          return (
            <option key={key} value={key}>
              {t.flag} {t.name}
            </option>
          );
        })}
      </select>
    </label>
  );
}
