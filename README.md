IndiEstate — Full-Stack Real Estate Platform
A modern, production-ready real estate marketplace built with the MERN stack. Browse, list, and message about properties across India's major cities — with a WhatsApp-style chat system, auto-generated avatars, EMI calculator, reviews, favorites, and more.

Features
Authentication — Email/password & Google OAuth (Firebase), JWT sessions stored in HTTP-only cookies
Auto-Generated Avatars — Every user gets a unique DiceBear profile picture on signup; Google users keep their real photo
Property Listings — Create, edit, delete with up to 6 images uploaded to Firebase Storage
Advanced Search — Filter by listing type (sale/rent), property category, price range, amenities (pool, parking, pet-friendly), and sort order
WhatsApp-Style Messaging — Full back-and-forth chat threads between users, conversation list with unread badges, message bubbles, read receipts, 5-second polling
Favorites — Save/unsave listings with a heart button; view all saved properties
Reviews & Ratings — Leave star ratings and comments on any listing; delete your own
Mortgage / EMI Calculator — Interactive sliders for loan amount, interest rate, and tenure; shows monthly EMI, total payment, and interest breakdown
User Dashboard — Stats cards (total listings, active, total views, saved count) + listings table with edit/delete
View Tracking — Each listing visit increments its view counter
Featured Listings — Highlighted properties on the homepage
Seed Data — 25 realistic Indian property listings across Mumbai, Delhi, Bangalore, Hyderabad, Pune, Chennai, Kolkata, and more
Security — Helmet, CORS, rate limiting (200 req/15 min, 20 auth/15 min), response compression
Tech Stack
Layer	Technologies
Frontend	React 18, Vite, Tailwind CSS, Redux Toolkit + Persist, TanStack React Query, Lucide Icons, Swiper, React Hot Toast
Backend	Node.js, Express, MongoDB, Mongoose, JWT, Helmet, Morgan, express-rate-limit, compression
Auth	Firebase Authentication (Google OAuth), bcryptjs
Storage	Firebase Storage (listing images)
Avatars	DiceBear API (auto-generated SVG avatars seeded by username)
Prerequisites
Node.js v18+
npm v9+
MongoDB Atlas account (free tier works)
Firebase project with Authentication and Storage enabled
Environment Variables
Backend — create .env in the project root
MONGO=mongodb+srv://<username>:<password>@cluster.mongodb.net/mern-estate
JWT_SECRET=your_strong_secret_here
Frontend — create client/.env
VITE_FIREBASE_API_KEY=your_firebase_api_key
The rest of the Firebase config (authDomain, projectId, storageBucket, etc.) is set inside client/src/firebase.js.

How to Run
1. Clone the repository
git clone https://github.com/your-username/mern-estate.git
cd mern-estate
2. Install dependencies
# Backend
npm install

# Frontend
cd client
npm install --legacy-peer-deps
cd ..
3. Set up environment variables
Create .env in the project root:

MONGO=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
Create client/.env:

VITE_FIREBASE_API_KEY=your_firebase_api_key
4. Run in development
Open two terminals:

Terminal 1 — Backend (runs on port 3000):

npm run dev
Terminal 2 — Frontend (runs on port 5173):

cd client
npm run dev
Open http://localhost:5173 in your browser.

The Vite dev server proxies all /api requests to localhost:3000 automatically.

Seed Sample Listings
To populate the database with 25 sample Indian property listings:

node api/seed.js
Make sure your .env is set up and MongoDB is running before seeding.

Build for Production
npm run build
This builds the React app into client/dist. The Express server serves the built frontend automatically.

To start the production server:

npm start
The app runs entirely on port 3000.

Project Structure
mern-estate/
├── api/
│   ├── controllers/        # Route logic (auth, listing, user, review, inquiry, conversation)
│   ├── models/             # MongoDB schemas (User, Listing, Review, Inquiry, Conversation)
│   ├── routes/             # Express routers
│   ├── utils/              # JWT middleware, error handler
│   ├── seed.js             # Sample listing seeder
│   └── index.js            # Express server entry point
│
├── client/
│   ├── src/
│   │   ├── components/     # Header, ListingItem, Contact, MortgageCalculator, ReviewSection, OAuth
│   │   ├── lib/            # Utility functions (cn, formatPrice, timeAgo, etc.)
│   │   ├── pages/          # Home, Search, Listing, Dashboard, Favorites, Inbox, Profile, SignIn, SignUp, About
│   │   ├── redux/          # Redux store & user slice
│   │   ├── App.jsx         # Router + React Query provider + Toaster
│   │   └── firebase.js     # Firebase config
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── .env                    # Backend environment variables (not committed)
└── package.json            # Root package (server scripts + build script)
API Reference
Auth — /api/auth
Method	Path	Description
POST	/signup	Register new user (auto-assigns DiceBear avatar)
POST	/signin	Login with email/password
POST	/google	Google OAuth login/register
GET	/signout	Logout (clears cookie)
Listings — /api/listing
Method	Path	Description
POST	/create	Create a listing (auth required)
GET	/get	Search listings with filters
GET	/get/:id	Get single listing (increments view count)
POST	/update/:id	Update listing (owner only)
DELETE	/delete/:id	Delete listing (owner only)
GET	/featured	Get featured listings
GET	/stats	Get platform-wide listing statistics
Users — /api/user
Method	Path	Description
POST	/update/:id	Update profile (auth required)
DELETE	/delete/:id	Delete account (auth required)
GET	/listings/:id	Get all listings by a user
GET	/saved/:id	Get saved/favorited listings
POST	/saved/toggle/:listingId	Save or unsave a listing
GET	/stats/:id	Dashboard statistics
GET	/:id	Get user profile
Reviews — /api/review
Method	Path	Description
POST	/create	Submit a review (auth required)
GET	/:listingId	Get all reviews for a listing
DELETE	/:id	Delete own review (auth required)
Conversations (Messaging) — /api/conversation
Method	Path	Description
POST	/	Get or create a conversation
GET	/	Get all conversations for current user
GET	/unread	Get total unread message count
GET	/:id	Get conversation with all messages (marks as read)
POST	/:id/message	Send a message in a conversation
Firebase Setup
Go to Firebase Console
Create a new project
Enable Authentication → Sign-in methods → Google
Enable Storage → Start in test mode (update rules before going to production)
Copy your config values into client/src/firebase.js
Add VITE_FIREBASE_API_KEY to client/.env
MongoDB Atlas Setup
Go to cloud.mongodb.com
Create a free M0 cluster
Add a database user with read/write access
Add your IP to the Network Access list (use 0.0.0.0/0 for development)
Copy the connection string into your .env as MONGO
License
MIT
