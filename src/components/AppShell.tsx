import Link from "next/link";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/course-mapping", label: "Course Mapping" },
  { href: "/builder", label: "Timetable Builder" },
  { href: "/teachers", label: "Teacher View" },
  { href: "/conflicts", label: "Conflict Checker" },
  { href: "/export", label: "Export" },
  { href: "/settings", label: "Settings" },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 min-h-screen bg-white text-zinc-900">
      <aside className="w-[260px] shrink-0 border-r border-zinc-200 bg-white">
        <div className="px-4 py-4 border-b border-zinc-200">
          <div className="text-sm font-semibold tracking-tight">
            Timetable Admin
          </div>
          <div className="text-xs text-zinc-500">Vercel-friendly MVP</div>
        </div>
        <nav className="p-2">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="h-14 border-b border-zinc-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80">
          <div className="h-full px-6 flex items-center justify-between">
            <div className="text-sm text-zinc-700">School Year: 2025–2026</div>
            <div className="text-xs text-zinc-500">Local-only MVP</div>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

