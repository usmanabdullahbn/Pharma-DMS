# Vercel Deployment Configuration

## Environment Variables Required for Vercel

After deploying to Vercel, you **MUST** set the following environment variable in your Vercel project settings:

### For Production (Vercel)
```
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
```

Replace `your-vercel-domain` with your actual Vercel project domain.

### Steps to Configure on Vercel:

1. Go to **Vercel Dashboard** → Select your project
2. Click **Settings** → **Environment Variables**
3. Add a new environment variable:
   - **Name:** `NEXT_PUBLIC_APP_URL`
   - **Value:** `https://pharma-c6ntf1z30-usmanabdullahbns-projects.vercel.app` (or your actual domain)
   - **Environments:** Check "Production", "Preview", and "Development"
4. Click **Save**
5. Redeploy your application for changes to take effect

### Why This Was Needed

The application was hardcoded to use `http://localhost:3000` for all API calls. This works locally but fails on Vercel because:
- Vercel serverless functions cannot connect to `127.0.0.1:3000`
- Each request needs to use the actual deployed domain URL

### Local Development

For local development, the `.env.local` file is already configured with:
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

This file is **never committed to git** (added to .gitignore).

---

## After Pushing Changes

1. Push all code changes to GitHub
2. Vercel will automatically detect the changes and redeploy
3. Add the `NEXT_PUBLIC_APP_URL` environment variable before or after redeployment
4. Redeeploy manually if Vercel doesn't automatically pick up the env var
5. Test the login and dashboard to ensure it works

---

## Troubleshooting

If you still see `ECONNREFUSED 127.0.0.1:3000` errors:

1. Confirm the environment variable is set in Vercel
2. Check that the domain in the environment variable is correct
3. Redeploy the application (Vercel → Deployments → Redeploy)
4. Clear browser cache and try again
