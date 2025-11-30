import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./routes.tsx";
import "./styles/index.css";
import ClientWrapper from "./components/Wrapper/index.tsx";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { HelmetProvider } from "react-helmet-async";
import { Analytics } from "@vercel/analytics/react";
import { ToastProvider } from "./hooks/Toast/toast-context.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClientWrapper>
      <Provider store={store}>
        <ToastProvider>
          <HelmetProvider>
            <App />
            <Analytics />
          </HelmetProvider>
        </ToastProvider>
      </Provider>
    </ClientWrapper>
  </StrictMode>
);
