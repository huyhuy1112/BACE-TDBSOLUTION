"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { apiFetch } from "@/lib/api";

type Account = {
  id: string;
  name: string;
  website?: string | null;
  industry?: string | null;
  phone?: string | null;
};

export default function AccountsPage() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");

  const accounts = useQuery({
    queryKey: ["accounts"],
    queryFn: () => apiFetch<Account[]>("/accounts"),
  });

  const create = useMutation({
    mutationFn: () =>
      apiFetch<Account>("/accounts", {
        method: "POST",
        body: JSON.stringify({ name, industry: industry || undefined }),
      }),
    onSuccess: async () => {
      setName("");
      setIndustry("");
      await qc.invalidateQueries({ queryKey: ["accounts"] });
    },
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    create.mutate();
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="CRM"
        title="Accounts"
        description="Companies and organizations in your tenant workspace."
      />

      <form
        onSubmit={onSubmit}
        className="mt-8 grid gap-3 surface-card p-4 md:grid-cols-[1fr_1fr_auto]"
      >
        <input
          className="input"
          placeholder="Account name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="input"
          placeholder="Industry"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
        />
        <button className="btn-primary" disabled={create.isPending}>
          {create.isPending ? "Saving…" : "Add account"}
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {accounts.isLoading ? (
          <p className="text-[var(--ink-muted)]">Loading accounts…</p>
        ) : null}
        {accounts.data?.length === 0 ? (
          <p className="text-[var(--ink-muted)]">No accounts yet.</p>
        ) : null}
        {accounts.data?.map((account, i) => (
          <motion.div
            key={account.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center justify-between surface-card px-4 py-3"
          >
            <div>
              <p className="font-semibold">{account.name}</p>
              <p className="text-sm text-[var(--ink-muted)]">
                {account.industry || "—"}
              </p>
            </div>
            <p className="text-xs text-[var(--ink-muted)]">{account.website}</p>
          </motion.div>
        ))}
      </div>
    </AppShell>
  );
}
