export type ThemeKey = keyof typeof THEMES;

export type Theme = {
  name: string;
  flag: string;
  currency: string;
  symbol: string;
  label: string;
  subtitle: string;
  accent: string;
  accent2: string;
  bg: string;
  cardBg: string;
  border: string;
  font: string;
  categories: string[];
  gradient: string;
  pattern: string;
};

export const THEMES = {
  japan: {
    name: "Japan",
    flag: "🇯🇵",
    currency: "JPY",
    symbol: "¥",
    label: "旅費割り勘",
    subtitle: "Tabi Wari",
    accent: "#c0395a",
    accent2: "#e8a0b0",
    bg: "#fff5f7",
    cardBg: "#fff",
    border: "#f0c0cc",
    font: "Georgia, serif",
    categories: ["🍜 Ramen", "🚄 Shinkansen", "🏨 Ryokan", "⛩ Temple", "🛍 Souvenir", "🌸 Other"],
    gradient: "linear-gradient(135deg, #fff5f7 0%, #ffe0e8 100%)",
    pattern: "⛩",
  },
  italy: {
    name: "Italy",
    flag: "🇮🇹",
    currency: "EUR",
    symbol: "€",
    label: "Divisione Spese",
    subtitle: "La Dolce Vita",
    accent: "#1a7a3c",
    accent2: "#e8c040",
    bg: "#f5fbf7",
    cardBg: "#fff",
    border: "#b8dfc8",
    font: "Georgia, serif",
    categories: ["🍕 Pizza", "🚂 Trenitalia", "🏨 Hotel", "🏛 Museum", "🍷 Wine", "🌿 Other"],
    gradient: "linear-gradient(135deg, #f5fbf7 0%, #e0f5e8 100%)",
    pattern: "🏛",
  },
  mexico: {
    name: "Mexico",
    flag: "🇲🇽",
    currency: "MXN",
    symbol: "$",
    label: "División de Gastos",
    subtitle: "Viva México",
    accent: "#c0392b",
    accent2: "#f39c12",
    bg: "#fffbf0",
    cardBg: "#fff",
    border: "#f5d9a0",
    font: "Georgia, serif",
    categories: ["🌮 Tacos", "🚌 Bus", "🏨 Hostel", "🎭 Cultura", "🛺 Mercado", "🌵 Other"],
    gradient: "linear-gradient(135deg, #fffbf0 0%, #fef0c0 100%)",
    pattern: "🌮",
  },
  france: {
    name: "France",
    flag: "🇫🇷",
    currency: "EUR",
    symbol: "€",
    label: "Partage des Dépenses",
    subtitle: "Joie de Vivre",
    accent: "#1a3a7a",
    accent2: "#c0392b",
    bg: "#f5f7ff",
    cardBg: "#fff",
    border: "#c0c8f0",
    font: "Georgia, serif",
    categories: ["🥐 Croissant", "🚇 Métro", "🏨 Hotel", "🏰 Château", "🍷 Vin", "🗼 Other"],
    gradient: "linear-gradient(135deg, #f5f7ff 0%, #e0e5ff 100%)",
    pattern: "🗼",
  },
  thailand: {
    name: "Thailand",
    flag: "🇹🇭",
    currency: "THB",
    symbol: "฿",
    label: "แบ่งค่าใช้จ่าย",
    subtitle: "Land of Smiles",
    accent: "#8b1a6b",
    accent2: "#f5a623",
    bg: "#fdf5ff",
    cardBg: "#fff",
    border: "#e0b8d8",
    font: "Georgia, serif",
    categories: ["🍛 Street Food", "🛺 Tuk-tuk", "🏨 Resort", "🏯 Temple", "💆 Massage", "🌴 Other"],
    gradient: "linear-gradient(135deg, #fdf5ff 0%, #f5e0ff 100%)",
    pattern: "🏯",
  },
  usa: {
    name: "USA",
    flag: "🇺🇸",
    currency: "USD",
    symbol: "$",
    label: "Split the Bill",
    subtitle: "Road Trip",
    accent: "#1a3a7a",
    accent2: "#c0392b",
    bg: "#f5f7ff",
    cardBg: "#fff",
    border: "#b8c8f0",
    font: "system-ui, sans-serif",
    categories: ["🍔 Food", "✈️ Flight", "🏨 Hotel", "🎢 Activity", "⛽ Gas", "🗽 Other"],
    gradient: "linear-gradient(135deg, #f5f7ff 0%, #e0e5ff 100%)",
    pattern: "🗽",
  },
} as const satisfies Record<string, Theme>;

export const THEME_KEYS = Object.keys(THEMES) as ThemeKey[];
