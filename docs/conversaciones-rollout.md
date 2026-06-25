# Conversaciones - rollout controlado

Estado: el panel de conversaciones esta disponible en codigo, pero queda
controlado por flags para poder probar produccion sin abrirlo a secretarias.

## Flags

```env
VITE_CONVERSATIONS_ENABLED=false
VITE_CONVERSATIONS_NAV_VISIBLE=false
VITE_CONVERSATIONS_MOCK=false
VITE_CONVERSATIONS_API_URL=https://api-turnos.incorcentromedico.com.ar/chatbot/api/
VITE_CONVERSATIONS_WS_URL=https://api-turnos.incorcentromedico.com.ar/chatbot/api/conversations/stream
```

- `VITE_CONVERSATIONS_ENABLED`: habilita la ruta protegida `/conversaciones`.
- `VITE_CONVERSATIONS_NAV_VISIBLE`: muestra el item "Conversaciones" en el
  sidebar.
- `VITE_CONVERSATIONS_MOCK`: solo para desarrollo local; en produccion debe
  quedar `false`.

## Smoke de produccion

Para validar sin exponerlo en la navegacion:

```env
VITE_CONVERSATIONS_ENABLED=true
VITE_CONVERSATIONS_NAV_VISIBLE=false
VITE_CONVERSATIONS_MOCK=false
```

Entrar como `Administrador` y abrir `/conversaciones` por URL directa. El
sidebar queda oculto para evitar adopcion accidental durante la prueba.

## Criterio de apertura

Antes de mostrarlo a secretarias:

- validar login real contra el backoffice;
- confirmar que lista, detalle y WebSocket conectan contra el bot;
- responder un WhatsApp de prueba desde el panel;
- confirmar trazabilidad en Zammad;
- revisar feedback visual/operativo con una administradora.

No se exponen credenciales ni URLs directas de Zammad en el navegador. El front
habla con el chatbot bridge, y el bridge opera Zammad.
