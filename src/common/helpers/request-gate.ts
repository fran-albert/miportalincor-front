/**
 * Acota cuántos pedidos salen a la vez.
 *
 * Nace de la lista de estudios sin asignar: con 80 tarjetas en pantalla, cada
 * una pidiendo las instancias del PACS y el preview de la primera, eran 160
 * pedidos simultáneos. El navegador los encolaba, varios morían por timeout y
 * la tarjeta quedaba con el icono de "sin vista previa".
 *
 * Es una fábrica y no un singleton para que cada lista tenga el suyo y los
 * tests no compartan estado.
 */
export const createRequestGate = (maxConcurrent: number) => {
  let running = 0;
  const waiting: Array<() => void> = [];

  return async <T>(task: () => Promise<T>): Promise<T> => {
    if (running >= maxConcurrent) {
      await new Promise<void>((resolve) => waiting.push(resolve));
    }
    running += 1;
    try {
      return await task();
    } finally {
      // El lugar se suelta también cuando el pedido falla: si no, un PACS
      // caído dejaría la lista trabada para siempre.
      running -= 1;
      waiting.shift()?.();
    }
  };
};
