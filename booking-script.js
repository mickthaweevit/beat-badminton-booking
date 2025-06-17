const axios = require('axios');
require('dotenv').config();

// Configuration from environment variables
const token = process.env.TOKEN;
const deviceId = process.env.DEVICE_ID;
const cardId = parseInt(process.env.CARD_ID);
const slotId = parseInt(process.env.SLOT_ID);
const contact = process.env.CONTACT;

// Load configuration file
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('booking-config.json', 'utf8'));

// Get booking time from environment variable or config
const bookingTime = process.env.BOOKING_TIME || config.defaultTime;

// Check if required environment variables are set
if (!token || !deviceId || !cardId || !slotId || !contact) {
  console.error('Error: Missing required environment variables.');
  console.error('Please make sure TOKEN, DEVICE_ID, CARD_ID, SLOT_ID, and CONTACT are set.');
  process.exit(1);
}

const baseUrl = 'https://www.loga.app';
const createAppointmentPath = 'privateapi/booking/create_appointment';

// Calculate timestamps for next booking day's slots in Thai timezone (UTC+7)
function getNextBookingTimestamps() {
  // Use moment-timezone for reliable timezone handling
  const moment = require('moment-timezone');
  
  // Get current time in Thai timezone
  const now = moment().tz('Asia/Bangkok');
  console.log('Current time in Thailand:', now.format('YYYY-MM-DD HH:mm:ss'));
  
  // Simply add 7 days to the current day to get the same day next week
  let nextBookingDay = now.clone().add(7, 'days');
  
  // Get the day name for logging
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const targetDayName = dayNames[now.day()];
  
  console.log(`Current day: ${targetDayName}`);
  console.log(`Booking for next ${targetDayName} (exactly one week from today)`);
  
  // Set to midnight to ensure we're working with just the date
  nextBookingDay.hour(0).minute(0).second(0).millisecond(0);
  
  console.log(`Next ${targetDayName} date:`, nextBookingDay.format('YYYY-MM-DD'));
  
  // Get slots from config or use default if running from GitHub Actions with env var
  const slots = config.slots || [];
  const timestamps = {};
  
  // If we have slots in config, use those
  if (slots.length > 0) {
    slots.forEach((slot, index) => {
      if (slot.enabled) {
        const slotTime = slot.time || bookingTime;
        console.log(`Configuring slot ${index + 1}: ${slotTime}, Courts: ${slot.courts}`);
        
        const [startTime, endTime] = slotTime.split('-');
        const [startHour, startMinute] = startTime.split(':').map(num => parseInt(num));
        const [endHour, endMinute] = endTime.split(':').map(num => parseInt(num));
        
        const slotStart = nextBookingDay.clone().hour(startHour).minute(startMinute).second(0);
        const slotEnd = nextBookingDay.clone().hour(endHour).minute(endMinute).second(0);
        
        timestamps[`slot${index + 1}`] = {
          label: slot.label,
          start: slotStart.unix(),
          end: slotEnd.unix(),
          courts: slot.courts || 1
        };
      }
    });
  } else {
    // Fallback to the old behavior with two slots if no config
    console.log(`Using default booking time: ${bookingTime}`);
    
    const [startTime, endTime] = bookingTime.split('-');
    const [startHour, startMinute] = startTime.split(':').map(num => parseInt(num));
    const [endHour, endMinute] = endTime.split(':').map(num => parseInt(num));
    
    // Create the slot times
    const slot1Start = nextBookingDay.clone().hour(startHour).minute(startMinute).second(0);
    const slot1End = nextBookingDay.clone().hour(endHour).minute(endMinute).second(0);
    
    // For second slot, add one hour to both start and end times
    const slot2Start = slot1Start.clone().add(1, 'hour');
    const slot2End = slot1End.clone().add(1, 'hour');
    
    timestamps.slot1 = {
      start: slot1Start.unix(),
      end: slot1End.unix(),
      courts: 1
    };
    
    timestamps.slot2 = {
      start: slot2Start.unix(),
      end: slot2End.unix(),
      courts: 1
    };
  }
  
  return timestamps;
}

async function bookCourt(slotKey) {
  const logTime = () => new Date().toISOString();
  
  try {
    const slots = getNextBookingTimestamps();
    const bookingSlot = slots[slotKey];
    
    if (!bookingSlot) {
      console.error(`[${logTime()}] Invalid slot key: ${slotKey}`);
      return false;
    }
    
    const payload = {
      token: token,
      device_id: deviceId,
      card_id: cardId,
      slot_id: slotId,
      contact: contact,
      remark: '',
      start: bookingSlot.start,
      end: bookingSlot.end,
      payment_method: 1, // 1 = shop_credit
      amount: bookingSlot.courts || 1, // number of courts from config
    };
    
    console.log(`[${logTime()}] Booking slot ${bookingSlot.label} from ${payload.start} to ${payload.end}`);

    // Use FormData for multipart/form-data requests
    const FormData = require('form-data');
    const form = new FormData();
    
    // Add all payload fields to the form
    Object.keys(payload).forEach(key => {
      form.append(key, payload[key]);
    });
    
    // const response = await axios.post(
    //   `${baseUrl}/${createAppointmentPath}`,
    //   form,
    //   {
    //     headers: {
    //       ...form.getHeaders(),
    //       'User-Agent': 'PostmanRuntime/7.43.0'
    //     },
    //     timeout: 120000 // 2 minute timeout
    //   }
    // );
    
    // if (response.status === 200) {
    //   console.log(`[${logTime()}] Booking successful:`, response.data);
    //   return true;
    // } else {
    //   console.error(`[${logTime()}] Booking failed with status:`, response.status);
    //   console.error(`[${logTime()}] Response data:`, response.data);
    //   return false;
    // }
    return true
  } catch (error) {
    // if (error.code === 'ECONNABORTED') {
    //   console.error(`[${logTime()}] Booking request timed out`);
    // } else if (error.code === 'ENOTFOUND') {
    //   console.error(`[${logTime()}] Network error: Server not found`);
    // } else if (error.response) {
    //   console.error(`[${logTime()}] Server error:`, error.message);
    //   console.error(`[${logTime()}] Response status:`, error.response.status);
    //   console.error(`[${logTime()}] Response data:`, error.response.data);
    // } else {
    //   console.error(`[${logTime()}] Booking failed:`, error.message);
    // }
    return false;
  }
}

// Execute booking for all configured slots
async function bookAllSlots() {
  console.log('Starting badminton court booking process...');
  
  const slots = getNextBookingTimestamps();
  const slotKeys = Object.keys(slots);
  const results = {};
  
  for (let i = 0; i < slotKeys.length; i++) {
    const slotKey = slotKeys[i];
    const slot = slots[slotKey];
    
    // Format time for display
    const startTime = new Date(slot.start * 1000).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    const endTime = new Date(slot.end * 1000).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    
    console.log(`Booking slot ${i + 1} (${startTime}-${endTime}) with ${slot.courts} court(s)...`);
    
    // Book the slot
    const success = await bookCourt(slotKey);
    results[slotKey] = success;
    console.log(`Slot ${i + 1} booking ${success ? 'successful' : 'failed'}`);
    
    // Wait between bookings (except for the last one)
    if (i < slotKeys.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  // Print summary
  console.log('\nBooking Summary:');
  Object.keys(results).forEach((slotKey, index) => {
    console.log(`Slot ${index + 1}: ${results[slotKey] ? 'SUCCESS' : 'FAILED'}`);
  });
  
  console.log('\nBooking process completed');
}

// Start the booking process
bookAllSlots();