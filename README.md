# Badminton Court Booking Automation

This project automatically books badminton courts exactly one week in advance of your selected days using GitHub Actions.

## How it works

1. GitHub Actions runs the workflow on your configured days at 17:00 UTC (which is 00:00 Bangkok time)
2. The script automatically calculates the timestamps for next week's booking slots (exactly 7 days from the current day)
3. The workflow books the time slots you've configured in the settings

## Key Features

- **Automatic Booking**: Books courts exactly one week in advance
- **Configurable Days**: Choose which weekdays to book (Monday-Friday)
- **Configurable Times**: Select default booking time slots
- **GitHub Integration**: Uses GitHub Actions for reliable scheduling
- **Web UI**: Simple interface to manage your booking settings

## Local Setup

1. Clone the repository
2. Create a `.env` file from the example:
   ```
   cp .env.example .env
   ```
3. Fill in your personal values in the `.env` file:
   ```
   TOKEN=your_token_here
   DEVICE_ID=your_device_id_here
   CARD_ID=6364
   SLOT_ID=12489
   CONTACT=your_phone_number_here
   ```
4. Install dependencies:
   ```
   npm install
   ```
5. For UI development:
   ```
   cd ui
   npm install
   npm run dev
   ```

## GitHub Setup

1. Push this repository to GitHub (the `.env` file will not be included):
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

4. Configure your settings in the UI:
   - Enter your GitHub repository name and token
   - Select your preferred booking days and time
   - Save settings both locally and to GitHub

## Important Notes

- GitHub Actions scheduled workflows don't run immediately after being pushed
- GitHub may delay scheduled workflows by up to 15 minutes during periods of high loads
- For testing, use the manual trigger option ("workflow_dispatch")
- Never commit your `.env` file to the repository
- The GitHub token needs `repo` and `workflow` permissions