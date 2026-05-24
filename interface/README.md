# 💻 React Frontend - Inventory Management System

This directory contains the rich single-page application (SPA) client for the **Inventory Management System (IMS)**, built using **React 19**, **TypeScript**, and **Vite**.

It features full user session persistence, a robust global modal framework, custom alerts, dynamic dashboard widgets (using Recharts), search filters, and comprehensive integration testing via **Cypress**.

---

## 🚀 Getting Started

Follow these instructions to configure and run the frontend application locally.

### 📋 Prerequisites
Make sure you have the following installed:
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher)

### 📦 Installation
1. Navigate to this directory:
   ```bash
   cd interface
   ```
2. Install all node modules and package dependencies:
   ```bash
   npm install
   ```

---

## 🏃 Running the Application

### 1. Development Mode
Runs the application locally with Hot Module Replacement (HMR) enabled:
```bash
npm run dev
```
By default, the Vite dev server runs at **`http://localhost:5173`**.

> [!IMPORTANT]
> **API Dev Proxy Setup:**
> To prevent Cross-Origin Resource Sharing (CORS) blocks, Vite's dev server is configured with a reverse proxy. Any client HTTP request starting with `/api` is automatically forwarded to the backend running at `http://localhost:8080`.
>
> You can verify this configuration in the `vite.config.ts` file:
> ```ts
> server: {
>   proxy: {
>     '/api': {
>       target: 'http://localhost:8080',
>       changeOrigin: true,
>       secure: false,
>     },
>   },
> }
> ```
> Make sure the Spring Boot backend server is running on port `8080` before starting interactions.

### 2. Production Build
To compile and bundle the React TypeScript codebase for production deployment:
```bash
npm run build
```
The optimized and minified assets will be generated in the `dist/` directory, ready to be served by any static asset server or CDN.

### 3. Production Preview
To inspect and test the compiled production build locally:
```bash
npm run preview
```

---

## 🧪 End-to-End Testing with Cypress

This project uses **Cypress** to perform comprehensive integration and end-to-end tests, simulating actual user behavior against mock and real REST APIs.

### 🧪 What is Tested?
- **Valid Login (Admin Flow):** Verifies correct form submission, JWT token storage, page redirects, dashboard metric rendering, and chart integration.
- **Invalid Login:** Verifies UI error validation warnings on auth failures.
- **User Requisitions:** Simulates standard user role actions, selecting items, adjusting quantity details in interactive modals, and submitting internal requests.
- **Session Logout:** Tests local storage session clearing and route protection logic.

### 🏃 Running Cypress Tests
To execute E2E tests, ensure you are in the `interface` directory:

* **Interactive GUI Mode:**
  Recommended during development. Opens the interactive Cypress app showing real-time test execution step-by-step:
  ```bash
  npm run cypress:open
  ```
* **Headless CLI Mode:**
  Runs the tests inside a headless electron browser. Ideal for Continuous Integration (CI) checks:
  ```bash
  npm run cypress:run
  ```

---

## 📂 Frontend Directory Structure

Here's an overview of the key folders in the frontend module:

```hl
interface/
├── cypress/                    # Cypress spec and support configuration files
│   └── e2e/                    # End-to-End test suites
│       └── auth_and_actions.cy.ts # Multi-role login & requisition spec tests
│
├── public/                     # Static media assets, icons, and favicons
│
├── src/                        # React Application Root Code
│   ├── api/                    # API Integration Layer
│   │   ├── client.ts           # Axios client instance with intercepters
│   │   ├── inventoryService.ts # Product, Stock, and Transaction API callers
│   │   └── types.ts            # TypeScript interfaces for API contracts
│   │
│   ├── assets/                 # SVGs and bundle-imported visual resources
│   │
│   ├── components/             # Reusable UI Components
│   │   ├── Layout/             # Layout templates (AppLayout, Sidebar, Header)
│   │   └── Shared/             # Common elements & Modal controls
│   │
│   ├── context/                # Global React Contexts
│   │   ├── AuthContext.tsx     # Session management and role authorization state
│   │   ├── ModalContext.tsx    # Central control for active transaction modals
│   │   └── ToastContext.tsx    # Real-time feedback snackbars
│   │
│   ├── pages/                  # Route-level Component Pages
│   │   ├── Dashboard.tsx       # Admin KPIs, Charts, and Analytics
│   │   ├── InventoryTracking.tsx# Warehouse locations & stock adjustments
│   │   ├── Login.tsx           # Authentication portal
│   │   ├── NewTransaction.tsx  # Sales processing interface
│   │   ├── ProductCatalog.tsx  # CRUD UI for inventory products
│   │   ├── Register.tsx        # Account registration
│   │   ├── ReportsAnalytics.tsx# Advanced data filters
│   │   └── UserHome.tsx        # Available item lists for standard employees
│   │
│   ├── App.css                 # Custom styling tokens and global styles
│   ├── App.tsx                 # Client routers and context providers
│   ├── index.css               # Core CSS & layout resets
│   └── main.tsx                # React entry point mounting App to HTML DOM
│
├── vite.config.ts              # Vite server & proxy configurations
└── package.json                # Project dependencies and script scripts
```

---

## 🛠️ Key Utilities & Context Hooks
- **`useAuth()`**: Access user information (name, username, role) and handle login/logout procedures.
- **`useModal()`**: Dynamically display and dismiss interactive popups (e.g., *Add Product*, *Stock In*, *Internal Requisitions*, *Location Transfer*).
- **`useToast()`**: Programmatically trigger system feedback banners (`success`, `error`, `info`, `warning`).
