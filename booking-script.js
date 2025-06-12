const axios = require('axios');
require('dotenv').config();

// Configuration from environment variables or fallback to defaults
const token = process.env.TOKEN || 'f96c818b2f7aca6473205acc6cd541644f9b5618';
const deviceId = process.env.DEVICE_ID || '1a84b828-7c7a-4e63-9387-0eccec1e1566';
const cardId = parseInt(process.env.CARD_ID || '6364');
const slotId = parseInt(process.env.SLOT_ID || '12489');
const contact = process.env.CONTACT || '0900190217';

const baseUrl = 'https://www.loga.app';
const createAppointmentPath = 'privateapi/booking/create_appointment';

// Calculate timestamps for next Wednesday's booking slots in Thai timezone (UTC+7)
function getNextWednesdayTimestamps() {
  // Create date object with Thai timezone offset explicitly
  const now = new Date();
  
  // Get current date in ISO format and force it to be interpreted as UTC
  const nowStr = now.toISOString();
  // Create a date that's explicitly in UTC
  const nowUTC = new Date(nowStr);
  // Add 7 hours for Thai timezone (UTC+7)
  const nowThai = new Date(nowUTC.getTime() + (7 * 60 * 60 * 1000));
  
  // Find the next Wednesday (day 3) in Thai time
  let nextWednesday = new Date(nowThai);
  nextWednesday.setDate(nowThai.getDate() + (3 + 7 - nowThai.getDay()) % 7);
  
  // If today is Wednesday and it's before booking time, use today
  if (nowThai.getDay() === 3 && nowThai.getHours() < 18) {
    nextWednesday = nowThai;
  }
  
  // Set to specific times (18:00 and 19:00) in Thai time
  const slot1Start = new Date(nextWednesday);
  slot1Start.setHours(18, 0, 0, 0);
  
  const slot1End = new Date(nextWednesday);
  slot1End.setHours(19, 0, 0, 0);
  
  const slot2Start = new Date(nextWednesday);
  slot2Start.setHours(19, 0, 0, 0);
  
  const slot2End = new Date(nextWednesday);
  slot2End.setHours(20, 0, 0, 0);
  
  // Convert to Unix timestamps (seconds)
  return {
    slot1: {
      start: Math.floor(slot1Start.getTime() / 1000),
      end: Math.floor(slot1End.getTime() / 1000)
    },
    slot2: {
      start: Math.floor(slot2Start.getTime() / 1000),
      end: Math.floor(slot2End.getTime() / 1000)
    }
  };
}

async function bookCourt(slotNumber = 1) {
  try {
    const slots = getNextWednesdayTimestamps();
    const bookingSlot = slotNumber === 1 ? slots.slot1 : slots.slot2;
    
    console.log(`Booking court for Wednesday ${new Date(bookingSlot.start * 1000).toLocaleTimeString()} - ${new Date(bookingSlot.end * 1000).toLocaleTimeString()}`);
    
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
      amount: 1, // number of court
    };
    
    console.log(`${baseUrl}/${createAppointmentPath}`)
    console.log(payload)

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
    //     }
    //   }
    // );
    
    // console.log('Booking successful:', response.data);
    return true;
  } catch (error) {
    // console.error('Booking failed:', error.message);
    // if (error.response) {
    //   console.error('Response status:', error.response.status);
    //   console.error('Response data:', error.response.data);
    //   console.error('Response headers:', error.response.headers);
    // }
    return false;
  }
}

// Execute booking for both slots
async function bookBothSlots() {
  console.log('Starting badminton court booking process...');

  const slots = getNextWednesdayTimestamps();
  
  // Log the booking times in human-readable format (Thai time)
  const formatThaiTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return `${date.toDateString()} ${date.toTimeString()} (Thai time: GMT+7)`;
  };
  
  console.log('Slot 1 (18:00-19:00):', formatThaiTime(slots.slot1.start), 'to', formatThaiTime(slots.slot1.end));
  console.log('Slot 2 (19:00-20:00):', formatThaiTime(slots.slot2.start), 'to', formatThaiTime(slots.slot2.end));
  console.log(slots)
  
  // Book first slot (18:00-19:00)
  const slot1Success = await bookCourt(1);
  console.log('First slot booking ' + (slot1Success ? 'successful' : 'failed'));
  
  // Wait 5 seconds between bookings
  // await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Book second slot (19:00-20:00)
  // const slot2Success = await bookCourt(2);
  // console.log('Second slot booking ' + (slot2Success ? 'successful' : 'failed'));
  
  console.log('Booking process completed');
}

// Start the booking process
bookBothSlots();