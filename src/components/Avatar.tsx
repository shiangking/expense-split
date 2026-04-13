type Props = { name: string; accent: string; size?: number };

export function Avatar({ name, accent, size = 36 }: Props) {
  const initial = name.trim()[0]?.toUpperCase() ?? "?";
  return (
    <div
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `${accent}33`,
        border: `1.5px solid ${accent}55`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: accent,
        fontWeight: 600,
        fontSize: size * 0.38,
        flexShrink: 0,
      }}
    >
      {initial}
    </div>
  );
}
