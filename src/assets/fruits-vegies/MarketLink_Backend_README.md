# MarketLink Backend

## Purpose

Build **only the backend** for MarketLink, a full-stack local farmers-market platform.

The backend must provide the complete REST API, database layer, authentication, authorization, marketplace functionality, and AI assistant required for a separate React + TypeScript frontend.

**Do not build the React frontend.**

---

## Technology Stack

Use:

- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose
- JWT authentication
- bcrypt/password hashing
- REST API
- dotenv
- CORS
- Proper validation and error handling

Recommended structure:

```text
backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   │   └── ai/
│   ├── types/
│   ├── utils/
│   └── server.ts
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

Keep the architecture modular and scalable. Do not put all logic inside `server.ts`.

---

# 1. Authentication & Authorization

Support three roles:

```text
customer
farmer
admin
```

Implement:

- Customer registration
- Farmer registration
- Login
- JWT authentication
- Password hashing with bcrypt
- Protected routes
- Role-based authorization
- Profile retrieval
- Profile updates
- Password updates
- Account status handling

### Customer registration

Support:

- Name
- Contact number
- Email
- Address
- Password

### Farmer registration/profile

Support:

- Business/stall name
- Contact
- Address
- Markets
- Market days
- Pickup windows
- Latitude
- Longitude
- Approval status

Farmers must have an approval status so admins can approve or suspend them.

---

# 2. User Management

Create user APIs and models supporting:

- Customer management
- Farmer management
- Admin management
- User status
- Role information
- Search
- Filtering

Users must only access resources they are authorized to access.

---

# 3. Markets

Create a complete Market model and CRUD APIs.

Market data should support:

- Name
- Address
- Latitude
- Longitude
- Market days
- Operating hours
- Status
- Associated farmers

Support:

- Customers browsing markets
- Market detail retrieval
- Farmers associating with markets
- Admin market management
- Map/location information for the frontend

---

# 4. Farmers

Create farmer profiles linked to users.

Support:

- Farmer profile
- Stall/business name
- Contact information
- Address
- Markets
- Market days
- Pickup windows
- Map coordinates
- Approval status
- Available products
- Reviews

Farmer capabilities:

- Manage own profile
- Manage own market associations
- Manage own products
- Manage own inventory
- Manage own orders

Customer capabilities:

- View public farmer profiles
- View farmer products
- View farmer markets
- View reviews

Admin capabilities:

- View farmers
- Search/filter farmers
- Approve farmers
- Suspend farmers
- Activate/deactivate where appropriate

---

# 5. Products

Implement complete product CRUD.

Product fields should support:

- Farmer ID
- Name
- Category
- Description
- Price
- Unit
- Stock quantity
- Image URL/reference
- Availability status
- Created/updated timestamps

Farmers can:

- Create products
- View own products
- Update products
- Delete products
- Change price
- Change quantity
- Mark sold out
- Mark unavailable
- Restore availability

Customers can:

- Browse products
- Search products
- Filter by category
- Filter by price
- Filter by market
- Filter by day
- View product details
- View availability
- View farmer information
- View reviews

---

# 6. Categories

Create a category system.

Support:

- Create category
- Update category
- Delete/deactivate category
- List categories

Administrators manage master categories.

---

# 7. Weekly Inventory

Implement weekly inventory management.

Farmers should be able to create and manage recurring weekly stock information.

Support:

- Product
- Farmer
- Week/date period
- Quantity
- Price
- Availability

The frontend must be able to retrieve the current week's inventory.

---

# 8. Cart

Implement a customer cart.

Support:

- Add product
- Update quantity
- Remove product
- View cart
- Clear cart

Validate on the backend:

- Product exists
- Product is available
- Requested quantity is available
- Farmer/product relationship is valid
- Prices are calculated safely on the backend

Never trust totals sent by the frontend.

---

# 9. Pre-Orders

MarketLink uses **pre-orders for pickup**.

Customers can:

- Create a pre-order
- Select products and quantities
- Select market
- Select pickup date
- Select pickup time slot
- View order details
- Modify eligible orders
- Cancel eligible orders

## Important

There is **NO online payment gateway**.

Orders are paid **in person at pickup**.

Do not implement:

- Stripe
- PayPal
- Online payment processing
- Delivery
- Courier functionality

---

# 10. Order Lifecycle

Support an order lifecycle such as:

```text
placed
accepted
ready
completed
```

Also support appropriate:

- declined
- cancelled

Farmers can:

- View incoming orders
- Accept orders
- Decline orders
- Mark orders ready
- Complete orders

Customers can:

- View current order status
- View order details
- Cancel/modify before applicable cutoff
- View order history
- Reorder previous orders

Perform all authorization checks on the backend.

---

# 11. Pickup Slots

Farmers can configure pickup availability.

Support:

- Pickup date
- Start time
- End time
- Slot capacity where appropriate
- Cutoff time
- Availability

Customers should only be able to select valid pickup slots.

Prevent expired or invalid pickup selections.

---

# 12. Order History & Analytics

## Customer

Support:

- Order history
- Previous order details
- Reorder

## Farmer

Support:

- Order history
- Pending orders
- Total orders
- Revenue summary
- Best-selling products

## Admin

Provide APIs for:

- Total customers
- Total farmers
- Total markets
- Total orders
- Platform activity
- Useful reports/analytics

---

# 13. Favorites

Implement customer favorites.

Customers can:

- Favorite products/farmers where appropriate
- Remove favorites
- View favorites
- Save favorite markets
- Remove saved markets

Where implemented, support restock alerts for interested customers.

---

# 14. Reviews & Ratings

Implement reviews and ratings.

Support:

- Rating
- Comment
- Customer
- Product/farmer reference
- Date
- Farmer response

Customers can submit reviews for eligible purchases.

Farmers can respond to reviews.

Admins can moderate/remove inappropriate reviews.

Prevent users from modifying other users' reviews.

---

# 15. Notifications

Support notifications for:

- Order confirmation
- Order accepted
- Order declined
- Order ready for pickup
- Order completed
- Important platform announcements
- Restock notifications where implemented

Provide APIs for:

- Get notifications
- Mark notification as read
- Mark all as read

Email/in-app notifications may be implemented where practical, but do not make the architecture dependent on a paid email service.

---

# 16. Admin Backend

Create protected admin APIs.

## Farmers

- View
- Search
- Filter
- Approve
- Suspend
- Activate where appropriate

## Customers

- View
- Search
- Filter
- Activate/deactivate

## Markets

- Create
- Update
- Delete/deactivate
- Manage coordinates

## Categories

- Create
- Update
- Delete/deactivate

## Reviews

- View
- Moderate
- Remove

## Announcements

- Create
- Update
- Publish
- Deactivate

## Reports

Provide APIs for:

- Dashboard statistics
- Platform analytics
- User activity
- Order activity
- Farmer activity
- Market activity
- Product activity

---

# 17. AI Assistant Backend

The AI assistant is an important part of MarketLink.

Create:

```text
src/services/ai/
├── ai.service.ts
├── ai.context.ts
└── ai.types.ts
```

Create the endpoint:

```text
POST /api/ai/chat
```

The assistant should answer MarketLink-specific questions such as:

- "Which markets are open on Saturday?"
- "Which farmers are available at this market?"
- "Do you have tomatoes available?"
- "What products does this farmer sell?"
- "What time can I pick up my order?"
- "How does MarketLink pre-ordering work?"
- "Which markets have this product?"

The AI should use relevant current MarketLink data when answering questions about:

- Markets
- Farmers
- Products
- Availability
- Pickup information
- Orders where appropriate

Do not send the entire database to the AI.

Create a retrieval/context layer that gets only relevant information from MongoDB.

Use the **Gemini API through the backend**.

Keep the Gemini API key in `.env`.

**Never expose the Gemini API key to the React frontend.**

The AI service should be isolated behind a service layer so the AI provider can be changed later without changing the frontend API.

Implement:

- Input validation
- Error handling
- Conversation/message handling as appropriate
- Safe prompts
- Relevant database context
- Reasonable response limits
- Graceful AI/API failure handling

The AI must not invent market, farmer, product, or availability information when the backend does not have that information.

---

# 18. AI API Flow

Example request:

```http
POST /api/ai/chat
Content-Type: application/json
```

```json
{
  "message": "Which farmers have tomatoes available on Saturday?"
}
```

Backend flow:

```text
Receive question
      ↓
Identify relevant MarketLink information
      ↓
Query MongoDB
      ↓
Build AI context
      ↓
Send context + question to Gemini
      ↓
Return response
```

Example response:

```json
{
  "success": true,
  "message": "..."
}
```

---

# 19. REST API Organization

Organize APIs approximately as:

```text
/api/auth
/api/users
/api/customers
/api/farmers
/api/markets
/api/products
/api/categories
/api/inventory
/api/cart
/api/orders
/api/pickup-slots
/api/favorites
/api/reviews
/api/notifications
/api/admin
/api/reports
/api/announcements
/api/ai
```

Use:

```text
GET
POST
PUT/PATCH
DELETE
```

Use consistent JSON response formats.

---

# 20. Database

Use MongoDB with Mongoose.

Create appropriate indexes for frequently searched fields such as:

- Email
- Role
- Product name
- Category
- Farmer
- Market
- Availability
- Order status
- Order date

Use proper references/relationships.

Avoid unnecessary data duplication.

Use timestamps.

---

# 21. Security

Implement:

- Password hashing
- JWT authentication
- Role-based authorization
- Request validation
- Input sanitization where appropriate
- CORS
- Environment variables
- Secure error handling
- Authorization checks on protected resources
- Protection against users accessing another user's orders/data
- Protection against farmers modifying another farmer's products/orders
- Protection against customers modifying another customer's data

Never expose:

- Password hashes
- JWT secrets
- MongoDB credentials
- Gemini API keys

---

# 22. Error Handling

Create centralized error handling.

Use consistent responses such as:

```json
{
  "success": false,
  "message": "Product not found"
}
```

Handle:

- Validation errors
- Authentication errors
- Authorization errors
- Not found errors
- Duplicate records
- Database errors
- AI API errors
- Invalid requests

Do not expose stack traces or secrets in production.

---

# 23. Environment Variables

Create `.env.example` with:

```text
PORT=
MONGODB_URI=
JWT_SECRET=
GEMINI_API_KEY=
CLIENT_URL=
```

Do not commit real secrets.

---

# 24. Backend README

Create a backend README explaining:

- Project setup
- Node version
- Installation
- Environment variables
- MongoDB setup
- Development server
- Production build
- Production server
- API structure
- Authentication
- Roles
- AI setup
- Example API requests
- Test/demo accounts if seed data is provided

---

# 25. Seed/Test Data

Create optional development seed data for:

- Admin
- Farmers
- Customers
- Markets
- Categories
- Products
- Weekly inventory
- Orders
- Reviews

Clearly mark seed credentials as development/test credentials.

Do not make the application depend on seed data.

---

# 26. Backend Quality

The backend must be:

- Modular
- Maintainable
- Type-safe
- Properly typed
- Scalable
- Easy for another developer to understand
- Ready for a React + TypeScript frontend
- Free from hardcoded business data
- Free from unnecessary features

Use controllers for request handling and services for business logic where appropriate.

---

# 27. Do NOT Build

Do not build the React frontend.

Do not add:

- Stripe
- PayPal
- Online payments
- Delivery/courier system
- Delivery tracking
- Unrelated social features
- Cryptocurrency
- Unnecessary subscriptions
- Features outside the MarketLink requirements

Focus on:

**Farmers + Customers + Markets + Products + Inventory + Pre-orders + Pickup + Orders + Reviews + Favorites + Admin + Maps data + Notifications + AI Assistant.**

---

# 28. Final Requirement

Deliver a complete working backend containing:

1. TypeScript source code
2. MongoDB/Mongoose models
3. REST APIs
4. Authentication
5. Role-based authorization
6. Customer functionality
7. Farmer functionality
8. Admin functionality
9. Product management
10. Inventory management
11. Cart
12. Pre-orders
13. Pickup slots
14. Order lifecycle
15. Order history
16. Favorites
17. Reviews/ratings
18. Notifications
19. Reports/analytics APIs
20. Market/location APIs
21. Gemini AI assistant
22. Environment configuration
23. Seed/test data
24. Backend documentation
25. Error handling and validation

The backend must be designed so that a separate **React + TypeScript frontend can connect directly through the REST APIs**.

Do not stop after creating the project structure. Implement the actual functionality and verify that the backend builds and runs successfully.
