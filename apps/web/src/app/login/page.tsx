"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { loginRequest, setSession } from "@/lib/api";
import { easeOutExpo } from "@/lib/motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@bace.local");
  const [password, setPassword] = useState("Admin@123456");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const session = await loginRequest(email, password);
      setSession(session);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 mesh-grid" />

      <motion.div
        className="gold-orb -left-24 top-10 h-[28rem] w-[28rem] bg-[rgba(245,197,24,0.45)]"
        animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="gold-orb -right-16 bottom-0 h-[26rem] w-[26rem] bg-[rgba(255,229,102,0.4)]"
        animate={{ x: [0, -40, 0], y: [0, -28, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="gold-orb left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 bg-[rgba(240,165,0,0.22)]"
        animate={{ opacity: [0.35, 0.7, 0.35] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-12 px-6 py-16 lg:flex-row lg:items-center lg:gap-20">
        <motion.section
          initial={{ opacity: 0, x: -36 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: easeOutExpo }}
          className="flex-1"
        >
          <motion.p
            className="badge-gold mb-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            Multi-tenant CRM · Gold edition
          </motion.p>

          <motion.h1
            className="brand-mark brand-gradient text-6xl leading-[0.95] md:text-8xl"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.75, ease: easeOutExpo }}
          >
            BACE
          </motion.h1>

          <motion.p
            className="mt-5 max-w-md text-lg text-[var(--ink-muted)]"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.55 }}
          >
            TDB Solution CRM — workspace nội bộ hôm nay, SaaS đa tenant ngày
            mai. Trải nghiệm sáng, vàng gold, chuyển động mượt.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap gap-3"
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } },
            }}
          >
            {["JWT + RBAC", "tenant_id enforced", "Pipeline ready"].map(
              (label) => (
                <motion.span
                  key={label}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    show: { opacity: 1, y: 0 },
                  }}
                  className="rounded-full border border-[var(--stroke)] bg-white/50 px-3 py-1.5 text-sm text-[var(--ink-muted)] backdrop-blur"
                >
                  {label}
                </motion.span>
              ),
            )}
          </motion.div>
        </motion.section>

        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 40, rotateX: 8 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.7, delay: 0.12, ease: easeOutExpo }}
          className="glass w-full max-w-md p-8"
          style={{ transformPerspective: 800 }}
        >
          <div className="relative z-10">
            <h2 className="brand-mark text-2xl">Sign in</h2>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">
              Seed admin đã điền sẵn — vào workspace trong một nhịp.
            </p>

            <label className="mt-6 block text-sm font-medium">
              Email
              <input
                className="input mt-2"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label className="mt-4 block text-sm font-medium">
              Password
              <input
                className="input mt-2"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            {error ? (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-sm text-red-600"
              >
                {error}
              </motion.p>
            ) : null}

            <motion.button
              className="btn-primary mt-6 w-full"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? "Authenticating…" : "Enter workspace"}
            </motion.button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
