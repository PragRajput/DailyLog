# DailyLog

DailyLog is a personal work tracking app I built to stay on top of what I work on every day. The idea is simple — at the end of the day (or throughout it), you log what you did, link it to a project, and optionally note how many hours you spent. Over time it builds up a clear picture of where your time actually goes.

It also has task tracking, so you can create tasks with deadlines and priorities, mark them done when you're finished, and log progress notes along the way. There's a calendar view to browse past work by month, and an AI summary feature that takes your logs and turns them into a readable summary — useful for standup notes or weekly reviews.

There's also a quick notes section on the dashboard for throwaway to-dos that only matter today — things you want to track in the moment without creating a full task. And a quick entry button for logging work that doesn't belong to any existing project, where you just type a name, describe what you did, and it gets saved like any other entry.

Sign in is handled through Google, so there's no password to manage.

---

## What it does

- Log what you worked on each day, linked to a project and optionally with hours spent
- Create and track tasks with priorities (low, medium, high) and deadlines
- Organise work into projects — archive them when done so they don't clutter the dashboard
- Browse past entries on a calendar
- Generate AI-written summaries of your work activity using Gemini
- Upload a profile photo, edit your name — basic profile stuff
- Quick notes on the dashboard for lightweight daily to-dos that don't need a task or project
- Quick entry modal for logging work outside your existing projects — just type a name and it creates the project on the fly

---

## Built with

- **Next.js + TypeScript** for the frontend
- **Express + TypeScript** for the backend API
- **MongoDB** for the database
- **Passport.js** for Google OAuth sign-in
- **Google Gemini API** for AI summaries
- **Cloudinary** for avatar image uploads
- **Framer Motion** for animations

---

## Running it locally

You'll need Node.js 18+, a MongoDB Atlas account (the free tier is fine), a Google Cloud project with OAuth 2.0 set up, a Gemini API key, and a Cloudinary account for avatar uploads.

**Clone the repo:**

```bash
git clone https://github.com/your-username/DailyLog.git
cd DailyLog
```

**Set up the API:**

```bash
cd api
npm install
cp .env.example .env
```

Open `api/.env` and fill in your values:

```
PORT=3001
MONGODB_URI=your mongodb connection string
SESSION_SECRET=a long random string (run: openssl rand -hex 32)
GOOGLE_CLIENT_ID=your google oauth client id
GOOGLE_CLIENT_SECRET=your google oauth client secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback
FRONTEND_URL=http://localhost:3000
GEMINI_API_KEY=your gemini api key
GEMINI_MODEL=gemini-2.5-flash
CLOUDINARY_CLOUD_NAME=your cloudinary cloud name
CLOUDINARY_API_KEY=your cloudinary api key
CLOUDINARY_API_SECRET=your cloudinary api secret
```

Start the API server:

```bash
npm run dev
```

**Set up the web app:**

```bash
cd ../web
npm install
cp .env.local.example .env.local
```

The only thing you need in `web/.env.local` is:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Start the web app:

```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

**Google OAuth setup:**

Go to the Google Cloud Console, create an OAuth 2.0 Client ID under APIs & Services → Credentials, choose Web application, and add `http://localhost:3001/auth/google/callback` as an authorised redirect URI. Paste the client ID and secret into your `api/.env`.

---

## License

MIT
