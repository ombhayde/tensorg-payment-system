# E-commerce Payment & Notification System

This project is a full-stack web application built for an assessment by TensorGo. It demonstrates a complete e-commerce flow, including user authentication, product display, payment processing via Stripe, and email notifications to a super admin upon successful purchase.

-----

## 🎥 Project Demonstration

  * **Live Functionality Demo:** `[Link to Your Demonstration Video]`
  * **Code Walkthrough Video:** `[Link to Your Code Walkthrough Video]`

-----

## ✨ Features

  * **Google OAuth 2.0:** Secure user sign-in and session management using Passport.js.
  * **Product Homepage:** A clean, responsive UI displaying products available for purchase.
  * **Stripe Payment Gateway:** Integration with Stripe for secure, testable payment processing.
  * **Email Notifications:** Automated email notifications are sent to a super admin upon successful payment using Nodemailer.
  * **Admin Dashboard:** A protected route for the super admin to view a complete history of all sales, including user, product, and date.

-----

## 🛠️ Tech Stack

  * **Frontend:** React, Vite, Axios
  * **Backend:** Node.js, Express.js
  * **Database:** MongoDB with Mongoose
  * **Authentication:** Passport.js (Google OAuth 2.0 Strategy)
  * **Payment Gateway:** Stripe
  * **Email Service:** Nodemailer

-----

## 🚀 Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

  * Node.js (v18 or later)
  * npm
  * Git

### Installation & Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/your-repository-name.git
    cd your-repository-name
    ```

2.  **Backend Setup:**

    ```bash
    # Navigate to the server directory
    cd server

    # Install dependencies
    npm install

    # Create a .env file and add your environment variables (see below)
    # Start the backend server
    npm start
    ```

    The backend will run on `http://localhost:3000`.

3.  **Frontend Setup:**

    ```bash
    # Navigate to the client directory from the root folder
    cd client

    # Install dependencies
    npm install

    # Create a .env file and add your environment variables (see below)
    # Start the frontend development server
    npm run dev
    ```

    The frontend will run on `http://localhost:5173`.

-----

## 🔑 Environment Variables

You need to create `.env` files in both the `server` and `client` directories.

#### 1\. Backend (`server/.env`)

```env
# Google OAuth Credentials
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET

# MongoDB Atlas Connection String
MONGO_URI=YOUR_MONGODB_CONNECTION_STRING

# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_...YOUR_STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_...YOUR_STRIPE_WEBHOOK_SECRET

# Session & App Config
SESSION_SECRET=YOUR_RANDOM_SESSION_SECRET
CLIENT_URL=http://localhost:5173
SUPER_ADMIN_EMAIL=your-super-admin-email@example.com

# Nodemailer (Gmail App Password)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=YOUR_16_CHARACTER_GMAIL_APP_PASSWORD
```

#### 2\. Frontend (`client/.env`)

```env
# The URL of your backend server
VITE_API_URL=http://localhost:3000
```

**Note:** Remember to also add your Stripe **Publishable Key** directly in the `client/src/pages/HomePage.jsx` file.
