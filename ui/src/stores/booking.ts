import { defineStore } from 'pinia';

interface BookingState {
  isLoading: boolean;
  bookings: Booking[];
  error: string | null;
}

interface Booking {
  id: string;
  day: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'failed';
}

export const useBookingStore = defineStore('booking', {
  state: (): BookingState => ({
    isLoading: false,
    bookings: [],
    error: null
  }),
  
  actions: {
    loadBookings() {
      try {
        const savedBookings = localStorage.getItem('bookings');
        if (savedBookings) {
          this.bookings = JSON.parse(savedBookings);
        }
      } catch (error) {
        console.error('Error loading bookings', error);
      }
    },
    
    cancelBooking(id: string) {
      this.bookings = this.bookings.filter(booking => booking.id !== id);
      localStorage.setItem('bookings', JSON.stringify(this.bookings));
    }
  }
});