# Artefacto 1 — Arquitectura del Sistema y Flujo de Datos

> Aura Divina · Monolito Modular (NestJS) + Frontend Next.js + Postgres/Redis/BullMQ
> Estilo: Clean Architecture / Hexagonal · Patrón CQRS en módulos pesados

---

## 1.1 Topología de despliegue (alto nivel)

```mermaid
graph TD
  subgraph Client[Cliente]
    A1[📱 Mobile Web<br/>Next.js SSR/SSG]
    A2[💻 Desktop Web]
    A3[👩‍💼 Admin Panel<br/>Next.js + RBAC]
  end

  subgraph Edge[Edge / CDN]
    CDN[Cloudflare CDN<br/>+ Imágenes WebP]
    LB[Nginx / Vercel Edge<br/>Rate-limit + WAF]
  end

  subgraph App[Aplicación]
    NEXT[Next.js 15<br/>App Router · SSR + ISR]
    API[NestJS 11<br/>REST · OpenAPI · /api/v1]
    WORKER[BullMQ Workers<br/>NestJS @Processor]
  end

  subgraph Data[Persistencia]
    PG[(PostgreSQL 16<br/>schemas: catalog,<br/>orders, logistics, identity)]
    REDIS[(Redis 7<br/>cache · sesiones · pub/sub)]
  end

  subgraph Async[Eventos · Side-effects]
    Q1[Queue: orders.created]
    Q2[Queue: notifications.whatsapp]
    Q3[Queue: notifications.email]
    Q4[Queue: cart.abandoned]
  end

  subgraph Ext[Servicios externos]
    WA[WhatsApp Business API<br/>+ Cloud API]
    MAIL[Resend / Mailgun]
    PAY[Wompi / Mercado Pago<br/>Fase 2]
    SHIP[Servientrega / Coordinadora<br/>Fase 2]
    OBS[Sentry · Grafana · OTel]
  end

  A1 --> CDN --> LB --> NEXT
  A2 --> CDN
  A3 --> LB --> NEXT
  NEXT -- HTTPS REST --> API
  NEXT -. RSC fetch .-> API
  API --> PG
  API --> REDIS
  API -- XADD / publish --> Q1
  Q1 --> WORKER
  Q2 --> WORKER
  Q3 --> WORKER
  Q4 --> WORKER
  WORKER --> WA
  WORKER --> MAIL
  WORKER --> PG
  API --> OBS
  WORKER --> OBS
  API -. fase 2 .-> PAY
  API -. fase 2 .-> SHIP
```

---

## 1.2 Secuencia: "Crear orden contraentrega" (no bloqueante)

```mermaid
sequenceDiagram
  autonumber
  actor U as 👩 Usuaria
  participant N as Next.js (App Router)
  participant G as Edge / Rate-limit
  participant C as NestJS Controller<br/>OrdersController
  participant H as CommandHandler<br/>CreateCashOnDeliveryOrderCommandHandler
  participant UW as UnitOfWork (Postgres)
  participant R as Redis (cache)
  participant Q as BullMQ
  participant W as Worker
  participant WA as WhatsApp Cloud API
  participant ML as Email Provider

  U->>N: Submit checkout (form)
  N->>G: POST /api/v1/orders
  G->>C: Forward (sanitized + JWT-anon)
  C->>H: execute(CreateCodOrderCommand)

  rect rgb(252,217,227)
    note over H,UW: Transacción atómica (BEGIN)
    H->>UW: coverage.resolveByNeighborhood()
    UW-->>H: CoverageZone | null
    alt sin cobertura
      H-->>C: throw OutOfCoverageZoneException (422)
      C-->>N: 422 + i18n
      N-->>U: "Aún no entregamos en tu zona"
    else con cobertura
      H->>UW: products.findById() (loop) + lock FOR UPDATE
      H->>UW: descontar stock
      H->>UW: orders.save(order PENDING)
      H->>UW: orderItems.save([...])
      UW-->>H: COMMIT ✓
    end
  end

  H->>Q: publish OrderCreatedEvent (job)
  Q-->>H: jobId (instantáneo, no espera)
  H-->>C: { order, whatsappDeepLink }
  C-->>N: 201 Created
  N-->>U: ✅ Pedido AD-XXXXXX (pantalla éxito)

  par Side-effects asíncronos (BullMQ)
    Q->>W: orders.created
    W->>WA: send template "new_order_admin"
    W->>R: cache invalidation (catalog.featured)
  and
    Q->>W: notifications.email
    W->>ML: enviar confirmación al cliente
  and
    Q->>W: analytics.track
    W->>R: incr counter ventas:hoy
  end
```

**Por qué esto importa:**

- El **CommandHandler** corre dentro de UoW: si falla la inserción del item nº 3, todo el pedido se rollbackea (cero estados huérfanos).
- La validación de cobertura está **antes** del descuento de stock — feedback rápido y cero efectos colaterales si falla.
- Los side-effects pesados (WhatsApp, email, analytics) viven en **BullMQ workers**, no bloquean el hilo de la request → el cliente recibe `201` en < 150 ms.
- BullMQ provee **retries con backoff exponencial**, idempotencia por `jobId` y dead-letter queue (DLQ).
- Pub/Sub Redis se reserva para eventos en tiempo real (notificaciones del admin sobre nuevos pedidos).

---

## 1.3 Decisiones arquitectónicas clave (ADR resumido)

| # | Decisión | Por qué |
|---|----------|---------|
| 1 | Monolito Modular vs microservicios | Equipo pequeño, dominio aún en validación. Bounded contexts limpios = extracción futura barata. |
| 2 | NestJS sobre Express puro | DI container nativo, módulos, decoradores, ecosistema BullMQ + TypeORM, soporte CQRS first-class. |
| 3 | CQRS solo en `Orders` y `Catalog` (lecturas) | Lecturas de catálogo se sirven desde proyecciones cacheadas (Redis); escrituras complejas (orden) usan command handlers transaccionales. |
| 4 | Postgres con TimescaleDB **off** | No tenemos series temporales (todavía). Postgres puro. Schemas separados por bounded context. |
| 5 | Redis multipropósito | Cache de catálogo, sesiones JWT-blacklist, pub/sub admin, BullMQ broker. Una sola pieza de infraestructura. |
| 6 | Pago Contraentrega como Aggregate `Order` | El método de pago es un VO inside `Order`. Fase 2: introducir `Payment` como agregado separado cuando entren pasarelas online. |
| 7 | Frontend Next.js SSR + ISR | SEO en Google Colombia es vital para "anillos Medellín". RSC para data fetching server-side sin spinners. |
