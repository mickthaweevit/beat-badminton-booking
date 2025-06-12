# Badminton Court Booking Automation

This project automatically books a badminton court every Thursday at 00:00 AM using GitHub Actions.

## How it works

1. GitHub Actions runs the workflow every Wednesday at 17:00 UTC (which is Thursday 00:00 Bangkok time)
2. The workflow executes the booking script that makes an API call to book the court

## Setup

1. Push this repository to GitHub
2. GitHub Actions will automatically run according to the schedule
3. You can also manually trigger the workflow from the Actions tab in your GitHub repository

## Files

- `booking-script.js` - The main script that makes the API call to book the court
- `.github/workflows/booking.yml` - GitHub Actions workflow configuration
- `badminton-booking-beat-discovery.js` - API configuration and endpoints

## Manual Testing

To test the booking script locally:

```
npm install
npm run book
```