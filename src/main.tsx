import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./routes.tsx";
import "./styles/index.css";
import ClientWrapper from "./components/Wrapper/index.tsx";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { Toaster } from "sonner";
import { HelmetProvider } from "react-helmet-async";
import { Analytics } from "@vercel/analytics/react";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClientWrapper>
      <Provider store={store}>
        <Toaster
          position="top-center"
          toastOptions={{
            unstyled: true,
            classNames: {
              content: "bg-white shadow-lg rounded-lg relative",
            },
          }}
        />

        <HelmetProvider>
          <App />
          <Analytics />
        </HelmetProvider>
      </Provider>
    </ClientWrapper>
  </StrictMode>
);
