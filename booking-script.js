const axios = require('axios');
require('dotenv').config();

// Configuration from environment variables or fallback to defaults
const token = process.env.TOKEN || 'a8576331244a5a001d5e2000e4ff5ad8619b6159';
const deviceId = process.env.DEVICE_ID || '85eae198-d32a-4dc6-9a6d-9599e798ff1c';
const cardId = parseInt(process.env.CARD_ID || '6364');
const slotId = parseInt(process.env.SLOT_ID || '12489');
const contact = process.env.CONTACT || '0900190217';

const baseUrl = 'https://www.loga.app';
const createAppointmentPath = 'privateapi/booking/create_appointment';

// Calculate timestamps for next Wednesday's booking slots
function getNextWednesdayTimestamps() {
  const now = new Date();
  
  // Find the next Wednesday (day 3)
  let nextWednesday = new Date(now);
  nextWednesday.setDate(now.getDate() + (3 + 7 - now.getDay()) % 7);
  
  // If today is Wednesday and it's before booking time, use today
  if (now.getDay() === 3 && now.getHours() < 18) {
    nextWednesday = now;
  }
  
  // Set to specific times (18:00 and 19:00)
  const slot1Start = new Date(nextWednesday);
  slot1Start.setHours(18, 0, 0, 0);
  
  const slot1End = new Date(nextWednesday);
  slot1End.setHours(19, 0, 0, 0);
  
  const slot2Start = new Date(nextWednesday);
  slot2Start.setHours(19, 0, 0, 0);
  
  const slot2End = new Date(nextWednesday);
  slot2End.setHours(20, 0, 0, 0);
  
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
    
    const response = await axios.post(
      `${baseUrl}/${createAppointmentPath}`, 
      payload
    );
    
    console.log('Booking successful:', response.data);
    return true;
  } catch (error) {
    console.error('Booking failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    return false;
  }
}

// Execute booking for both slots
async function bookBothSlots() {
  console.log('Starting badminton court booking process...');

  const slots = getNextWednesdayTimestamps();
  console.log(slots)
  
  // Book first slot (18:00-19:00)
  // const slot1Success = await bookCourt(1);
  // console.log('First slot booking ' + (slot1Success ? 'successful' : 'failed'));
  
  // Wait 5 seconds between bookings
  // await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Book second slot (19:00-20:00)
  // const slot2Success = await bookCourt(2);
  // console.log('Second slot booking ' + (slot2Success ? 'successful' : 'failed'));
  
  console.log('Booking process completed');
}

// Start the booking process
bookBothSlots();