// Small line icons for the admin menu and dashboard (24px grid, stroke follows text color).
const PATHS = {
  home: "M3 11 12 4l9 7M5 10v10h5v-6h4v6h5V10",
  profile: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0",
  sections: "M4 5h16v5H4zM4 14h7v5H4zM15 14h5v5h-5z",
  skills: "m12 3 2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z",
  projects: "M3 7h6l2 2h10v10H3zM3 7V5h6l2 2",
  certificates: "M12 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm-3 0-1 6 4-2 4 2-1-6",
  posts: "M5 4h10l4 4v12H5zM15 4v4h4M8 12h8M8 16h5",
  external: "M14 4h6v6M20 4l-9 9M18 14v6H4V6h6",
  logout: "M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10",
} as const;

export type AdminIconName = keyof typeof PATHS;

export function AdminIcon({ name, className = "size-5" }: { name: AdminIconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
