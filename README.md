![image](https://github.com/user-attachments/assets/84a39414-7836-4a38-9721-bce9fab7ff3e)
![image](https://github.com/user-attachments/assets/d272c565-0cfe-4198-b146-25828a8a701b)
![image](https://github.com/user-attachments/assets/d48ac14e-4747-4781-b9eb-36b90cfb6057) ![86C24D78-46C3-4106-A59C-84DE6150ADBF](https://github.com/user-attachments/assets/ae4da05e-0ea2-4ad0-8e56-2e6d7974637d)
![image](https://github.com/user-attachments/assets/2f03fd4b-c526-4d46-932b-c0fd103de75b)
![image](https://github.com/user-attachments/assets/4e0bfe7e-eec4-420b-930e-7ced02feecf9)
![image](https://github.com/user-attachments/assets/41d60852-cbf6-4405-9bc9-866d45051541)
![image](https://github.com/user-attachments/assets/0a757ea3-0e61-4e08-ba2a-77d733526624)

# Iglu Ice Cream POS Billing Application

## Introduction
The **Iglu Ice Cream POS Billing Application** is a point-of-sale (POS) system tailored for ice cream parlors. Designed with flexibility, any ice cream shop can use this application to manage billing, orders, sales tracking, employee management, and coupon handling. The system features a user-friendly interface, robust backend processing, and insightful sales analytics, empowering business owners to make informed decisions.

## Features
- **Billing System**: Generates detailed bills for customer purchases.
- **Order Management**: Add ice creams and addons to orders.
- **Kitchen Order Tab**: Manages all kitchen orders efficiently.
- **Last Orders**: Keeps a record of recent transactions.
- **User Management**: Separate logins for store owners and employees.
  - Store login allows adding and managing employees.
- **Bulk Upload**: Ice cream items can be uploaded in bulk for each new store.
- **Coupons**: Create, edit, or delete discount coupons.
- **Dashboard**:
  - Displays total sales and previous sales.
  - Pie chart showcasing top-selling ice creams.
  - Bar chart tracking total revenue and items sold daily.
  - Order Report and Detailed Report available for download for the selected dates

## Tech Stack
- **Frontend**: Next.js with TypeScript
- **Authentication**: NextAuth
- **Database**: MySQL (hosted on Aiven) with Prisma ORM
- **Caching**: TanStack Query (React Query) for efficient data fetching
- **State Management**: React Hooks (`useState`, `useEffect`)
- **UI Styling**:
  - Tailwind CSS for styling
  - ShadCN UI for enhanced design components
- **Visualization**:
  - `recharts` for bar and pie charts
  - `chart.js` for additional data visualization
- **Server Actions**: Used for database interactions
- **Responsive Design**: Mobile-friendly layout for easy access on any device

## Deployment
The application is deployed on **Vercel**, ensuring high availability and performance.

## Architectural Overview
The architecture of the Iglu POS Billing System follows a modular and scalable design:
1. **Frontend**:
   - Built with Next.js for server-side rendering (SSR) and improved SEO.
   - Modular UI components ensure maintainability and scalability.
   - Optimized state updates to re-render only necessary parts of the application.
2. **Backend**:
   - Uses **Prisma** to interact with MySQL for structured data management.
   - **NextAuth** manages user authentication securely.
   - **Server Actions** efficiently handle database updates and mutations.
3. **Caching and Performance**:
   - **TanStack Query** ensures fast and optimized data retrieval.
   - Next.js caching strategies enhance performance.
4. **Data Visualization**:
   - Recharts and Chart.js display sales insights and business analytics.

---
This POS system is actively used by **Iglu** and is adaptable for any ice cream shop seeking an efficient billing and management solution.


