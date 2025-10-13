# ☕ Coffee Website Backend

A fully functional backend for a Coffee Ordering Website built with **Node.js**, **Express.js**, and **MongoDB**.  
It includes authentication, cart management, product handling, order management, and email verification.

---

## 🚀 Features

- **User Authentication** (Signup, Login, Email Verification, JWT Auth)
- **Product Management**
- **Cart Management** (Add/Remove Items, Calculate Prices)
- **Order Management** (Send Order to Admin, Store Current Prices)
- **Email Verification System**
- **Data Validation for Product Options**
- **Reusable Utility Functions**
- **Error Handling Middleware**

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-------------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB (Mongoose) |
| Authentication | JWT |
| Email Service | Nodemailer |
| Environment Config | dotenv |

---

## 📁 Folder Structure

```
📦 Coffee-Website-Backend
├── 📂 config/            # Database & email configuration
├── 📂 controllers/       # Handles route logic (auth, cart, order, etc.)
├── 📂 middleware/        # Auth checks, error handlers
├── 📂 models/            # Mongoose schemas
├── 📂 routers/            # Express routes
├── 📂 utility_Function/             # Helper functions
│   ├── compareOptions.js
│   ├── validateOptions.js
│   └── getVerificationTemp.js
├── server.js             # Main entry point
├── .env                  # Environment variables
└── package.json
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository
```bash
git clone https://github.com/M-HassanJavaid/Coffee-Website-Backend.git
cd Coffee-Website-Backend
```

### 2️⃣ Install dependencies
```bash
npm install
```

### 3️⃣ Create `.env` file
Add your environment variables in a `.env` file:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
BASE_URL=http://localhost:5000
```

### 4️⃣ Run the server
```bash
npm start
```
The server will start on **http://localhost:5000**.

---

## 🧩 API Endpoints (Overview)

### 🔐 Auth Routes
| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/verify/:token` | Verify email |
| POST | `/api/auth/getVerificationEmail` | send verification email |

### 🛍️ Product Routes
| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get single product |

### 🛒 Cart Routes
| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | `/api/cart/add` | Add product to cart |
| GET | `/api/cart` | Get user cart |
| DELETE | `/api/cart/:id` | Remove item from cart |

### 📦 Order Routes
| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | `/api/orders/create` | Create new order |
| GET | `/api/orders/user` | Get user orders |
| GET | `/api/orders/admin` | Get all orders (Admin only) |

---

## 🧠 Utility Functions

### 🟢 `compareOptions(arr1, arr2)`
Compares two arrays of selected product options and checks if they match by both name and value.

### 🟡 `validateOptions(orderedOptions, productId)`
Validates selected product options:
- Ensures all required fields are filled.
- Prevents extra/invalid options.
- Calculates total extra price.
- Returns validation status and messages.

### 🟤 `getVerificationTemp(verificationLink)`
Returns a **styled HTML email template** used for email verification links.

---

## 🧾 Example `.env` File

```env
PORT=5000
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/coffee
JWT_SECRET=mysecretkey
EMAIL_USER=coffeeapp@gmail.com
EMAIL_PASS=app-password
BASE_URL=http://localhost:5000
```

---

## 🧑‍💻 Author

**Hassan Javaid**  
📧 [GitHub Profile](https://github.com/M-HassanJavaid)  
💼 Website Developer | MERN satck | Backend & Frontend Developer

---

## 📜 License

This project is licensed under the **MIT License** – feel free to use and modify it!
