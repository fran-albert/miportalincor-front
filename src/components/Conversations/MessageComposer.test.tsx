// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MessageComposer } from ".";

afterEach(() => {
  vi.useRealTimers();
});

describe("MessageComposer", () => {
  it("keeps the selected file and caption when media sending fails", async () => {
    const onSend = vi.fn();
    const onSendMedia = vi.fn().mockRejectedValue(new Error("send failed"));
    const { container } = render(
      <MessageComposer
        disabled={false}
        onSend={onSend}
        onSendMedia={onSendMedia}
      />,
    );

    selectFile(container, new File(["orden"], "orden.pdf", {
      type: "application/pdf",
    }));
    fireEvent.change(screen.getByPlaceholderText(/comentario/i), {
      target: { value: "Te mando la orden." },
    });
    fireEvent.click(screen.getByRole("button", { name: /enviar mensaje/i }));

    await waitFor(() => expect(onSendMedia).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /enviar mensaje/i }))
        .not.toBeDisabled(),
    );

    expect(screen.getByText("orden.pdf")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Te mando la orden.")).toBeInTheDocument();
    expect(onSend).not.toHaveBeenCalled();
  });

  it("clears the selected file and caption after media sending succeeds", async () => {
    const onSendMedia = vi.fn().mockResolvedValue(undefined);
    const { container } = render(
      <MessageComposer
        disabled={false}
        onSend={vi.fn()}
        onSendMedia={onSendMedia}
      />,
    );

    selectFile(container, new File(["orden"], "orden.pdf", {
      type: "application/pdf",
    }));
    fireEvent.change(screen.getByPlaceholderText(/comentario/i), {
      target: { value: "Te mando la orden." },
    });
    fireEvent.click(screen.getByRole("button", { name: /enviar mensaje/i }));

    await waitFor(() => expect(onSendMedia).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(screen.queryByText("orden.pdf")).not.toBeInTheDocument(),
    );

    expect(screen.getByRole("textbox")).toHaveValue("");
  });

  it("emits throttled typing pulses while composing", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-19T15:00:00.000Z"));
    const onTyping = vi.fn();
    render(
      <MessageComposer
        disabled={false}
        onSend={vi.fn()}
        onSendMedia={vi.fn()}
        onTyping={onTyping}
      />,
    );

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Hola" } });
    fireEvent.change(input, { target: { value: "Hola, te respondo" } });

    expect(onTyping).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(8_000);
    fireEvent.change(input, { target: { value: "Hola, te respondo por aca" } });

    expect(onTyping).toHaveBeenCalledTimes(2);
  });

  it("emits a typing pulse when attaching a file", () => {
    const onTyping = vi.fn();
    const { container } = render(
      <MessageComposer
        disabled={false}
        onSend={vi.fn()}
        onSendMedia={vi.fn()}
        onTyping={onTyping}
      />,
    );

    selectFile(container, new File(["orden"], "orden.pdf", {
      type: "application/pdf",
    }));

    expect(onTyping).toHaveBeenCalledTimes(1);
  });
});

function selectFile(container: HTMLElement, file: File): void {
  const input = container.querySelector<HTMLInputElement>("input[type='file']");
  if (!input) throw new Error("file input not found");
  fireEvent.change(input, { target: { files: [file] } });
}
