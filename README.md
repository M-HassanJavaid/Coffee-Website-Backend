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
├── 📂 middleware/        # Auth checks, error handlers
├── 📂 models/            # Mongoose schemas
├── 📂 routers/           # Express routes
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
| GET | `/api/auth/verifyEmail` | Verify email |
| GET | `/api/auth/getVerificationEmail` | send verification email |
| GET | `/api/auth/refreshToken` | Refresh Authentication token |
| GET | `/api/auth/logout` | Logout User |
| PUT | `/api/auth/changePassword` | Change Password |


### 🛍️ Product Routes
| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/api/product/all` | Get all products |
| GET | `/api/product/id/:id` | Get single product |
| POST | `/api/product/add` | Add product by only admin |
| PUT | `/api/product/edit/:id` | Edit product details by admin |
| DELETE | `/api/delete/:id` | Delete a product by admin |
| PUT | `/api/product/click/:productId` | Update impressions on product |
| GET | `/api/product/:quantity` | Get Popular products |



### 🛒 Cart Routes
| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | `/api/cart/add` | Add product to cart |
| GET | `/api/cart/me` | Get user cart |
| DELETE | `/api/cart/remove/:cartItemId` | Remove item from cart |
| PUT | `/api/cart/update/:cartItemId` | Update Cart item |
| DELETE | `/api/cart/clear` | Clear user cart


### 📦 Order Routes
| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | `/api/order/checkout` | Create new order from cart |
| GET | `/api/order/me` | Get user all orders by users |
| GET | `/api/order/all` | Get all orders (Admin only) |
| PUT | `/api/order/cancel/:orderId` | Cancel order by user |
| GET | `/api/order/me/:orderId` | get user single order by user |
| PUT | `/api/order/update/:orderId` | Update order by admin |

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
DB_USER= "Your database username"
DB_PASSWORD= "Database password"
DB_NAME= "Database name"
PORT= "Your port"
ADMIN_KEY= "Admin key for signup as admin"
EMAIL_USER= "User email"
EMAIL_PASS= "User email pass"
JWT_SECRET= "jwt token secret"
CLOUD_NAME= "cloudinary cloud name"
CLOUD_API_KEY= "cloudinary api key"
CLOUD_API_SECRET= "cloudinary api secret"
```

---

## 🧑‍💻 Author

**Hassan Javaid**  
📧 [GitHub Profile](https://github.com/M-HassanJavaid)  
💼 Website Developer | MERN satck | Backend & Frontend Developer

---

## 📜 License

This project is licensed under the **MIT License** – feel free to use and modify it!
