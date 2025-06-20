# 📡 API Reference

## Loga.app Booking API

Base URL: `https://www.loga.app/privateapi/booking`

### Authentication

All requests require authentication via form parameters:
- `token`: Your Loga.app authentication token
- `device_id`: Your registered device ID

## Endpoints

### 🏸 Create Appointment

**POST** `/create_appointment`

Books a badminton court for specified time slot.

#### Request

**Content-Type**: `multipart/form-data`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `token` | string | ✅ | Authentication token |
| `device_id` | string | ✅ | Device identifier |
| `card_id` | integer | ✅ | Card/membership ID |
| `slot_id` | integer | ✅ | Venue slot identifier |
| `contact` | string | ✅ | Contact phone number |
| `start` | integer | ✅ | Start timestamp (Unix) |
| `end` | integer | ✅ | End timestamp (Unix) |
| `amount` | integer | ✅ | Number of courts |
| `payment_method` | integer | ✅ | Payment method (1 = shop_credit) |
| `remark` | string | ❌ | Optional booking notes |

#### Example Request

```javascript
const FormData = require('form-data');
const form = new FormData();

form.append('token', 'your_token_here');
form.append('device_id', 'your_device_id');
form.append('card_id', 6364);
form.append('slot_id', 12489);
form.append('contact', '0812345678');
form.append('start', 1703779200);
form.append('end', 1703782800);
form.append('amount', 2);
form.append('payment_method', 1);
form.append('remark', '');
```

#### Response

**Success (200)**
```json
{
  "status": "success",
  "appointment_id": 123456,
  "message": "Booking confirmed"
}
```

**Error (400/500)**
```json
{
  "status": "error",
  "message": "Slot not available",
  "error_code": "SLOT_UNAVAILABLE"
}
```

### 📋 Get Appointments

**GET** `/get_appointments`

Retrieves user's booking history.

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `token` | string | ✅ | Authentication token |
| `device_id` | string | ✅ | Device identifier |
| `card_id` | integer | ✅ | Card/membership ID |
| `locale` | string | ❌ | Language locale (default: 'th') |

#### Example Request

```javascript
const response = await axios.get('/get_appointments', {
  params: {
    token: 'your_token',
    device_id: 'your_device_id',
    card_id: 6364,
    locale: 'th'
  }
});
```

#### Response

```json
{
  "status": "success",
  "data": [
    {
      "appointment_id": 123456,
      "fname": "John",
      "lname": "Doe",
      "start_time": 1703779200,
      "end_time": 1703782800,
      "amount": 2,
      "amount_unit": "courts",
      "branch_name": "Main Branch",
      "activity_name": "Badminton",
      "price": 200,
      "currency": "THB",
      "status": "confirmed",
      "status_name": "Confirmed",
      "last_update": 1703775600
    }
  ]
}
```

## GitHub API Integration

Base URL: `https://api.github.com`

### 📁 Get File Content

**GET** `/repos/{owner}/{repo}/contents/{path}`

#### Headers
```
Authorization: token {github_token}
Accept: application/vnd.github.v3+json
```

#### Response
```json
{
  "name": "booking-config.json",
  "content": "base64_encoded_content",
  "sha": "file_sha_hash"
}
```

### ✏️ Update File

**PUT** `/repos/{owner}/{repo}/contents/{path}`

#### Request Body
```json
{
  "message": "Update booking configuration",
  "content": "base64_encoded_content",
  "sha": "current_file_sha"
}
```

### 🔄 Workflow Runs

**GET** `/repos/{owner}/{repo}/actions/runs`

#### Parameters
- `per_page`: Number of results (default: 30)

#### Response
```json
{
  "workflow_runs": [
    {
      "id": 123456,
      "name": "Badminton Court Booking",
      "status": "completed",
      "conclusion": "success",
      "created_at": "2024-01-01T00:00:00Z",
      "html_url": "https://github.com/user/repo/actions/runs/123456"
    }
  ]
}
```

## Error Codes

### Loga.app API

| Code | Description | Solution |
|------|-------------|----------|
| `INVALID_TOKEN` | Authentication failed | Check token validity |
| `SLOT_UNAVAILABLE` | Time slot already booked | Try different time |
| `INSUFFICIENT_CREDIT` | Not enough shop credit | Top up account |
| `INVALID_SLOT_ID` | Venue slot not found | Verify slot_id |

### GitHub API

| Code | Description | Solution |
|------|-------------|----------|
| `401` | Unauthorized | Check token permissions |
| `404` | Repository/file not found | Verify repo path |
| `422` | Validation failed | Check request format |

## Rate Limits

- **Loga.app**: No official limits, use 5-second delays between requests
- **GitHub**: 5000 requests/hour for authenticated requests

## Timestamp Format

All timestamps are Unix timestamps (seconds since epoch):

```javascript
// Current time
const now = Math.floor(Date.now() / 1000);

// Bangkok timezone
const moment = require('moment-timezone');
const bangkokTime = moment().tz('Asia/Bangkok').unix();
```

## Common Patterns

### Booking Flow
1. Calculate target date (7 days from now)
2. Generate start/end timestamps
3. Submit booking request
4. Handle response/errors

### Configuration Sync
1. Fetch current config from GitHub
2. Compare with local changes
3. Update if different
4. Commit changes

### Error Handling
```javascript
try {
  const response = await bookCourt(slotData);
  console.log('Booking successful');
} catch (error) {
  if (error.code === 'ECONNABORTED') {
    console.log('Request timeout');
  } else if (error.response?.status === 400) {
    console.log('Booking failed:', error.response.data);
  }
}
```