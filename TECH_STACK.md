# Technology Stack - Weedy Frontend

This document outlines the technology stack used in the Weedy frontend application, highlighting the tools responsible for the user interface, logic, and infrastructure.

## 🎨 User Interface & Aesthetics (Frontend Looks)

The following technologies are the primary drivers of the application's visual style and user experience:

*   **Tailwind CSS**: **Primary UI Framework.** Responsible for the entire visual layout, styling, responsive design, and modern "premium" aesthetics using utility-first CSS.
*   **React 18**: The core UI library used to build interactive, component-based interfaces.
*   **Lucide React**: High-quality, consistent icon set providing modern visual cues throughout the app.
*   **Tailwind Animate & Framer Motion**: Powering fluid transitions and interactive micro-animations to enhance user engagement.

## 🛠️ Core Logic & Infrastructure

The underlying foundations that ensure stability, performance, and reliability:

*   **TypeScript**: Ensures strict type safety across the codebase, reducing bugs and improving developer productivity.
*   **Vite**: A next-generation frontend tool providing an extremely fast development environment and optimized production builds.
*   **Zustand**: A lightweight, fast state management solution used for authentication (`authStore`), global notifications (`toastStore`), and legal consent tracking (`legalStore`).
*   **React Hook Form + Zod**: Handles complex form states and provides schema-based validation for user inputs.
*   **Axios**: The standard HTTP client used for robust communication with the backend REST API.
*   **Vitest**: The testing framework used for unit and component testing to maintain application quality.
*   **Cloudinary**: Third-party cloud service for permanent and optimized storage of all dispensary images and user avatars.
*   **Wrangler**: CLI tool used for seamless deployment to Cloudflare Pages.

---

*Last Updated: March 2026*
