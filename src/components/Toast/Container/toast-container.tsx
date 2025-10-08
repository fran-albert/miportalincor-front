import { useToastContext } from "@/hooks/Toast/toast-context";
import { CustomToast } from "../Custom-Toast";

export function ToastContainer() {
  const { toasts, removeToast } = useToastContext();

  console.log("ToastContainer render - toasts:", toasts);

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <CustomToast
          key={toast.id}
          type={toast.type}
          title={toast.title}
          description={toast.description}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
