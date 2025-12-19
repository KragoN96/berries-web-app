# Berries - Lost & Found Web App 🔍
> **A dedicated community platform for students to report and recover lost items across Romanian Universities.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/Frontend-React-61dafb.svg?style=flat&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933.svg?style=flat&logo=nodedotjs)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248.svg?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![Status](https://img.shields.io/badge/Status-Active-brightgreen.svg)]()

---

## 📋 Project Overview
**Berries** is a full-stack web application designed to help students at Romanian Universities (UPB, UB, ASE, etc.) recover lost items. It provides a centralized hub where "Finders" can post items and "Owners" can browse reports or get notified to reclaim their belongings. 

The app includes advanced security features like **IP Tracking** to ensure the integrity of reports and **Automated Emailing** for secure password resets.

## ✨ Core Features
- **Item Reporting**: Effortlessly post found items with image uploads powered by **Cloudinary**.
- **University Filters**: Browse items by specific Romanian academic institutions.
- **Secure Authentication**: User registration and login protected by **JWT** and **BcryptJS** hashing.
- **IP Tracking & Analytics**: Automatic tracking of user location (City, Region, Country) for security and admin stats via `ipinfo.io`.
- **Password Recovery**: Automated email reset system using **Nodemailer** and secure SMTP.
- **Responsive Navigation**: Full-screen mobile menu with sections for News, Account, and Donations.

## 🏗️ Technical Architecture
The application uses a robust MERN-adjacent stack with third-party API integrations:

| Layer | Technology | Key Dependencies |
| :--- | :--- | :--- |
| **Frontend** | React.js | `react-router-dom`, `AuthContext` |
| **Backend** | Node.js / Express | `jsonwebtoken`, `bcryptjs`, `cors` |
| **Database** | MongoDB | `mongoose`, `MongoClient` |
| **Media** | Cloudinary | `multer`, `cloudinary` |
| **Email** | SMTP Service | `nodemailer` |
| **Security** | IP Tracking | `ipinfo.io` API |

## 🚀 Installation

### Clone the repo
- git clone [https://github.com/KragoN96/berries-web-app.git](https://github.com/KragoN96/berries-web-app.git)

### Setup Backend
- cd Backend
- npm install
- npm start

### Setup Frontend
- cd ../src
- npm install
- npm start

## 📂 Key Repository Highlights

- Backend/server.js: Core API logic handling Auth, IP Tracking, and Database connections.
- Backend/lost_items/: Dedicated routes and controllers for item management.
- src/context/AuthContext.jsx: Global state management for user sessions.
- src/hooks/useIPTracker.jsx: Custom hook for real-time user location fetching.

## 🤝 Contributing

- Contributions are welcome! If you'd like to add a new university or faculty to the list:
- Fork the Project.
- Create your Feature Branch.
- Open a Pull Request.

## 📄 License

This project is licensed under the MIT License.
