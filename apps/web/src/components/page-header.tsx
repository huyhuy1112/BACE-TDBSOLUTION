"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <motion.div
      className="flex flex-wrap items-end justify-between gap-4"
      variants={fadeUp}
      initial="hidden"
      animate="show"
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--accent-deep)]">
          {eyebrow}
        </p>
        <h1 className="brand-mark mt-2 text-4xl md:text-5xl">
          <span className="brand-gradient">{title}</span>
        </h1>
        {description ? (
          <p className="mt-2 max-w-xl text-[var(--ink-muted)]">{description}</p>
        ) : null}
      </div>
      {actions}
    </motion.div>
  );
}
