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
  // Use moment-timezone for reliable timezone handling
  const moment = require('moment-timezone');
  
  // Get current time in Thai timezone
  const now = moment().tz('Asia/Bangkok');
  console.log('Current time in Thailand:', now.format('YYYY-MM-DD HH:mm:ss'));
  
  // Find the next Wednesday
  let nextWednesday = moment().tz('Asia/Bangkok');
  
  // If today is not Wednesday or it's Wednesday but after 18:00, find next Wednesday
  if (now.day() !== 3 || (now.day() === 3 && now.hour() >= 18)) {
    nextWednesday = now.day(3 + 7);
  } else {
    // Today is Wednesday and before 18:00
    nextWednesday = now;
  }
  
  // Set to midnight to ensure we're working with just the date
  nextWednesday.hour(0).minute(0).second(0).millisecond(0);
  
  console.log('Next Wednesday date:', nextWednesday.format('YYYY-MM-DD'));
  
  // Create the slot times
  const slot1Start = nextWednesday.clone().hour(18).minute(0).second(0);
  const slot1End = nextWednesday.clone().hour(19).minute(0).second(0);
  const slot2Start = nextWednesday.clone().hour(19).minute(0).second(0);
  const slot2End = nextWednesday.clone().hour(20).minute(0).second(0);
  
  console.log('Slot 1:', slot1Start.format('YYYY-MM-DD HH:mm:ss'), 'to', slot1End.format('YYYY-MM-DD HH:mm:ss'));
  console.log('Slot 2:', slot2Start.format('YYYY-MM-DD HH:mm:ss'), 'to', slot2End.format('YYYY-MM-DD HH:mm:ss'));
  
  // Convert to Unix timestamps (seconds)
  return {
    slot1: {
      start: slot1Start.unix(),
      end: slot1End.unix()
    },
    slot2: {
      start: slot2Start.unix(),
      end: slot2End.unix()
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
  
  // Display the booking times in a readable format
  const moment = require('moment-timezone');
  const slot1StartTime = moment.unix(slots.slot1.start).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss');
  const slot1EndTime = moment.unix(slots.slot1.end).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss');
  const slot2StartTime = moment.unix(slots.slot2.start).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss');
  const slot2EndTime = moment.unix(slots.slot2.end).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss');
  
  console.log(`Booking for next Wednesday:`);
  console.log(`Slot 1: ${slot1StartTime} - ${slot1EndTime} (Thai time)`);
  console.log(`Slot 2: ${slot2StartTime} - ${slot2EndTime} (Thai time)`);
  console.log('Timestamps:', slots);
  
  // Book first slot (18:00-19:00)
  const slot1Success = await bookCourt(1);
  console.log('First slot booking ' + (slot1Success ? 'successful' : 'failed'));
  
  // Wait 5 seconds between bookings
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Book second slot (19:00-20:00)
  const slot2Success = await bookCourt(2);
  console.log('Second slot booking ' + (slot2Success ? 'successful' : 'failed'));
  
  console.log('Booking process completed');
}

// Start the booking process
bookBothSlots();