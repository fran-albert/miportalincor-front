import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UploadedImagesButton } from "./UploadedImagesButton";

const image = (n: number) => ({
  id: n,
  locationS3: `29493294/${n}-ECO.jpg`,
  signedUrl: `https://estudios.example/studies/29493294/${n}-ECO.jpg?sig=x`,
});

describe("UploadedImagesButton", () => {
  it("no se muestra si el estudio no tiene imágenes", () => {
    const { container } = render(<UploadedImagesButton images={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("no se muestra si las imágenes no traen URL", () => {
    const { container } = render(
      <UploadedImagesButton images={[{ ...image(1), signedUrl: "" }]} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("muestra el conteo y abre la grilla con todas las imágenes", async () => {
    render(<UploadedImagesButton images={[1, 2, 3].map(image)} />);

    await userEvent.click(screen.getByRole("button", { name: /Imágenes \(3\)/ }));

    expect(screen.getByText("Imágenes de la ecografía")).toBeInTheDocument();
    const thumbs = screen.getAllByRole("img");
    expect(thumbs).toHaveLength(3);
    expect(thumbs[0]).toHaveAttribute("src", image(1).signedUrl);
  });

  it("amplía la imagen elegida", async () => {
    render(<UploadedImagesButton images={[1, 2].map(image)} />);

    await userEvent.click(screen.getByRole("button", { name: /Imágenes \(2\)/ }));
    await userEvent.click(screen.getByRole("button", { name: "Ver imagen 2" }));

    expect(screen.getByAltText("Imagen 2 ampliada")).toHaveAttribute(
      "src",
      image(2).signedUrl
    );
  });

  it("no dispara el click de la tarjeta que lo contiene", async () => {
    const onCardClick = vi.fn();
    render(
      <div onClick={onCardClick}>
        <UploadedImagesButton images={[image(1)]} />
      </div>
    );

    await userEvent.click(screen.getByRole("button", { name: /Imágenes \(1\)/ }));

    expect(onCardClick).not.toHaveBeenCalled();
  });
});
