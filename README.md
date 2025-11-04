# Univest SDE - Meeting Management API

A Node.js/Express API for managing meeting transcripts with AI-powered summarization and action item extraction using Google Gemini. Features vector embeddings for semantic search capabilities.

## 🚀 Features

- **User Authentication**: JWT-based authentication system
- **Meeting Management**: Create and list meetings with transcripts
- **AI Summarization**: Automatic extraction of summaries and action items using Google Gemini
- **Vector Search**: Semantic search capabilities using MongoDB vector search
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **PostgreSQL Database**: Structured data storage with Prisma ORM
- **MongoDB Integration**: Vector embeddings storage for similarity search

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v12 or higher)
- **MongoDB** (v6.0 or higher with vector search support)
- **Google Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey))

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Univest_SDE
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/univest_db?schema=public"

# MongoDB Configuration
MONGODB_URI="mongodb://localhost:27017/univest"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Google Gemini API
GEMINI_API_KEY="your-gemini-api-key-here"

# Server Port (optional, defaults to 3000)
PORT=3000
```

### 4. Database Setup

#### PostgreSQL Setup

1. Create a PostgreSQL database:
```bash
createdb univest_db
```

2. Generate Prisma Client and run migrations:
```bash
npm run prisma:generate
npm run prisma:migrate
```

#### MongoDB Setup

1. Ensure MongoDB is running with vector search support (MongoDB Atlas or local instance with vector search enabled)

2. Create a vector search index on the `meetings_vector` collection:
```javascript
// Connect to MongoDB and run:
db.meetings_vector.createSearchIndex({
  "definition": {
    "mappings": {
      "dynamic": true,
      "fields": {
        "embedding": {
          "type": "knnVector",
          "dimensions": 768,
          "similarity": "cosine"
        }
      }
    }
  },
  "name": "embedding_index"
})
```

### 5. Start the Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

### 6. Access API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:3000/api-docs`
- **OpenAPI JSON**: `http://localhost:3000/docs.json`

## 📁 Project Structure

```
Univest_SDE/
├── src/
│   ├── index.ts                 # Main application entry point
│   ├── swagger.ts               # Swagger/OpenAPI configuration
│   ├── middleware/
│   │   └── auth.ts             # JWT authentication middleware
│   ├── routes/
│   │   ├── user.ts             # User registration/login routes
│   │   └── meetings.ts         # Meeting management routes
│   ├── model_call/
│   │   ├── geminiApi.ts        # Google Gemini API integration
│   │   └── vectorService.ts    # MongoDB vector collection service
│   └── utils/
│       └── storeEmbedding.ts   # Vector embedding storage utilities
├── prisma/
│   └── schema.prisma           # Prisma database schema
├── package.json
├── tsconfig.json
└── README.md
```

## 🔄 Application Flow

### 1. User Registration/Login Flow

```
POST /users
  ↓
Request Body: { email, password }
  ↓
Create/Update User (Prisma)
  ↓
Generate JWT Token
  ↓
Response: { user, token }
```

### 2. Meeting Creation Flow

```
POST /meetings (with Bearer token)
  ↓
Authenticate JWT Token (authMiddleware)
  ↓
Extract: { title, transcript }
  ↓
Call Gemini API (geminiApi.ts)
  ├── Generate Summary
  ├── Extract Action Items
  └── Generate Embedding Vector
  ↓
Store Meeting in PostgreSQL (Prisma)
  ↓
Store Embedding in MongoDB (storeEmbedding.ts)
  ↓
Response: Meeting object with summary & actionItems
```

### 3. Meeting Listing Flow

```
GET /meetings (with Bearer token)
  ↓
Authenticate JWT Token (authMiddleware)
  ↓
Query PostgreSQL (Prisma)
  ↓
Return: Array of meetings
```

### 4. Vector Search Flow (Implementation Available)

```
searchSimilarMeetings(query, userId)
  ↓
Generate Embedding for Query (Gemini)
  ↓
MongoDB Vector Search ($vectorSearch)
  ↓
Return: Similar meetings with scores
```

## 🔌 API Endpoints

### Public Endpoints

#### `POST /users`
Create a new user or login with existing credentials.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "clxxx...",
    "email": "user@example.com",
    "name": "user",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Protected Endpoints (Require Bearer Token)

#### `POST /meetings`
Create a new meeting with transcript.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "title": "Sprint Planning Meeting",
  "transcript": "Team discussed project deadlines and priorities..."
}
```

**Response:**
```json
{
  "id": "clxxx...",
  "title": "Sprint Planning Meeting",
  "transcript": "Team discussed project deadlines...",
  "summary": "The team discussed project deadlines and priorities...",
  "actionItems": [
    "Complete user authentication - John (2024-01-15)",
    "Update API documentation - Sarah (2024-01-20)"
  ],
  "userId": "clxxx...",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### `GET /meetings`
List all meetings for the authenticated user.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
[
  {
    "id": "clxxx...",
    "title": "Sprint Planning Meeting",
    "summary": "...",
    "actionItems": [...],
    ...
  }
]
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

## 🗄️ Database Schema

### PostgreSQL (via Prisma)

**User Model:**
- `id` (String, Primary Key)
- `email` (String, Unique)
- `password` (String)
- `name` (String)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Meeting Model:**
- `id` (String, Primary Key)
- `title` (String)
- `transcript` (Text)
- `summary` (Text, Optional)
- `actionItems` (String Array)
- `userId` (String, Foreign Key)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### MongoDB Collection

**meetings_vector Collection:**
- `meetingId` (String)
- `userId` (String)
- `title` (String)
- `embedding` (Number Array - 768 dimensions)
- `createdAt` (Date)

## 🔐 Security Notes

- **JWT Secret**: Change the default JWT_SECRET in production
- **Password Storage**: Currently passwords are stored in plain text - consider adding bcrypt hashing
- **CORS**: Configure CORS settings for production use
- **Rate Limiting**: Consider adding rate limiting for API endpoints
- **Input Validation**: Add comprehensive input validation middleware
