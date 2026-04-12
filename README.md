# Aura Divina ✨

> *Tu esencia, tu estilo, tu aura divina.*
> E-commerce premium de joyería para mujeres · Medellín, Colombia · Pago contraentrega.

---

## 🚀 Cómo correr el proyecto

```bash
npm install
npm run dev
```

Luego abrir **<http://localhost:3007>**

- **Tienda**: <http://localhost:3007>
- **Admin**: <http://localhost:3007/admin/login>
  - Email: `admin@auradivina.co`
  - Pass: `AuraDivina2026!`

---

## 🧱 Stack

- **Frontend**: Next.js 15 (App Router) · React 19 · TailwindCSS · Zustand
- **Persistencia (dev)**: JSON file (`data/db.json`) — sin dependencias nativas, arranque inmediato.
- **Persistencia (prod planificada)**: PostgreSQL 16 + Redis 7 + BullMQ + NestJS 11 (ver [`docs/`](./docs/))
- **Arquitectura**: Clean Architecture / Hexagonal · CQRS · Unit of Work · Repository Pattern

---

## 📐 Documentación arquitectónica

| # | Documento | Contenido |
|---|---|---|
| 1 | [Arquitectura del sistema](./docs/01-arquitectura.md) | Diagramas Mermaid, topología, secuencia COD asíncrona |
| 2 | [Modelo de datos](./docs/02-modelo-datos.md) | DDL PostgreSQL, ER, máquina de estados de la orden |
| 3 | [Diseño del checkout (UX)](./docs/03-checkout-ux.md) | Flujo mobile, formulario, integración WhatsApp |
| 4 | [Estructura Clean Architecture](./docs/04-estructura-clean-arch.md) | Árbol de carpetas NestJS + reglas de dependencia |
| 5 | [Handler nivel dios](./docs/05-handler-godlevel.md) | `CreateCashOnDeliveryOrderCommandHandler` con UoW + BullMQ |

---

## 🎨 Sistema de marca

- **Colores**: rosa pastel `#fff5f8` · dorado bruñido `#c9a96e` · tinta `#1a1518`
- **Tipografía**: Cormorant Garamond (serif, títulos) · Inter (sans, UI)
- **Logo**: SVG vectorial radial — ver [`src/components/brand/Logo.tsx`](./src/components/brand/Logo.tsx)

---

## 📂 Estructura del proyecto

```
aura-divina/
├── src/
│   ├── app/                              ← Next.js App Router
│   │   ├── (shop)/                       ← Storefront público
│   │   │   ├── page.tsx                  ← Home
│   │   │   ├── productos/
│   │   │   ├── carrito/
│   │   │   └── checkout/
│   │   ├── admin/                        ← Panel administrativo
│   │   │   ├── login/
│   │   │   └── (panel)/
│   │   │       ├── productos/
│   │   │       ├── pedidos/
│   │   │       └── zonas/
│   │   └── api/                          ← Adaptadores REST
│   ├── core/                             ← Clean Architecture
│   │   ├── domain/                       (entidades, VOs, errores)
│   │   ├── application/                  (commands, ports — CQRS)
│   │   └── infrastructure/               (json store, event bus, container)
│   ├── components/                       ← UI reutilizable
│   ├── store/                            ← Zustand (carrito)
│   └── lib/                              (auth, money, utils)
├── docs/                                 ← Los 5 artefactos arquitectónicos
└── data/db.json                          ← "Base de datos" dev (sembrada)
```

---

## 📞 Contacto

WhatsApp: **+57 318 730 7977**
