# Badminton Booking UI

A Vue.js web interface for managing badminton court bookings.

## Features

- Book badminton courts for specific days and times
- Configure automatic booking for different days of the week
- View upcoming bookings
- Integrate with GitHub Actions to trigger booking workflows

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with ESLint

```sh
npm run lint
```

## Usage

1. Configure your GitHub repository and token in the Settings page
2. Set your preferred booking days and times
3. Use the booking calendar to schedule court bookings
4. View your upcoming bookings on the dashboard

## Technologies Used

- Vue 3 with Composition API
- TypeScript
- Tailwind CSS
- Pinia for state management
- Vue Router
- Octokit for GitHub API integration