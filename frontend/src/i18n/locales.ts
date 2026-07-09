export type Locale = "en" | "uk";

export const LOCALES: {
  value: Locale;
  label: string;
  shortLabel: string;
}[] = [
  { value: "en", label: "English", shortLabel: "EN" },
  { value: "uk", label: "Українська", shortLabel: "UA" },
];
