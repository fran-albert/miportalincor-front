import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./routes.tsx";
import "./styles/index.css";
import ClientWrapper from "./components/Wrapper/index.tsx";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { Toaster } from "sonner";

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

        <App />
      </Provider>
    </ClientWrapper>
  </StrictMode>
);
