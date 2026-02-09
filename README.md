# AI-Assessment

A full-stack application with a React frontend and Express backend integrated with OpenAI.

## Prerequisites

- Node.js (v16 or higher)
- npm
- OpenAI API Key

## Getting Started

### Recommended Installation Flow

Clone the repository:
```bash
git clone https://github.com/DavidN22/AI-Assessment.git
```

Navigate into the project directory:
```bash
cd AI-Assessment
```

Then follow these steps:

1. **Install root dependencies:**
   ```bash
   npm install
   ```

2. **Install server dependencies:**
   ```bash
   cd server
   npm install
   cd ..
   ```

3. **Install client dependencies:**
   ```bash
   cd client
   npm install
   ```

4. **Navigate back to the root directory:**
   ```bash
   cd ..
   ```

### Environment Setup

**Getting an OpenAI API Key:**

If you need an API key, visit [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys) and click "Create new secret key" in the top right. Create a key name and select a project to quickly get started.

**Setting up the environment file:**

Create a `.env` file in the `server` folder with your OpenAI API key:

```bash
cd server
```

Create a `.env` file with the following content:

```
OPENAI_API_KEY=your_openai_api_key_here
```

## Running the Application

### Option 1: Run Both Client and Server Together (Recommended)

From the root directory:

```bash
npm run dev
```

This will start both the backend server and frontend client concurrently.

### Option 2: Run Separately

**Start the server:**
```bash
cd server
npm run dev
```

**Start the client (in a new terminal):**
```bash
cd client
npm run dev
```

### Option 3: Docker Development (Optional)

From the root directory:

```bash
docker-compose up --build
```

This will build and start both services in containers. Both server and client use polling for file change detection in development mode.

## Tech Stack

### Frontend (Client)
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Axios
- React Markdown

### Backend (Server)
- Node.js
- Express
- TypeScript
- OpenAI API
- CORS
- Multer

## Project Structure

```
AI-Assessment/
├── client/          # React frontend
├── server/          # Express backend
├── package.json     # Root package with concurrently script
└── README.md
```

## Development

- Frontend runs on `http://localhost:5173`
- Backend server runs on `http://localhost:3000`
