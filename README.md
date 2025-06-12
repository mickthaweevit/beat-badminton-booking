# Badminton Court Booking Automation

This project automatically books badminton courts every Wednesday at 18:00-19:00 and 19:00-20:00 using GitHub Actions.

## How it works

1. GitHub Actions runs the workflow every Wednesday at 17:00 UTC (which is Thursday 00:00 Bangkok time)
2. The script automatically calculates the timestamps for next Wednesday's booking slots
3. The workflow books both time slots (18:00-19:00 and 19:00-20:00)

## Setup

1. Push this repository to GitHub:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/badminton-booking.git
   git push -u origin main
   ```

2. Add your secrets to GitHub repository:
   - Go to your repository on GitHub
   - Navigate to Settings > Secrets and variables > Actions
   - Add the following secrets:
     - TOKEN
     - DEVICE_ID
     - CARD_ID
     - SLOT_ID
     - CONTACT

3. Enable GitHub Actions:
   - Go to your repository on GitHub
   - Click on the "Actions" tab
   - Click "I understand my workflows, go ahead and enable them"

4. Test the workflow:
   - Go to the "Actions" tab
   - Select "Badminton Court Booking" workflow
   - Click "Run workflow" > "Run workflow"
   - Check the logs to ensure it's working correctly

## Important Notes

- GitHub Actions scheduled workflows don't run immediately after being pushed
- GitHub may delay scheduled workflows by up to 15 minutes during periods of high loads
- For testing, use the manual trigger option ("workflow_dispatch")

## Manual Testing

To test the booking script locally:

```
npm install
npm run book
```