<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/5377333b-1469-415c-a628-cdab3208d381

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Admin listings and photos

Admin-managed listings and contact-form inquiries are stored in Neon. Property photos are uploaded to ImageKit.

1. Create an ImageKit account and find the **Private Key** in the ImageKit developer/API settings.
2. Set `IMAGEKIT_PRIVATE_KEY` in your local environment and Vercel project settings. Keep it server-side; do not expose it in browser code or commit it.
3. Keep `DATABASE_URL` configured for Neon, and redeploy after setting the environment variables.

The admin API protects listing writes and photo uploads with the existing admin session. Photos are resized in the browser and uploaded separately, so large images no longer inflate the listing-save request.
