# 🎨 Inkdraw (Web)

Welcome to the frontend web application for **Inkdraw**, a real-time collaborative whiteboard drawing tool. This project is built using **Next.js**, **React**, and **TailwindCSS**, offering a seamless and interactive experience for users to draw, share, and collaborate.

## 🚀 Key Features

- **Real-time Collaboration**: Draw on a shared canvas with multiple users simultaneously using WebSocket connections.
- **Intuitive Drawing Tools**: Create shapes (rectangles, circles), lines, text, and freehand drawings.
- **Secure Authentication**: User sign-up and login powered by **Better Auth**, including Google OAuth support.
- **Responsive Design**: A modern, mobile-friendly interface built with **TailwindCSS** and **Radix UI**.
- **High Performance**: Optimized with **Next.js** for fast server-side rendering and static generation.

## 🛠️ Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (React Framework)
- **Styling**: [TailwindCSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Authentication**: [Better Auth](https://www.better-auth.com/)
- **Real-time**: WebSocket (connected to a separate backend server)
- **Database**: PostgreSQL (via Prisma)
- **Deployment**: Configured for deployment on platforms like [Render](https://render.com/).

## 📦 Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js** (v18 or higher)
- **pnpm** (Package Manager)
- **Docker** (Optional, for running local database/backend services)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/GopiCharanReddy/Inkdraw.git
    cd Inkdraw
    ```

2.  **Install dependencies** (from the root of the monorepo):
    ```bash
    pnpm install
    ```

3.  **Environment Setup:**
    Navigate to the `apps/web` directory and create a `.env` file based on `.env.example`:
    ```bash
    cd apps/web
    cp .env.example .env
    ```

    Update the `.env` file with your configuration:
    ```env
    # Server & WebSocket Configuration
    NEXT_PUBLIC_HTTP_URL="http://localhost:8080"
    NEXT_PUBLIC_WS_URL="ws://localhost:8080"

    # Authentication (Better Auth)
    BETTER_AUTH_SECRET=<YOUR_SECRET>
    BETTER_AUTH_URL=<YOUR_APP_URL> # e.g., http://localhost:3000

    # OAuth Providers (Google)
    GOOGLE_CLIENT_ID=<YOUR_GOOGLE_CLIENT_ID>
    GOOGLE_CLIENT_SECRET=<YOUR_GOOGLE_CLIENT_SECRET>

    # Database
    DATABASE_URL=<YOUR_DATABASE_URL>
    ```

### Running the Application

To start the development server for the web application:

```bash
# From the root directory (recommended for monorepo workflow)
pnpm run dev --filter web

# OR directly from the apps/web directory
cd apps/web
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to verify the installation.

## 📂 Project Structure

This project is part of a Turborepo monorepo. The web application structure is as follows:

- `app/`: Next.js App Router pages and layouts.
- `components/`: Reusable React components.
- `draw/`: Core drawing logic and canvas manipulation.
- `lib/`: Utility functions and shared helpers.
- `public/`: Static assets.

## 🤝 Contributing

Contributions are welcome! Please ensure you follow the coding standards and project guidelines when submitting pull requests.

## 📄 License

This project is licensed under the MIT License.
