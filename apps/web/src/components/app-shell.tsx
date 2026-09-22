"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch, getSession, setSession } from "@/lib/api";
import { easeOutExpo } from "@/lib/motion";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/dashboard", label: "Overview" },
  { href: "/accounts", label: "Accounts" },
  { href: "/contacts", label: "Contacts" },
  { href: "/leads", label: "Leads" },
  { href: "/deals", label: "Pipeline" },
  { href: "/activities", label: "Activities" },
];

type SearchResult = {
  accounts: { id: string; name: string }[];
  contacts: { id: string; firstName: string; lastName: string }[];
  leads: { id: string; title: string }[];
  deals: { id: string; title: string }[];
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [tenantName, setTenantName] = useState("BACE");
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    setTenantName(session.tenant.name);
    setReady(true);
  }, [router]);

  useEffect(() => {
    if (!q.trim()) {
      setResults(null);
      return;
    }
    const handle = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await apiFetch<SearchResult>(
          `/search?q=${encodeURIComponent(q.trim())}`,
        );
        setResults(data);
      } catch {
        setResults(null);
      } finally {
        setSearching(false);
      }
    }, 280);
    return () => clearTimeout(handle);
  }, [q]);

  if (!ready) {
    return (
      <div className="min-h-screen grid place-items-center">
        <motion.div
          className="brand-mark brand-gradient text-3xl"
          animate={{ opacity: [0.4, 1, 0.4], scale: [0.98, 1.02, 0.98] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        >
          BACE
        </motion.div>
      </div>
    );
  }

  const hasHits =
    results &&
    (results.accounts.length ||
      results.contacts.length ||
      results.leads.length ||
      results.deals.length);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 mesh-grid opacity-80" />
      <div className="gold-orb pointer-events-none absolute -left-20 top-0 h-72 w-72 bg-[rgba(245,197,24,0.22)]" />
      <div className="gold-orb pointer-events-none absolute -right-24 bottom-10 h-80 w-80 bg-[rgba(255,229,102,0.2)]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1400px] gap-6 p-4 md:p-6">
        <motion.aside
          initial={{ x: -28, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.55, ease: easeOutExpo }}
          className="glass hidden w-64 shrink-0 flex-col p-5 md:flex"
        >
          <div className="relative z-10 mb-8">
            <p className="brand-mark brand-gradient text-3xl tracking-tight">
              BACE
            </p>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">
              TDB Solution CRM
            </p>
            <p className="badge-gold mt-4">{tenantName}</p>
          </div>
          <nav className="relative z-10 flex flex-1 flex-col gap-1">
            {NAV.map((item, i) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.35 }}
              >
                <Link
                  href={item.href}
                  className="nav-link"
                  data-active={pathname.startsWith(item.href)}
                >
                  <span>{item.label}</span>
                </Link>
              </motion.div>
            ))}
          </nav>
          <button
            className="relative z-10 mt-4 text-left text-sm text-[var(--ink-muted)] transition hover:text-[var(--ink)]"
            onClick={() => {
              setSession(null);
              router.push("/login");
            }}
          >
            Sign out
          </button>
        </motion.aside>

        <motion.main
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.55, delay: 0.06, ease: easeOutExpo }}
          className="glass relative min-w-0 flex-1 p-5 md:p-8"
        >
          <div className="relative z-10 mb-6">
            <input
              className="input"
              placeholder="Search accounts, contacts, leads, deals…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <AnimatePresence>
              {q.trim() ? (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                  className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 rounded-[16px] border border-[var(--stroke)] bg-[#fffdf7]/96 p-3 shadow-[0_20px_50px_rgba(212,160,23,0.2)] backdrop-blur"
                >
                  {searching ? (
                    <p className="px-2 py-1 text-sm text-[var(--ink-muted)]">
                      Searching…
                    </p>
                  ) : !hasHits ? (
                    <p className="px-2 py-1 text-sm text-[var(--ink-muted)]">
                      No matches
                    </p>
                  ) : (
                    <div className="max-h-72 space-y-2 overflow-auto text-sm">
                      {results!.accounts.map((a) => (
                        <Link
                          key={a.id}
                          href="/accounts"
                          className="block rounded-lg px-2 py-1.5 transition hover:bg-[rgba(245,197,24,0.14)]"
                          onClick={() => setQ("")}
                        >
                          <span className="text-xs text-[var(--ink-muted)]">
                            Account
                          </span>
                          <p className="font-medium">{a.name}</p>
                        </Link>
                      ))}
                      {results!.contacts.map((c) => (
                        <Link
                          key={c.id}
                          href="/contacts"
                          className="block rounded-lg px-2 py-1.5 transition hover:bg-[rgba(245,197,24,0.14)]"
                          onClick={() => setQ("")}
                        >
                          <span className="text-xs text-[var(--ink-muted)]">
                            Contact
                          </span>
                          <p className="font-medium">
                            {c.firstName} {c.lastName}
                          </p>
                        </Link>
                      ))}
                      {results!.leads.map((l) => (
                        <Link
                          key={l.id}
                          href="/leads"
                          className="block rounded-lg px-2 py-1.5 transition hover:bg-[rgba(245,197,24,0.14)]"
                          onClick={() => setQ("")}
                        >
                          <span className="text-xs text-[var(--ink-muted)]">
                            Lead
                          </span>
                          <p className="font-medium">{l.title}</p>
                        </Link>
                      ))}
                      {results!.deals.map((d) => (
                        <Link
                          key={d.id}
                          href="/deals"
                          className="block rounded-lg px-2 py-1.5 transition hover:bg-[rgba(245,197,24,0.14)]"
                          onClick={() => setQ("")}
                        >
                          <span className="text-xs text-[var(--ink-muted)]">
                            Deal
                          </span>
                          <p className="font-medium">{d.title}</p>
                        </Link>
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(2px)" }}
              transition={{ duration: 0.35, ease: easeOutExpo }}
              className="relative z-10"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </motion.main>
      </div>
    </div>
  );
}
