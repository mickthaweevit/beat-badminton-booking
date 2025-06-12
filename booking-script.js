const axios = require('axios');

// Configuration
const token = 'a8576331244a5a001d5e2000e4ff5ad8619b6159';
const deviceId = '85eae198-d32a-4dc6-9a6d-9599e798ff1c';
const cardId = 6364; // logaClientId: Beat Discovery
const baseUrl = 'https://www.loga.app';

// API endpoints and payloads
const createAppointmentPath = 'privateapi/booking/create_appointment';
const payload = {
  token: token,
  device_id: deviceId,
  card_id: cardId,
  slot_id: 12489, 
  contact: '0900190217', // tel
  remark: '',
  start: 1750244400, // start_timestamp
  end: 1750248000, // end_timestamp
  payment_method: 1, // 1 = shop_credit
  amount: 1, // number of court
};

async function bookCourt() {
  try {
    console.log('Booking court...');
    const response = await axios.post(
      `${baseUrl}/${createAppointmentPath}`, 
      payload
    );
    console.log('Booking successful:', response.data);
  } catch (error) {
    console.error('Booking failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Execute booking
bookCourt();