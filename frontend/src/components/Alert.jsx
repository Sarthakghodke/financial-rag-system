import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function Alert({ type = "error", message }) {
  if (!message) return null;

  const isSuccess = type === "success";
  const Icon = isSuccess ? CheckCircle2 : AlertCircle;
  const styles = isSuccess
    ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-100"
    : "border-rose-400/25 bg-rose-400/10 text-rose-100";

  return (
    <div className={`flex items-start gap-3 rounded-md border px-3 py-2.5 text-sm ${styles}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
