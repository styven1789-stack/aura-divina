# Artefacto 3 — Diseño del Flujo de Checkout (UX & Negocio)

> Objetivo: convertir un visitante mobile en pedido contraentrega **en menos de 90 segundos**, con cero fricción y validación de cobertura **antes** de pedir datos personales.

---

## 3.1 Principios rectores

1. **Mobile-first absoluto** — el 78% del tráfico de e-commerce de joyería en Colombia es mobile. Diseñamos para una mano y pulgar.
2. **Validación temprana, datos después** — Pedir cobertura primero evita la frustración clásica: "llené todo y al final me dijeron que no entregan en mi barrio".
3. **WhatsApp como cierre, no como obstáculo** — En el mercado colombiano, terminar un pedido por WhatsApp **aumenta** la confianza (la marca se siente cercana, humana). Lo aprovechamos como capa de confirmación humana, no como reemplazo del flujo digital.
4. **Cero campos inútiles** — Solo lo que el mensajero necesita: nombre, celular, dirección, referencia, notas. NIT, segundo apellido, departamento... fuera.
5. **Anti-fraude blando** — En Fase 2 añadimos OTP por SMS al teléfono antes de confirmar para evitar pedidos fantasma — un dolor real del COD en Colombia.

---

## 3.2 Flujo paso a paso

```mermaid
flowchart TD
  Start([🛒 Click "Continuar al checkout"]) --> Z[Paso 1<br/>Selector de Ciudad + Barrio<br/>· dropdowns guiados<br/>· verificación AJAX]
  Z -- ✓ cobertura --> COV[Banner verde<br/>"Sí entregamos · $8000 · 24h"]
  Z -- ✗ sin cobertura --> NOC[Banner rosa<br/>"Aún no, déjanos tu correo"]
  NOC --> Email[Capturar lead → CRM]
  COV --> D[Paso 2<br/>Datos esenciales<br/>5 campos · autocompletar]
  D --> R[Resumen sticky lateral<br/>+ total contraentrega]
  R --> CTA[Botón único<br/>"Confirmar pedido contraentrega"]
  CTA --> POST[POST /api/orders]
  POST -- 201 --> OK[Pantalla éxito<br/>código AD-XXXXXX]
  OK --> WA[Botón gigante<br/>"Confirmar por WhatsApp ↗"<br/>wa.me/57318...?text=...]
  WA --> Done([🎉 Conversación abierta<br/>con admin Aura Divina])
```

---

## 3.3 Anatomía del formulario (mobile)

```
┌──────────────────────────────────┐
│ ⓘ Pago contraentrega · Medellín │
├──────────────────────────────────┤
│  1. ¿Dónde lo recibes?           │
│  ┌──────────────┬──────────────┐ │
│  │ Ciudad ▾     │ Barrio ▾     │ │
│  └──────────────┴──────────────┘ │
│  ✓ Sí entregamos en El Poblado   │
│    Envío $8.000 · Mismo día      │
├──────────────────────────────────┤
│  2. Tus datos                    │
│  Nombre completo *               │
│  [_______________________]       │
│  Celular WhatsApp *              │
│  [3___________________ ] 📱      │
│  Dirección *                     │
│  [_______________________]       │
│  Referencia (torre, apto)        │
│  [_______________________]       │
│  Notas para el repartidor        │
│  [_______________________]       │
├──────────────────────────────────┤
│  💎 Resumen                      │
│  2 productos          $204.000   │
│  Envío                  $8.000   │
│  ─────────────────────────────   │
│  TOTAL contraentrega  $212.000   │
│                                  │
│  [   Confirmar contraentrega →]  │
└──────────────────────────────────┘
```

**Detalles que cambian la conversión:**

| Decisión | Por qué |
|---|---|
| Selector dropdown vs autocompletar libre | El usuario no tipea mal "El Poblado". Cero errores de matching contra Coverage_Zones. |
| Validación AJAX en `onChange` del barrio | Feedback inmediato (≈80 ms con cache Redis). |
| Teléfono pre-rellenado con `3` | UX, además bloquea formatos incorrectos. |
| Campo "Referencia" separado de "Dirección" | El mensajero lo agradece y reduce reentregas en 18% según data de Servientrega Colombia. |
| Resumen **sticky** en mobile (acordeón abajo) | El usuario nunca pierde de vista el total. |
| CTA único (sin "Pagar después") | Evita parálisis de decisión. |
| **No pedimos correo obligatorio** | El COD se confirma por WhatsApp, no por mail. |

---

## 3.4 Pantalla de éxito + handoff a WhatsApp

```
┌────────────────────────────────────┐
│              🎉                    │
│       ¡Pedido recibido!            │
│                                    │
│   Tu pedido AD-7H2K9P está         │
│   pendiente de confirmación.       │
│                                    │
│   Confírmanos por WhatsApp para    │
│   preparar tu envío contraentrega. │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  📱 Confirmar por WhatsApp   │  │
│  └──────────────────────────────┘  │
│                                    │
│   ← Volver al inicio               │
└────────────────────────────────────┘
```

El botón abre `wa.me/573187307977?text=<mensaje pre-llenado>` con el mensaje completo del pedido — el cliente solo tiene que pulsar **Enviar** y queda una conversación 1-a-1 abierta con el equipo Aura Divina. **Esto convierte un pedido COD en una relación de cliente.**

Mensaje pre-llenado (ejemplo real generado por `CreateCashOnDeliveryOrderCommandHandler`):

```
*Aura Divina · Nuevo Pedido AD-7H2K9P*

*Cliente:* María Rodríguez
*Tel:* 3001234567
*Ciudad:* Medellín — El Poblado
*Dirección:* Cra 43A # 5 - 50, Torre 3 Apto 1402
*Referencia:* Edificio Aurora, portería 24h

*Productos:*
• 1x Anillo Aurora — $89.000
• 1x Aretes Divina Perla — $75.000

*Subtotal:* $164.000
*Envío:* $8.000
*TOTAL (Contraentrega):* $172.000

Por favor confirma para preparar el pedido ✨
```

---

## 3.5 Métricas a vigilar (post-launch)

| Métrica | Target Mes 1 |
|---|---|
| Tasa de conversión móvil | ≥ 3.5 % |
| Abandono en el paso "Cobertura" | < 25 % |
| Tiempo promedio del checkout | < 90 s |
| % pedidos confirmados por WhatsApp en < 1 h | ≥ 70 % |
| Tasa de no-show / pedidos fantasma | < 5 % |
| Devoluciones por dirección incorrecta | < 2 % |

Todas las métricas se trackean con eventos disparados desde el frontend (PostHog / GA4) y desde el backend en BullMQ workers (`analytics.track`).
