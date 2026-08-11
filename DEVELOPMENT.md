# Development, Security & Deployment Guide — Duaa Academy

This document outlines the development structure, step-by-step deployment process, security architecture, and performance optimization guidelines for the **Duaa Academy** platform.

---

## 1. Technical Stack Overview
- **Framework**: Next.js (App Router)
- **Database**: MongoDB (via Mongoose)
- **Authentication**: NextAuth.js (Credentials Provider with JWT Strategy)
- **Validation**: Zod (Type-safe request body validation)
- **AI Integration**: Gemini Pro API (Multimodal and text-chunking PDF/DOCX MCQ parser)
- **Styling**: Vanilla CSS with Tailwind components

---

## 2. Step-by-Step Deployment Guide

We recommend deploying the Next.js application on **Vercel** and hosting the database on **MongoDB Atlas** for optimal performance, scaling, and simplicity.

### Phase A: Setup MongoDB Atlas (Database)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and log in or create an account.
2. Click **Create** to spawn a new database cluster (select the Free tier, e.g., Shared in AWS/us-east-1).
3. **Database Access Configuration**:
   - Create a database user (e.g., `dua_db_user`).
   - Choose a secure password and save it securely.
4. **Network Access Configuration**:
   - Click **Network Access** in the left menu.
   - Click **Add IP Address**.
   - Choose **Allow Access from Anywhere** (`0.0.0.0/0`) since Vercel utilizes dynamic server IPs, or use a VPC peering setup if on enterprise.
5. **Get Connection String**:
   - Go to the **Database** tab under Deployment.
   - Click **Connect** on your cluster.
   - Select **Drivers** (Node.js).
   - Copy the connection string. It will look like:
     `mongodb+srv://dua_db_user:<password>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority`
   - Replace `<password>` with your database user password, and add a database name (e.g. `duaa_academy`) right before `?retryWrites=true`.

---

### Phase B: Deploy to Vercel (Frontend & Serverless Functions)
1. Commit and push your local repository to a git hosting service (GitHub, GitLab, or Bitbucket).
2. Go to [Vercel](https://vercel.com/) and log in.
3. Click **Add New** -> **Project**.
4. Import your repository from Git.
5. **Configure Project Settings**:
   - **Project Name**: `duaa-academy`
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`
6. **Environment Variables**:
   Fill in each field in the environment variable section exactly as shown below:

| Field Name | Description | Example / Recommended Value |
| :--- | :--- | :--- |
| `MONGODB_URI` | MongoDB Atlas Connection String | `mongodb+srv://dua_db_user:password@cluster0.xxxx.mongodb.net/duaa_academy?retryWrites=true&w=majority` |
| `NEXTAUTH_SECRET` | Secret key used to sign NextAuth JWT session tokens | Run `openssl rand -base64 32` in your local terminal to generate a secure random string. |
| `NEXTAUTH_URL` | The base URL of your deployed application | `https://duaa-academy.vercel.app` (or your custom domain `https://dua.com`) |
| `GEMINI_API_KEY` | Google AI API Key for parsing PDF/DOCX files | Obtain from [Google AI Studio](https://aistudio.google.com/) |
| `NEXT_PUBLIC_APP_URL` | Client-accessible URL for requests | `https://duaa-academy.vercel.app` |

7. Click **Deploy**. Vercel will build, optimize, and launch your application globally.

---

## 3. Security Architecture

Duaa Academy implements multiple defense layers to protect student data and prevent administrative bypasses:

### 1. Role-Based Access Control (RBAC)
- Private views under `src/app/admin/` and `src/app/student/` are protected using server-side session checks via `getServerSession`.
- API endpoints are protected using `secureRouteHandler(req, { allowedRoles: [...] })` which decodes the JWT and validates the user role before performing any operation.

### 2. Password Security & Lockout System
- Passwords are encrypted using **bcryptjs** with `12` salt rounds.
- **Brute-force protection**: If a user submits an incorrect password 5 consecutive times, their account is locked for **15 minutes** (controlled by `lockUntil` in MongoDB). Successful login resets the attempts.

### 3. Zod Input Sanitization
- Every request payload submitted to backend API endpoints (e.g. MCQ creation, Test saving, registration) is verified against a strict Zod schema. Extra or modified keys are automatically discarded.

---

## 4. Performance & Efficiency Optimizations

To ensure the platform handles traffic quickly and stays highly responsive:

### 1. Global Connection & Seeding Cache
- MongoDB connection is cached using global states (`src/lib/dbConnect.ts`).
- Seeding tasks in `src/lib/seed.ts` are globally marked as completed. This prevents costly queries like database counts or drops from executing on every hot-reload or page render.

### 2. Fetch Limits & Dynamic Loading
- The test builder dynamically requests up to `1000` MCQs only when needed, while the main MCQ Bank interface handles pagination (fetching 50 per page) to reduce the initial payload size.
- Static assets like local logo variants are served directly from the public root to prevent Next.js redirection overhead.

---

## 5. Deployment & Performance FAQs

### 1. What if I don't have a custom domain or `NEXTAUTH_URL` yet?
- **Auto-detection**: If deploying on Vercel, you can omit the `NEXTAUTH_URL` environment variable. NextAuth.js will automatically detect the Vercel deployment URL (`VERCEL_URL`) and configure itself.
- **Custom Domains**: Once you buy a custom domain (e.g. `duaa.academy`) and link it to Vercel, you should add `NEXTAUTH_URL` with your domain value under Vercel project settings to ensure redirection links use the canonical domain.

### 2. PWA Icon & Link Previews
- The platform uses `/logo.png` (512x512 gold and sapphire branding) for both the PWA home screen icon and link previews.
- Metadata is pre-configured with OpenGraph and Twitter cards in `src/app/layout.tsx` so sharing the site link on WhatsApp, Facebook, or SMS automatically generates a rich logo card and academy preview.

### 3. Execution Timings
The codebase has been highly optimized to run database queries efficiently:
- **Login validation**: 100ms - 200ms (database lookup + bcrypt password verification).
- **Fetching tests**: 50ms - 150ms (direct query with cached DB connections).
- **Submitting tests & generating results**: 100ms - 300ms (saves user attempts, calculates scores, and caches results instantly).

### 4. Vercel Free Tier Limits & Concurrency
- **Concurrent Users**: Vercel Serverless Functions on the Hobby (Free) tier can handle **hundreds of concurrent requests**. The actual limit is governed by the serverless execution limit (up to 1,000 concurrent executions) and your MongoDB database tier connections.
- **Bandwidth**: 100 GB of transfer per month, which is highly sufficient for thousands of students viewing text assessments, scores, and static pages.
- **Testing in Batches**: If you conduct live tests where 100-300 students log in *at the exact same second*, the free tier of Vercel will handle it easily. However, ensure your MongoDB tier is scaled (e.g. Shared M0/M10 Atlas instance) to allow enough concurrent database connections.
