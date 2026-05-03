# PromptForge Backend

Welcome to the **PromptForge Backend**! This is the core API and server architecture powering the PromptForge AI marketplace—a platform where creators can buy, sell, and discover high-quality system prompts for leading AI models like GPT-4, Claude, Gemini, and Midjourney.


> **[Client side repo](https://github.com/samwaseee/promtforge-frontend)**

## 📋 Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Core Mechanics](#core-mechanics)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Structure](#api-structure)

---

## 📖 Overview

PromptForge is designed to act as a secure, high-performance intermediary between prompt engineers and buyers. The backend handles the ingestion of secure prompt text, complex marketplace search and filtering, review generation, user wallet/payout management, and robust administrative capabilities to moderate the platform.

---

## ✨ Key Features

* **Multi-Model Support:** Built-in categorizations for `GPT4`, `CLAUDE`, `GEMINI`, and `MIDJOURNEY`.
* **Secure Prompt Delivery:** Employs a "Secure Blur Fix" that dynamically replaces actual prompt content with a localized safe string for unpaid previews, completely protecting prompt IP from network inspection.
* **Smart Testimonial Engine:** Utilizes the **Jaccard Index** text similarity algorithm to dynamically filter and serve diverse 5-star reviews to the frontend, preventing repetitive or spammy testimonials.
* **Role-Based Access Control (RBAC):** Distinct `BUYER`, `SELLER`, and `ADMIN` user roles.
* **Admin Moderation:** Dedicated queues and endpoints for admins to review, approve, or reject newly uploaded prompts.
* **Financial Tracking:** Tracks `Orders` (amount paid, platform fees, seller earnings) and `Payouts` to seller wallets (`stripeAccountId` integration).

---

## 🛠 Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js (Implied REST architecture)
* **ORM:** Prisma Client
* **Cloud Storage:** Google Cloud Storage (GCS) for robust image and asset hosting (resumable uploads & ACL management).
* **Security & Utility:** `node-forge` for advanced cryptographic functions and `defu` for secure default property assignments.

---

## 📁 Project Structure

```text
promptforge-backend/
├── prisma/
│   ├── schema.prisma      # Database schema and models
│   └── migrations/        # Database migration history
├── src/
│   ├── controllers/       # Route request handlers (prompts, reviews, admin)
│   ├── middlewares/       # Express middlewares (JWT auth, RBAC, error handling)
│   ├── routes/            # Express route definitions
│   ├── services/          # Business logic (Secure Blur, Jaccard Index, Stripe)
│   ├── utils/             # Helper functions (cryptography, text parsing)
│   └── index.js           # Application entry point and server setup
├── .env                   # Environment variables
├── package.json           # Project dependencies and scripts
└── README.md              # Project documentation
```

---

## 🗄 Database Schema

The database is heavily optimized and strictly typed using Prisma. Core models include:

* **User:** Tracks roles, secure credentials, `stripeAccountId`, and their current `walletBalance`.
* **Prompt:** The digital asset. Contains title, description, `promptContent`, price, `AIModel` type, category, and `PromptStatus` (`PENDING`, `APPROVED`, `REJECTED`).
* **Order:** Financial ledger tracking purchases. Connects a Buyer and a Prompt. Tracks `amountPaid`, `platformFee`, `sellerEarnings`, and `OrderStatus` (`PENDING`, `PAID`, `FAILED`, `REFUNDED`).
* **Review:** 1-5 star ratings combined with text comments left by buyers on purchased prompts.
* **Payout:** Tracks ledger events where seller earnings are transferred to their real-world bank accounts.
* **SystemLog:** Auditing trail for tracking critical system and admin actions.

---

## ⚙️ Core Mechanics

### The "Secure Blur" Content Protection
When fetching a single prompt's details publicly (`getPromptById`), the real `promptContent` is stripped and replaced with a fake string containing repetitive block characters (`█`). This ensures that even if a user inspects the raw XHR/Fetch network request in their browser, they cannot steal the prompt content before a verified purchase.

### Intelligent Review Filtering
The `/reviews/featured` endpoint doesn't just pull the latest 8 reviews. It pulls a large candidate pool of 50 reviews, strips them down to base word sets, and uses a Jaccard Index calculation to guarantee that no two reviews displayed on the homepage have more than a 40% word overlap. This ensures maximum marketing impact by showcasing diverse user opinions.

### Wallet & Payout Management
Sellers accumulate a `walletBalance` as their prompts are purchased. The system automatically calculates the `platformFee` and credits the remainder to the seller's internal wallet. Through integration with Stripe Connect (`stripeAccountId`), sellers can seamlessly trigger a `Payout` to transfer their earned balance directly to their real-world bank accounts, logged securely in the `SystemLog`.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- PostgreSQL Database (or supported Prisma SQL equivalent)
- Google Cloud Project (for Storage bucket access)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YourOrg/promptforge-backend.git
   cd promptforge-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

4. **Run Database Migrations:**
   ```bash
   npx prisma migrate dev
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory. You will need the following parameters:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/promptforge?schema=public"

# Authentication & Security
JWT_SECRET="your_jwt_secret_here"

# Google Cloud Storage
GCS_PROJECT_ID="your_gcp_project_id"
GCS_CLIENT_EMAIL="your_service_account_email"
GCS_PRIVATE_KEY="your_gcp_private_key"
GCS_BUCKET_NAME="your_storage_bucket_name"

# Payment Processing (Stripe)
STRIPE_SECRET_KEY="your_stripe_secret_key"
```

---

## 📡 API Structure

### Authentication
Protected endpoints (such as prompt creation, purchasing, and admin moderation) require a valid JSON Web Token (JWT). Pass the token in the request headers:
```http
Authorization: Bearer <your_jwt_token>
```

*A brief overview of the currently exposed endpoints:*

### Prompts (`/api/prompts`)
- `GET /` - Explore marketplace (Supports pagination, search, category, AI model, and price sorting).
- `GET /:id` - Get individual prompt details (Content protected unless authenticated buyer).
- `POST /` - Create a new prompt (Requires `SELLER` role. Defaults to `PENDING` status).
- `PUT /:id` - Update existing prompt details (Protected to prompt creator).

### Reviews (`/api/reviews`)
- `GET /featured` - Fetch top 8 highly-diverse, 5-star testimonials.

### Admin (`/api/admin`)
- `GET /prompts/pending` - Fetch a queue of all prompts awaiting moderation.
- `PUT /prompts/:id/status` - Approve or reject a pending prompt.

---

*Developed with ❤️ for the PromptForge Community.*