import { Loader2 } from "lucide-react";

export default function LoadingButton({
  children,
  loading,
  className = "btn-primary",
  ...props
}) {
  return (
    <button className={className} disabled={loading || props.disabled} {...props}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
