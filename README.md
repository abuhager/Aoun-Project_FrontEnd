# Aoun Frontend

Comprehensive technical documentation for the Aoun Platform frontend, showcasing Next.js 14 App Router, TypeScript, and clean modular architecture.

🔗 **Live Demo**: [https://aoun-project-theta.vercel.app/](https://aoun-project-theta.vercel.app/)[cite: 1]

---

## Overview

Frontend application for **Aoun**, a charitable giving platform that helps users discover donation opportunities and manage related user workflows through a modern web interface.

The frontend is built with **Next.js** and **TypeScript**. It leverages the **App Router** structure and separates authentication flows, main application views, shared components, configurations, contexts, custom hooks, utilities, and strict type definitions.

---

## Main Capabilities

* **Authentication & Account Security**: User registration, login, email/account verification, forgot password, and password reset flows.
* **Donation Discovery & Management**: Browsing available donation opportunities, submitting donation requests, and managing listed items.
* **Safe Hubs & Delivery**: Dedicated interfaces for safe hubs and community handover interactions.
* **Protected Routes & Security**: Route protection mechanisms guarding authenticated areas.
* **Global State & React Context**: Centralized authentication, application state, and reusable custom hooks.
* **Modern UI & Responsive Design**: Global styling and highly reusable UI components across all screen sizes.

---

## Project Structure

```text
.
├── public/                # Static assets
├── src/
│   ├── app/               # Next.js App Router pages and layouts
│   │   ├── (auth)/        # Authentication route group (Login, Register, Reset, Verify)
│   │   └── (main)/        # Main route group (Dashboard, Browse, Requests, Hubs, Items)
│   ├── components/        # Reusable UI components
│   ├── config/            # Frontend configuration
│   ├── context/           # Shared React context providers
│   ├── hooks/             # Reusable React hooks
│   ├── lib/               # API clients and shared utilities
│   ├── types/             # TypeScript interfaces and types[cite: 2]
│   └── proxy.ts           # Request and route-protection proxy logic[cite: 2]
├── next.config.ts         # Next.js configuration[cite: 2]
├── eslint.config.mjs      # ESLint configuration[cite: 2]
├── postcss.config.mjs     # PostCSS configuration[cite: 2]
└── tsconfig.json          # TypeScript configuration[cite: 2]
