export function formatMoney(
  amount: string | number | null | undefined,
  currency = "VND",
) {
  if (amount === null || amount === undefined || amount === "") return "—";
  const value = typeof amount === "string" ? Number(amount) : amount;
  if (Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function statusTone(status: string) {
  switch (status) {
    case "NEW":
    case "OPEN":
      return "bg-[rgba(245,197,24,0.18)] text-[#8a6a00]";
    case "QUALIFIED":
    case "WON":
    case "CONTACTED":
      return "bg-[rgba(212,160,23,0.2)] text-[#6b5200]";
    case "LOST":
    case "UNQUALIFIED":
      return "bg-[rgba(220,38,38,0.1)] text-[#b91c1c]";
    case "CONVERTED":
      return "bg-[rgba(34,197,94,0.12)] text-[#15803d]";
    default:
      return "bg-[rgba(26,20,8,0.06)] text-[var(--ink-muted)]";
  }
}
