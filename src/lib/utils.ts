import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
  
}

/**
 * Handler para `onOpenAutoFocus` de `DialogContent`.
 *
 * Por defecto Radix enfoca el primer elemento focuseable del diálogo. Cuando ese
 * elemento es un campo de texto, en mobile se levanta el teclado apenas se abre
 * el modal y tapa los botones de acción. Este handler cancela ese autofocus y en
 * su lugar enfoca el contenedor del diálogo (que Radix renderiza con
 * `tabIndex={-1}`), así el foco queda adentro del modal: Tab sigue recorriendo
 * su contenido y Escape lo sigue cerrando.
 */
export function focusDialogContainerOnOpen(event: Event) {
  event.preventDefault()
  const container = event.currentTarget
  if (container instanceof HTMLElement) {
    container.focus({ preventScroll: true })
  }
}
