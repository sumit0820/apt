import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { checkApiHealth, isMockMode } from "@/lib/api-client";
import { MOCK_SEED_USERS } from "@/lib/api/mock-store";

const STORAGE_KEY = "apt_mock_banner_open";

function readBannerOpen() {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(STORAGE_KEY) !== "false";
}

export function MockModeBanner() {
  const [open, setOpen] = useState(readBannerOpen);
  const [health, setHealth] = useState<{ ok: boolean; service: string } | null>(null);

  useEffect(() => {
    if (!isMockMode) return;
    checkApiHealth().then(setHealth);
  }, []);

  if (!isMockMode) return null;

  const { admin, demo } = MOCK_SEED_USERS;

  function toggle(next: boolean) {
    setOpen(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  }

  if (!open) {
    return (
      <div className="sticky top-0 z-[100] flex items-center justify-between gap-3 border-b border-primary/30 bg-primary/10 px-4 py-1.5 text-xs text-primary">
        <span className="font-semibold">Mock mode active</span>
        <button
          type="button"
          onClick={() => toggle(true)}
          className="inline-flex items-center gap-1 rounded-md border border-primary/40 px-2 py-0.5 font-medium hover:bg-primary/15"
        >
          Show details <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-[100] border-b border-primary/40 bg-primary/15 px-4 py-2 text-xs text-primary">
      <div className="flex items-start justify-between gap-3">
        <p className="text-center flex-1 sm:text-center">
          <strong>Mock mode</strong> — all API calls run locally without a backend.
          {health?.ok && <span className="ml-2 opacity-80">({health.service})</span>}
        </p>
        <button
          type="button"
          onClick={() => toggle(false)}
          className="shrink-0 inline-flex items-center gap-1 rounded-md border border-primary/40 px-2 py-0.5 font-medium hover:bg-primary/15"
        >
          Hide <ChevronUp className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 opacity-90">
        <span>
          <strong>User</strong> (Plan 1 · 3 mo): {demo.email} / {demo.password}
        </span>
        <span className="hidden sm:inline text-primary/50">|</span>
        <span>
          <strong>Admin</strong>: {admin.email} / {admin.password}
        </span>
      </div>
    </div>
  );
}
