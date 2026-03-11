# Deploying to Vercel

This application is configured for easy deployment to Vercel.

## Prerequisites
- A Vercel account.
- The project pushed to a GitHub/GitLab/Bitbucket repository.

## Deployment Steps
1. Go to the [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"New Project"**.
3. Import your repository.
4. Vercel should automatically detect the **Vite** framework.
5. **Environment Variables**:
   - If you use any external APIs (like Google Gemini), add them in the "Environment Variables" section during setup.
   - `NODE_ENV` will be set to `production` automatically by Vercel.
6. Click **"Deploy"**.

## Important Notes for this App
- **Database (SQLite)**: This app uses `better-sqlite3`. On Vercel, the file system is ephemeral. Any data saved to the SQLite database will be lost when the serverless function restarts.
  - **Recommendation**: For permanent storage, consider migrating to a hosted database like **Supabase** (PostgreSQL).
- **Image Uploads**: Images are saved to `/tmp/uploads` in production. Like the database, these are temporary.
  - **Recommendation**: Use a cloud storage service like **Cloudinary** or **AWS S3** for permanent image storage.
- **Serverless Functions**: The backend is served via Vercel Serverless Functions (defined in `api/index.ts`).

## Troubleshooting
- If the app fails to start, check the "Functions" logs in the Vercel dashboard.
- Ensure `better-sqlite3` is listed in your `dependencies` in `package.json`.
