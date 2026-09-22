"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { apiFetch } from "@/lib/api";

type Activity = {
  id: string;
  type: string;
  subject: string;
  body?: string | null;
  dueAt?: string | null;
  completedAt?: string | null;
  account?: { name: string } | null;
  deal?: { title: string } | null;
};

const TYPES = ["CALL", "EMAIL", "MEETING", "TASK", "NOTE"];

export default function ActivitiesPage() {
  const qc = useQueryClient();
  const [type, setType] = useState("TASK");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const activities = useQuery({
    queryKey: ["activities"],
    queryFn: () => apiFetch<Activity[]>("/activities"),
  });

  const create = useMutation({
    mutationFn: () =>
      apiFetch("/activities", {
        method: "POST",
        body: JSON.stringify({ type, subject, body: body || undefined }),
      }),
    onSuccess: async () => {
      setSubject("");
      setBody("");
      await qc.invalidateQueries({ queryKey: ["activities"] });
    },
  });

  const complete = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/activities/${id}/complete`, { method: "PATCH" }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["activities"] });
    },
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!subject.trim()) return;
    create.mutate();
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="CRM"
        title="Activities"
        description="Calls, emails, meetings, and tasks — tracked per tenant."
      />

      <form
        onSubmit={onSubmit}
        className="mt-6 grid gap-3 surface-card p-4 md:grid-cols-[140px_1fr_1fr_auto]"
      >
        <select
          className="input"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <input
          className="input"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <input
          className="input"
          placeholder="Notes"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <button className="btn-primary" disabled={create.isPending}>
          {create.isPending ? "Saving…" : "Add"}
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {activities.data?.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="flex flex-wrap items-center justify-between gap-3 surface-card px-4 py-3"
          >
            <div>
              <p className="font-semibold">
                <span className="mr-2 text-xs uppercase tracking-wide text-[var(--accent)]">
                  {a.type}
                </span>
                {a.subject}
              </p>
              <p className="text-sm text-[var(--ink-muted)]">
                {a.body || "—"} · {a.account?.name || a.deal?.title || "Unlinked"}
              </p>
            </div>
            {a.completedAt ? (
              <span className="text-xs font-medium text-[var(--accent)]">
                Done
              </span>
            ) : (
              <button
                className="rounded-full border border-[var(--stroke)] px-3 py-1.5 text-sm hover:bg-white"
                onClick={() => complete.mutate(a.id)}
              >
                Complete
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </AppShell>
  );
}
