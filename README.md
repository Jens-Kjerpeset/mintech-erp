# Mintech ERP

A local-first administrative ERP system constructed for complex workflow requirements, interactive invoice generation, and dynamic product cataloging.

## 1. Purpose & Application Architecture

Mintech is a technology demonstration and UX sandbox built to explore the extremes of client-side architecture. The project simulates a local-first administrative ERP system for interactive invoicing and dynamic product cataloging.

The entire project architecture is governed by **React** and **TypeScript** via the **Vite** compiler, with interface patterns from **Tailwind CSS** and **Shadcn UI**. The core of the exploration is pure offline capability: the data layer operates 100% locally in the browser's IndexedDB, encapsulated with `Dexie.js` for asynchronous relational queries. To manage hundreds of active states across the component tree without cumbersome prop-drilling, **Zustand** stores are used in combination with **React Query** for data orchestration. This setup eliminates the need for cloud infrastructure during development and serves as a deliberate environment to isolate and test complex frontend logic. The underlying dummy data foundation in the system was primarily generated using AI, but manually checked and refined.

## 2. Accessibility (WCAG) & UX Strategy

An interactive ERP complex consisting of hundreds of input fields poses a significant risk of exclusion. Through the integration of **Radix UI Primitives**, the invoicing and settings modules offer built-in keyboard navigation and robust `aria-describedby` integrations. This ensures that operators using screen readers automatically understand form validations for financial errors, without relying on visual feedback.

Visually and strategically, the system is aimed at users who prefer premium, minimalist tools. To simulate a full-fledged SaaS product, the interface utilizes established cloud solution patterns (such as "Welcome back" dashboards). This deliberately creates a cognitive dissonance against the local data storage, which is actively used to evaluate and iterate on how offline status can best be communicated in a production environment (e.g., through the use of persistent "Offline Mode" indicators).

## 3. Engineering Trade-offs & Production Roadmap

Building a pure client-side system requires pragmatic architectural choices that clarify the distinction between a frontend prototype and a market-ready cloud solution:

- **Data Volatility & Backups:** Since IndexedDB is transient, clearing browser data will remove the history. Mintech solves this in the sandbox via manual exports (SAF-T XML, ZIP, CSV). In a real production environment, this generic data loss risk would require automated background synchronization (e.g., integration with Supabase) or the use of the Native File System API.
- **Client-Generated PDFs:** The platform generates PDF invoices directly in the client via `@react-pdf/renderer` without involving AWS/Azure. To avoid memory crashes on mobile browsers (especially iOS Safari) and layout shifts from asynchronous loading, custom fonts were discarded in favor of standard 'Helvetica'.
- **API Simulation:** The settings for Altinn (VAT) and PSD2 (Bank) are functional mockups to demonstrate UX patterns, load sequences, and error handling for complex enterprise integrations. Since a React frontend cannot securely store client certificates or OAuth keys, these would communicate with a secure Node.js or .NET backend proxy in production.
- **Performance & Hardware Utilization:** Client bundling under Vite results in a comprehensive JavaScript download (LCP of 1.4s), but route-level code splitting (React.lazy) saves bandwidth. The local data architecture over Dexie.js avoids TCP roundtrips to the cloud, resulting in instantaneous, desktop-like response times (INP of 45ms).

## 4. Contextual User Understanding & Future Roadmap

The project's original problem statement was derived from a specific, practical challenge: independent tradespeople and creative freelancers operating at stands and fairs. The established workflow for this group often consists of recording transactions in physical books during the event, followed by inefficient and error-prone digitization afterward, as computers are rarely practical to bring along.

The consistent "mobile-first" approach in Mintech is directly rooted in this need. The architecture is designed to leverage the smartphone to drastically reduce cognitive load and eliminate duplicate work in high-intensity sales situations.

Qualitative user testing within this target group validates the technical execution of navigation and interaction design. The application is perceived as fast and intuitive during the moment of transaction. At the same time, testing reveals a content-related friction point: established accounting terminology and rigid financial rules in the interface act as a barrier for users without a formal financial background.

The next strategic step in development is therefore to restructure the application's information architecture to address this knowledge gap. Rather than functioning merely as a passive recording tool, future iterations will integrate contextual microlearning. The intention is to transform the interface into an educational tool that gradually, safely, and intuitively guides informal actors and micro-businesses through fundamental financial management.
