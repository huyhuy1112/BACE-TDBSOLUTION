"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { apiFetch } from "@/lib/api";
import { formatMoney } from "@/lib/format";

type Stage = { id: string; name: string; position: number };
type Deal = {
  id: string;
  title: string;
  amount?: string | number | null;
  currency: string;
  stageId: string;
  account?: { id: string; name: string } | null;
};
type Board = {
  pipeline: { id: string; name: string; stages: Stage[] };
  columns: { stage: Stage; deals: Deal[] }[];
};

export default function DealsPage() {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");

  const board = useQuery({
    queryKey: ["deals-board"],
    queryFn: () => apiFetch<Board>("/deals/board"),
  });

  const create = useMutation({
    mutationFn: () => {
      const firstStage = board.data?.pipeline.stages[0];
      if (!board.data || !firstStage) {
        throw new Error("Pipeline not ready");
      }
      return apiFetch("/deals", {
        method: "POST",
        body: JSON.stringify({
          title,
          pipelineId: board.data.pipeline.id,
          stageId: firstStage.id,
          amount: amount ? Number(amount) : undefined,
        }),
      });
    },
    onSuccess: async () => {
      setTitle("");
      setAmount("");
      await qc.invalidateQueries({ queryKey: ["deals-board"] });
    },
  });

  const move = useMutation({
    mutationFn: ({ id, stageId }: { id: string; stageId: string }) =>
      apiFetch(`/deals/${id}/move`, {
        method: "PATCH",
        body: JSON.stringify({ stageId }),
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["deals-board"] });
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
        eyebrow="Pipeline"
        title={board.data?.pipeline.name ?? "Sales pipeline"}
        description="Kanban board — move deals across stages without leaving the tenant boundary."
      />

      <form
        onSubmit={onSubmit}
        className="mt-6 grid gap-3 surface-card p-4 md:grid-cols-[1fr_160px_auto]"
      >
        <input
          className="input"
          placeholder="Deal title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="input"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button className="btn-primary" disabled={create.isPending || !board.data}>
          {create.isPending ? "Saving…" : "Add deal"}
        </button>
      </form>

      {board.isLoading ? (
        <p className="mt-6 text-[var(--ink-muted)]">Loading board…</p>
      ) : null}

      <div className="mt-6 flex gap-4 overflow-x-auto pb-4">
        {board.data?.columns.map((col, colIndex) => (
          <motion.section
            key={col.stage.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: colIndex * 0.05 }}
            className="surface-card min-w-[260px] flex-1 p-3"
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="text-sm font-semibold">{col.stage.name}</h2>
              <span className="text-xs text-[var(--ink-muted)]">
                {col.deals.length}
              </span>
            </div>
            <div className="space-y-2">
              {col.deals.map((deal) => (
                <div
                  key={deal.id}
                  className="surface-card p-3"
                >
                  <p className="font-medium">{deal.title}</p>
                  <p className="mt-1 text-sm text-[var(--ink-muted)]">
                    {formatMoney(deal.amount, deal.currency)}
                  </p>
                  <p className="mt-1 text-xs text-[var(--ink-muted)]">
                    {deal.account?.name || "No account"}
                  </p>
                  <select
                    className="input mt-2 py-1.5 text-xs"
                    value={deal.stageId}
                    onChange={(e) =>
                      move.mutate({ id: deal.id, stageId: e.target.value })
                    }
                  >
                    {board.data?.pipeline.stages.map((s) => (
                      <option key={s.id} value={s.id}>
                        Move → {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </motion.section>
        ))}
      </div>
    </AppShell>
  );
}
