"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { apiFetch } from "@/lib/api";

type Contact = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  title?: string | null;
  account?: { id: string; name: string } | null;
};

export default function ContactsPage() {
  const qc = useQueryClient();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const contacts = useQuery({
    queryKey: ["contacts"],
    queryFn: () => apiFetch<Contact[]>("/contacts"),
  });

  const create = useMutation({
    mutationFn: () =>
      apiFetch<Contact>("/contacts", {
        method: "POST",
        body: JSON.stringify({
          firstName,
          lastName,
          email: email || undefined,
        }),
      }),
    onSuccess: async () => {
      setFirstName("");
      setLastName("");
      setEmail("");
      await qc.invalidateQueries({ queryKey: ["contacts"] });
    },
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;
    create.mutate();
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="CRM"
        title="Contacts"
        description="People linked to accounts and deals across the tenant."
      />

      <form
        onSubmit={onSubmit}
        className="mt-8 grid gap-3 surface-card p-4 md:grid-cols-4"
      >
        <input
          className="input"
          placeholder="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          className="input"
          placeholder="Last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <input
          className="input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="btn-primary" disabled={create.isPending}>
          {create.isPending ? "Saving…" : "Add contact"}
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {contacts.isLoading ? (
          <p className="text-[var(--ink-muted)]">Loading contacts…</p>
        ) : null}
        {contacts.data?.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center justify-between surface-card px-4 py-3"
          >
            <div>
              <p className="font-semibold">
                {c.firstName} {c.lastName}
              </p>
              <p className="text-sm text-[var(--ink-muted)]">
                {c.email || "No email"} · {c.account?.name || "No account"}
              </p>
            </div>
            <p className="text-xs text-[var(--ink-muted)]">{c.title}</p>
          </motion.div>
        ))}
      </div>
    </AppShell>
  );
}
