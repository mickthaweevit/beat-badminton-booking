const token = 'a8576331244a5a001d5e2000e4ff5ad8619b6159'
const deviceId = '85eae198-d32a-4dc6-9a6d-9599e798ff1c'
const cardId = 6364 // logaClientId: Beat Discovery
const baseUrl = 'https://www.loga.app'

const dataDict = {
  get_bookable_branches: {
    path: '/privateapi/booking/get_bookable_branches',
    query: {
      locale: 'th',
      card_id: cardId
    }
  },
  get_bookable_slots: {
    path: '/privateapi/booking/get_bookable_slots',
    query: {
      locale: 'th',
      card_id: cardId,
      activity_id: 2543, // Badminton Court Evening
      branch_id: 5370, // Badminton
    }
  },
  get_activity_group: {
    path: 'privateapi/booking/get_activity_group',
    query: {
      token: token,
      uuid: deviceId,
      card_id: cardId
    }
  },
  create_appointment: {
    path: 'privateapi/booking/create_appointment',
    payload: {
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
    }
  }
}