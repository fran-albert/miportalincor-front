import { useToastContext } from "@/hooks/Toast/toast-context";
import { CustomToast } from "../Custom-Toast";

export function ToastContainer() {
  const { toasts, removeToast } = useToastContext();

  return (
    <div className="fixed top-6 right-6 z-[9999] space-y-3 max-w-md pointer-events-none">
      {toasts.map((toast) => (
        <div className="pointer-events-auto" key={toast.id}>
          <CustomToast
            key={toast.id}
            type={toast.type}
            title={toast.title}
            description={toast.description}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
}
