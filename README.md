🍽️ SmartServe AI Cloud Kitchen OS

An Enterprise-Grade AI-Powered Cloud Kitchen & Food Delivery Management Platform

SmartServe AI Cloud Kitchen OS is a full-stack, production-oriented cloud kitchen ecosystem built for modern restaurants, food chains, franchises, and enterprise food delivery operations.

The platform streamlines the complete food ordering lifecycle—from customer ordering and kitchen processing to rider delivery and founder-level business analytics—through a scalable microservice-inspired architecture with real-time communication.

🚀 Key Features
👥 Customer Application
📱 Mobile OTP Authentication (Twilio)
🍕 Smart Food Ordering
🛒 Cart & Secure Checkout
🎁 Coupons & Discount Engine
💰 Wallet & Rewards System
🚆 PNR-Based Train Food Ordering
📍 Live Order Tracking
⭐ Order History & Reorder
🔔 Real-Time Notifications
🏢 Founder & Enterprise Dashboard
📊 Business Analytics Dashboard
🏪 Franchise Management
💼 Revenue & Sales Reports
📦 Inventory Monitoring
👨‍🍳 Kitchen Performance Analytics
📈 Growth Metrics
👥 Employee Management
🚴 Rider Performance Tracking
🍳 Kitchen Operations
Incoming Order Queue
Live Kitchen Status
Order Preparation Workflow
Cooking Time Estimation
Inventory Updates
Kitchen Performance Dashboard
🚴 Rider Management
Rider Assignment
Live GPS Tracking
Route Optimization
Delivery Status Updates
Earnings Dashboard
Order History
⚡ Real-Time Features
Live Order Updates
Real-Time Kitchen Status
Rider Location Tracking
Instant Notifications
Socket.io Powered Communication
Auto Order Status Synchronization
🛠 Tech Stack
Category	Technologies
Frontend	React, TypeScript, Vite, Tailwind CSS
Backend	Node.js, Express.js
Database	MongoDB Atlas, PostgreSQL (Supabase)
Authentication	JWT, Twilio OTP
Payments	Razorpay
Maps	Google Maps Platform
Real-Time	Socket.io
State Management	Context API / Redux (if used)
API	REST API
🏗 System Architecture
                    Customer App
                          │
                          ▼
                 React + TypeScript
                          │
        ─────────────────────────────────
                     REST API
                          │
                          ▼
                 Express.js Server
        ┌────────────┬────────────┐
        ▼            ▼            ▼
 MongoDB Atlas   PostgreSQL    Socket.io
        │            │            │
        └────────────┴────────────┘
                     │
       Google Maps • Twilio • Razorpay
📂 Project Modules
📦 SmartServe
 ┣ 📂 client
 ┣ 📂 server
 ┣ 📂 admin-dashboard
 ┣ 📂 founder-dashboard
 ┣ 📂 kitchen-panel
 ┣ 📂 rider-panel
 ┣ 📂 shared
 ┣ 📂 api
 ┣ 📂 assets
 ┣ 📂 docs
 ┣ 📜 README.md
 ┗ 📜 package.json
📸 Screenshots

Replace the placeholders below with your actual application screenshots.

Customer App	Founder Dashboard

	
Kitchen Dashboard	Rider Panel

	
⚙ Installation
Prerequisites
Node.js 18+
MongoDB Atlas Account
PostgreSQL (Supabase)
Google Maps API Key
Twilio Account
Razorpay Account
Clone Repository
git clone https://github.com/Msharma1212/smartserve-ai-cloud-kitchen.git

cd smartserve-ai-cloud-kitchen
Install Dependencies
npm install
Configure Environment Variables

Create a .env file.

PORT=

MONGODB_URI=

SUPABASE_URL=
SUPABASE_KEY=

JWT_SECRET=

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_VERIFY_SERVICE_SID=

GOOGLE_MAPS_API_KEY=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
Start Development
npm run dev
🌐 Deployment

The application can be deployed on

Vercel (Frontend)
Render
Railway
AWS EC2
Docker
Nginx
🔒 Security Features
JWT Authentication
OTP Login
Secure Password Hashing
Protected API Routes
Role-Based Access Control (RBAC)
Environment Variable Protection
Input Validation
API Rate Limiting
📈 Future Enhancements
🤖 AI Demand Prediction
📦 Inventory Forecasting
🍔 AI Menu Recommendation
📞 AI Voice Ordering
📊 Predictive Sales Analytics
🚁 Drone Delivery Support
🌍 Multi-City Franchise Management
🌐 Multi-Language Support
👨‍💻 Developer

Mayank Sharma

💼 Full Stack Developer
🚀 AI & Cloud Solutions Enthusiast
💻 MERN Stack Developer

⭐ Support


GitHub: https://github.com/Msharma1212

If you found this project useful:

⭐ Star the repository

🍴 Fork the repository

🐞 Report issues

🤝 Contribute to the project

📄 License

This project is intended for educational, demonstration, and portfolio purposes. Commercial use requires prior permission from the author.



