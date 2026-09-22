"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { MotionItem, MotionStagger } from "@/components/motion";
import { apiFetch, getSession } from "@/lib/api";
import { formatMoney, statusTone } from "@/lib/format";
import { useMemo } from "react";

type Summary = {
  counts: {
    accounts: number;
    contacts: number;
    leads: number;
    openDeals: number;
    wonDeals: number;
    activitiesOpen: number;
  };
  pipelineValue: string | number;
  recentLeads: { id: string; title: string; status: string }[];
  recentDeals: {
    id: string;
    title: string;
    amount?: string | number | null;
    currency: string;
    status: string;
    stage?: { name: string } | null;
  }[];
};

export default function DashboardPage() {
  const session = useMemo(() => getSession(), []);
  const summary = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () => apiFetch<Summary>("/dashboard/summary"),
  });

  const cards = [
    { label: "Accounts", value: summary.data?.counts.accounts ?? "—", href: "/accounts" },
    { label: "Contacts", value: summary.data?.counts.contacts ?? "—", href: "/contacts" },
    { label: "Leads", value: summary.data?.counts.leads ?? "—", href: "/leads" },
    { label: "Open deals", value: summary.data?.counts.openDeals ?? "—", href: "/deals" },
    {
      label: "Pipeline value",
      value: formatMoney(summary.data?.pipelineValue),
      href: "/deals",
    },
    {
      label: "Open activities",
      value: summary.data?.counts.activitiesOpen ?? "—",
      href: "/activities",
    },
  ];

  return (
    <AppShell>
      <PageHeader
        eyebrow="Overview"
        title="Command center"
        description={`Welcome back, ${session?.user.fullName ?? "operator"}. Live metrics for ${session?.tenant.name ?? "your workspace"}.`}
      />

      <MotionStagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <MotionItem key={card.label}>
            <Link href={card.href} className="surface-card block p-5">
              <p className="text-xs uppercase tracking-wider text-[var(--ink-muted)]">
                {card.label}
              </p>
              <p className="mt-3 text-2xl font-semibold">{card.value}</p>
            </Link>
          </MotionItem>
        ))}
      </MotionStagger>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <section className="surface-card p-5">
          <h2 className="font-semibold">Recent leads</h2>
          <div className="mt-4 space-y-3">
            {summary.data?.recentLeads?.length ? (
              summary.data.recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between gap-2"
                >
                  <p className="text-sm">{lead.title}</p>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${statusTone(lead.status)}`}
                  >
                    {lead.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--ink-muted)]">No leads yet.</p>
            )}
          </div>
        </section>

        <section className="surface-card p-5">
          <h2 className="font-semibold">Recent deals</h2>
          <div className="mt-4 space-y-3">
            {summary.data?.recentDeals?.length ? (
              summary.data.recentDeals.map((deal) => (
                <div
                  key={deal.id}
                  className="flex items-center justify-between gap-2"
                >
                  <div>
                    <p className="text-sm">{deal.title}</p>
                    <p className="text-xs text-[var(--ink-muted)]">
                      {deal.stage?.name ?? "—"} ·{" "}
                      {formatMoney(deal.amount, deal.currency)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${statusTone(deal.status)}`}
                  >
                    {deal.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--ink-muted)]">No deals yet.</p>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
