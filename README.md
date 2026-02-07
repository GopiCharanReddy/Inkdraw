# 🎨 Inkdraw

**Inkdraw** is an open-source, real-time collaborative whiteboard application that empowers teams to brainstorm, sketch, and visualize ideas together seamlessly. Inspired by tools like Excalidraw, Inkdraw provides an infinite canvas where multiple users can collaborate in real-time.

## 🌟 Features

-   **Real-time Collaboration**: See changes instantly as other users draw on the board.
-   **Infinite Canvas**: A limitless workspace for all your diagrams and sketches.
-   **Drawing Tools**: Rectangles, circles, lines, arrows, freehand drawing, and text.
-   **Multi-user Support**: Collaborative sessions with multiple participants.
-   **Authentication**: Secure sign-up/login (Google OAuth, Email) via Better Auth.
-   **Persistence**: Drawings are saved and can be retrieved later.

## 🛠️ Tech Stack

This project is built as a monorepo using **Turborepo** for high-performance build system orchestration.

### **Apps**

*   **`apps/web`**: The frontend application built with:
    *   **Next.js 15+** (App Router)
    *   **TypeScript**
    *   **TailwindCSS** & **Radix UI** for styling
    *   **Zustand** for state management
    *   **Better Auth** for authentication
*   **`apps/server`**: The backend server handling:
    *   **Node.js** & **Express**
    *   **WebSockets (`ws`)** for real-time communication
    *   **Redis** (Pub/Sub) for scaling WebSocket connections
    *   **BullMQ** for background job processing
    *   **Cloudinary** for image storage

### **Packages** (Shared Libraries)

*   **`packages/db`**: Database client and schema management using **Prisma** & **PostgreSQL**.
*   **`packages/ui`**: Shared UI component library.
*   **`packages/schema`**: Shared Zod schemas for validation.
*   **`packages/typescript-config`**: Shared TypeScript configurations.
*   **`packages/eslint-config`**: Shared ESLint configurations.

## 🚀 Getting Started

Follow these steps to set up and run Inkdraw locally on your machine.

### Prerequisites

Ensure you have the following installed:

*   **Node.js** (v18 or higher)
*   **pnpm** (Package Manager) -> `npm install -g pnpm`
*   **Docker** (Optional, recommended for running PostgreSQL and Redis services)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/GopiCharanReddy/Inkdraw.git
    cd Inkdraw
    ```

2.  **Install dependencies:**

    From the root directory, run:

    ```bash
    pnpm install
    ```

### Environment Setup

You need to configure environment variables for both the web and server applications.

1.  **Database & Redis**: Ensure you have a PostgreSQL database and a Redis instance running. You can use Docker or a cloud provider (like Neon, Upstash).

2.  **Apps Configuration**:
    *   Copy `.env.example` to `.env` in `apps/web` and `apps/server` (if available, otherwise create one).

    **`apps/web/.env`**:
    ```env
    NEXT_PUBLIC_HTTP_URL="http://localhost:8080"
    NEXT_PUBLIC_WS_URL="ws://localhost:8080"
    BETTER_AUTH_SECRET=<YOUR_SECRET>
    BETTER_AUTH_URL=http://localhost:3000
    GOOGLE_CLIENT_ID=<YOUR_GOOGLE_ID>
    GOOGLE_CLIENT_SECRET=<YOUR_GOOGLE_SECRET>
    ```

    **`apps/server/.env`**:
    ```env
    PORT=8080
    DATABASE_URL="postgresql://user:password@localhost:5432/inkdraw"
    REDIS_URL="redis://localhost:6379"
    # Plus other service keys (Cloudinary, etc.)
    ```

### Database Setup

Initialize the database schema using Prisma (from the root):

```bash
pnpm db:generate
# If you need to push the schema to the DB
# pnpm db:push
```

### Running the Application

To start the entire development environment (Web, Server, etc.):

```bash
pnpm dev
```

This uses Turborepo to run `dev` scripts in parallel.

-   **Web App**: Open [http://localhost:3000](http://localhost:3000)
-   **Server API**: listening on [http://localhost:8080](http://localhost:8080)

## 🤝 Contributing

Contributions are always welcome!

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
