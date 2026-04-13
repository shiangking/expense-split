import { THEMES, THEME_KEYS, type ThemeKey } from "../themes";

type Props = { current: ThemeKey; onChange: (key: ThemeKey) => void };

export function ThemePicker({ current, onChange }: Props) {
  return (
    <div
      role="group"
      aria-label="Trip theme"
      style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}
    >
      {THEME_KEYS.map((key) => {
        const t = THEMES[key];
        const selected = current === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            aria-pressed={selected}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 20,
              border: selected ? `2px solid ${t.accent}` : "1.5px solid var(--color-border-tertiary)",
              background: selected ? `${t.accent}18` : "var(--color-background-secondary)",
              color: selected ? t.accent : "var(--color-text-secondary)",
              fontWeight: selected ? 600 : 400,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            <span aria-hidden>{t.flag}</span>
            <span>{t.name}</span>
          </button>
        );
      })}
    </div>
  );
}
