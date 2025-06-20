# 🏸 Badminton Court Booking Automation

Automated badminton court booking system with web interface and GitHub Actions integration. Books courts exactly one week in advance using configurable schedules.

## ✨ Features

- 🤖 **Automated Booking**: Books courts exactly 7 days in advance
- 📅 **Flexible Scheduling**: Configure specific weekdays and time slots
- 🏟️ **Multiple Courts**: Book multiple courts per time slot
- 🌐 **Web Interface**: Modern Vue.js UI for easy configuration
- 🔧 **GitHub Integration**: Store configuration in repository
- 📊 **Workflow Monitoring**: Track booking success/failure in real-time
- 🌍 **Timezone Aware**: Proper Bangkok timezone handling
- 📱 **Responsive Design**: Works on desktop and mobile

## 🏗️ Architecture

```
├── booking-script.js          # Core booking automation
├── booking-config.json        # Booking configuration
├── .github/workflows/         # GitHub Actions workflows
└── ui/                        # Vue.js web interface
    ├── src/
    │   ├── components/
    │   ├── views/
    │   └── services/
    └── package.json
```

## 🚀 Quick Start

### 1. Local Development

```bash
# Clone repository
git clone <your-repo-url>
cd badminton-booking

# Setup environment
cp .env.example .env
# Edit .env with your credentials

# Install dependencies
npm install

# Setup UI
cd ui
npm install
npm run dev  # Starts dev server on http://localhost:3000
```

### 2. Environment Variables

Create `.env` file with your Loga.app credentials:

```env
TOKEN=your_loga_token
DEVICE_ID=your_device_id
CARD_ID=6364
SLOT_ID=12489
CONTACT=your_phone_number
```

### 3. GitHub Setup

1. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/username/badminton-booking.git
   git push -u origin main
   ```

2. **Add Repository Secrets**:
   - Go to Settings → Secrets and variables → Actions
   - Add all environment variables as secrets

3. **Configure via Web UI**:
   - Enter GitHub repository and token
   - Select booking days and time slots
   - Save configuration to GitHub

## ⚙️ Configuration

### Booking Schedule

- **Days**: Monday(1) - Friday(5)
- **Times**: 17:00-22:00 (1-hour slots)
- **Courts**: 1-3 courts per slot

### Example Configuration

```json
{
  "autobookDays": [3, 5],  // Wednesday & Friday
  "slots": [
    {
      "label": "18:00",
      "enabled": true,
      "time": "18:00-19:00",
      "courts": 2
    }
  ]
}
```

## 🔧 Technology Stack

- **Backend**: Node.js, Axios, Moment-timezone
- **Frontend**: Vue 3, TypeScript, Tailwind CSS, Vite
- **Automation**: GitHub Actions
- **API**: Loga.app booking system
- **DevTools**: Vue DevTools integration

## 📋 Usage

### Web Interface

1. **GitHub Integration**: Configure repository and token
2. **Booking Settings**: Select days and time slots
3. **Monitor Runs**: View workflow execution history
4. **Real-time Updates**: Configuration synced with GitHub

### Manual Booking

```bash
# Test booking locally
node booking-script.js
```

### GitHub Actions

- **Scheduled**: Runs at 17:00 UTC (00:00 Bangkok) on configured days
- **Manual**: Trigger via Actions tab
- **API**: Trigger via repository dispatch

## 🛠️ Development

### UI Development

```bash
cd ui
npm run dev     # Development server
npm run build   # Production build
npm run lint    # Code linting
```

### Project Structure

```
ui/src/
├── components/     # Reusable components
├── views/         # Page components
├── services/      # API services
├── router/        # Vue Router config
└── assets/        # Static assets
```

## 🔒 Security

- Environment variables stored as GitHub secrets
- No credentials in source code
- Token-based API authentication
- Repository access controls

## 📝 Important Notes

- GitHub Actions may delay up to 15 minutes during high load
- Booking runs exactly 7 days in advance
- Configuration changes require GitHub token with `repo` and `workflow` permissions
- UI runs on port 3000 in development
- Production build deployed to `/beat-badminton-booking/` path

## 🐛 Troubleshooting

### Common Issues

1. **Booking Fails**: Check API credentials and slot availability
2. **GitHub Sync Issues**: Verify token permissions
3. **Timezone Problems**: Ensure Bangkok timezone is configured
4. **UI Not Loading**: Check if dev server is running on port 3000

### Debug Commands

```bash
# Test booking script
node booking-script.js

# Check configuration
cat booking-config.json

# View logs
# Check GitHub Actions tab for workflow logs
```

## 📄 License

MIT License - Feel free to use and modify for your needs.