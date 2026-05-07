"use client";

export const PASSWORD_RULES = [
  { label: "≥ 8", test: (p: string) => p.length >= 8 },
  { label: "A-Z", test: (p: string) => /[A-Z]/.test(p) },
  { label: "a-z", test: (p: string) => /[a-z]/.test(p) },
  { label: "0-9", test: (p: string) => /[0-9]/.test(p) },
  { label: "!@#", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
  const colors = ["bg-red-400", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-500"];
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
      <div className="flex flex-1 gap-1">
        {PASSWORD_RULES.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < passed ? colors[passed - 1] : "bg-gray-200 dark:bg-gray-700"
            }`}
          />
        ))}
      </div>
      <span className="text-[10px] text-gray-400 dark:text-gray-500">
        {PASSWORD_RULES.map((r) => (r.test(password) ? "✓" : "·") + " " + r.label).join("  ")}
      </span>
    </div>
  );
}

export function isPasswordValid(p: string): boolean {
  return PASSWORD_RULES.every((r) => r.test(p));
}
