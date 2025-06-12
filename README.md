# Badminton Court Booking Automation

This project automatically books badminton courts every Wednesday at 18:00-19:00 and 19:00-20:00 using GitHub Actions.

## How it works

1. GitHub Actions runs the workflow every Wednesday at 17:00 UTC (which is Thursday 00:00 Bangkok time)
2. The script automatically calculates the timestamps for next Wednesday's booking slots
3. The workflow books both time slots (18:00-19:00 and 19:00-20:00)

## Setup

1. Create a `.env` file from the example:
   ```
   cp .env.example .env
   ```

2. Push this repository to GitHub:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/badminton-booking.git
   git push -u origin main
   ```

3. Add your secrets to GitHub repository:
   - Go to your repository on GitHub
   - Navigate to Settings > Secrets and variables > Actions
   - Add the following secrets:
     - TOKEN
     - DEVICE_ID
     - CARD_ID
     - SLOT_ID
     - CONTACT

4. GitHub Actions will automatically run according to the schedule

## Updating Tokens

When your token or device ID expires:

1. Update the values in your GitHub repository secrets
2. No code changes needed

## Manual Testing

To test the booking script locally:

```
npm install
npm run book
```