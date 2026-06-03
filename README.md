# IQM System — Inventory & Quotation Management

Welcome to the **IQM System**! This is a simple but powerful B2B (Business-to-Business) marketplace built for a hackathon. 

It works just like a wholesale Amazon: Sellers can list bulk products (like food ingredients or chemicals), Admins make sure the products are legitimate, and Buyers can purchase those products in flexible quantities (like buying 500 grams of a product sold in kilograms).

---

## How It Works (The Core Flow)

The application has a smart, 4-step workflow:

1. **Sellers List Products:** A Seller logs in and submits a new product they want to sell (for example, 200 kg of Turmeric). 
2. **Admins Approve Listings:** The product doesn't go live immediately. An Admin reviews the submission. Once the Admin clicks "Approve", the product appears in the public catalog.
3. **Buyers Shop & Request Orders:** A Buyer browses the catalog, adds items to their cart, and requests an order (a "Quotation"). The system is smart enough to handle unit conversions automatically. If a seller listed a product in **Kilograms**, the buyer can still choose to order in **Grams**. The system handles the math!
4. **Sellers Fulfill Orders:** The original Seller receives the order request. Once they click "Approve", the system automatically deducts the exact amount of stock from the database. If the stock hits zero, the product is automatically hidden from the catalog.

---

## Tech Stack

This project was built using modern, industry-standard tools:

* **Frontend:** Next.js (React) & Tailwind CSS for a beautiful, responsive user interface.
* **Backend:** Next.js API Routes (Serverless backend to handle logic and math securely).
* **Database:** PostgreSQL (hosted on Neon) using **Prisma ORM** to keep data structured and prevent errors.
* **Security:** NextAuth.js to handle secure logins and make sure users can only see what they are allowed to see.

---

## Test Credentials

You can log in and test the different roles using these accounts:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@iqm.com | Admin@123 |
| **Seller/Buyer** | seller@iqm.com | Seller@123 |

*(Note: In this system, any registered user can act as both a Buyer and a Seller!)*

---

## How to Run the Project Locally

Follow these simple steps to run the application on your own computer:

### 1. Install Dependencies
Open your terminal, navigate to the project folder, and run:
```bash
npm install
```

### 2. Set Up Environment Variables
Create a file named `.env` in the root of the project and add the following lines. (You will need to get a free PostgreSQL database URL from [Neon.tech](https://neon.tech)):

```env
DATABASE_URL="postgresql://your_db_user:your_db_password@your_neon_url.neon.tech/neondb?sslmode=require"
NEXTAUTH_SECRET="any_random_secure_password_string_here"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Setup the Database
Run this command to create the necessary tables in your database:
```bash
npm run db:push
```

### 4. Add Dummy Data (Optional)
Run this command to populate your database with the Admin account and some sample products so the app isn't empty:
```bash
npm run db:seed
```


---

