import { useEffect } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";
import { useToastStore } from "../store";

export default function Toast() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onRemove,
}: {
  toast: { id: string; message: string; type: "success" | "error" | "info" };
  onRemove: (id: string) => void;
}) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), 3400);
    return () => clearTimeout(t);
  }, [toast.id, onRemove]);

  const icons = {
    success: <CheckCircle size={15} className="text-green-500 shrink-0" />,
    error: <XCircle size={15} className="text-red-500 shrink-0" />,
    info: <Info size={15} className="text-blue-500 shrink-0" />,
  };

  const borders = {
    success: "border-green-200",
    error: "border-red-200",
    info: "border-blue-200",
  };

  return (
    <div
      className={`pointer-events-auto flex items-center gap-2.5 bg-white border ${borders[toast.type]} shadow-lg rounded-xl px-4 py-3 min-w-[220px] max-w-[340px] animate-slide-up`}
    >
      {icons[toast.type]}
      <span className="text-[13px] font-medium text-text flex-1">
        {toast.message}
      </span>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-muted hover:text-text2 transition-colors ml-1"
      >
        <X size={13} />
      </button>
    </div>
  );
}
