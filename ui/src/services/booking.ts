import axios from 'axios';

export interface Booking {
  appointment_id: number;
  fname: string;
  lname: string;
  start_time: number;
  end_time: number;
  amount: number;
  amount_unit: string;
  branch_name: string;
  activity_name: string;
  price: number;
  currency: string;
  status: string;
  status_name: string;
  last_update: number;
}

class BookingService {
  private baseUrl = 'https://www.loga.app/privateapi/booking';
  private token = import.meta.env.VITE_TOKEN || '';
  private deviceId = import.meta.env.VITE_DEVICE_ID || '';
  private cardId = Number(import.meta.env.VITE_CARD_ID || 6364);
  
  async getBookings(): Promise<Booking[]> {
    try {
      // Use Axios params option for query parameters
      const response = await axios.get(`${this.baseUrl}/get_appointments`, {
        params: {
          locale: 'th',
          token: this.token,
          device_id: this.deviceId,
          card_id: this.cardId
        }
      });
      
      // For debugging
      console.log('API response:', response.data);
      
      // In a real implementation, we would return the actual API response
      return response.data.data;
      
      // For now, return mock data
      // return mockBookingData.data;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
  }
  
  formatDate(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
  
  formatTime(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  
  getTimeRange(startTime: number, endTime: number): string {
    return `${this.formatTime(startTime)} - ${this.formatTime(endTime)}`;
  }
}

export default new BookingService();