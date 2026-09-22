"use client";

import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { apiFetch } from "@/lib/api";
import { statusTone } from "@/lib/format";

type Lead = {
  id: string;
  title: string;
  status: string;
  source?: string | null;
  account?: { id: string; name: string } | null;
  contact?: { id: string; firstName: string; lastName: string } | null;
};

const STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "UNQUALIFIED", "CONVERTED"];

export default function LeadsPage() {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [q, setQ] = useState("");

  const queryPath = useMemo(() => {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (q.trim()) params.set("q", q.trim());
    const qs = params.toString();
    return qs ? `/leads?${qs}` : "/leads";
  }, [statusFilter, q]);

  const leads = useQuery({
    queryKey: ["leads", statusFilter, q],
    queryFn: () => apiFetch<Lead[]>(queryPath),
  });

  const create = useMutation({
    mutationFn: () =>
      apiFetch<Lead>("/leads", {
        method: "POST",
        body: JSON.stringify({
          title,
          source: source || undefined,
        }),
      }),
    onSuccess: async () => {
      setTitle("");
      setSource("");
      await qc.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiFetch(`/leads/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    create.mutate();
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="CRM"
        title="Leads"
        description="Capture and qualify inbound opportunities before they enter the pipeline."
      />

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          className="input max-w-xs"
          placeholder="Search leads…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="input max-w-[180px]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <form
        onSubmit={onSubmit}
        className="mt-4 grid gap-3 surface-card p-4 md:grid-cols-[1fr_1fr_auto]"
      >
        <input
          className="input"
          placeholder="Lead title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="input"
          placeholder="Source (web, referral…)"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />
        <button className="btn-primary" disabled={create.isPending}>
          {create.isPending ? "Saving…" : "Add lead"}
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {leads.isLoading ? (
          <p className="text-[var(--ink-muted)]">Loading leads…</p>
        ) : null}
        {leads.data?.length === 0 ? (
          <p className="text-[var(--ink-muted)]">No leads yet.</p>
        ) : null}
        {leads.data?.map((lead, i) => (
          <motion.div
            key={lead.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="flex flex-wrap items-center justify-between gap-3 surface-card px-4 py-3"
          >
            <div>
              <p className="font-semibold">{lead.title}</p>
              <p className="text-sm text-[var(--ink-muted)]">
                {lead.source || "No source"} ·{" "}
                {lead.account?.name || "No account"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${statusTone(lead.status)}`}
              >
                {lead.status}
              </span>
              <select
                className="input max-w-[150px] py-2 text-sm"
                value={lead.status}
                onChange={(e) =>
                  updateStatus.mutate({ id: lead.id, status: e.target.value })
                }
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>
        ))}
      </div>
    </AppShell>
  );
}
