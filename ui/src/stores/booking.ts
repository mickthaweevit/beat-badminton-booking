import { defineStore } from 'pinia';
import githubService from '../services/github';

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
    async bookCourt(day: number, time: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        const success = await githubService.triggerWorkflow(time);
        
        if (success) {
          // Create a new booking entry
          const date = new Date();
          date.setDate(date.getDate() + ((day - date.getDay() + 7) % 7) + 7); // Next week's day
          
          const booking: Booking = {
            id: `${Date.now()}`,
            day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day],
            date: date.toISOString().split('T')[0],
            time,
            status: 'pending'
          };
          
          this.bookings.push(booking);
          
          // Save to localStorage
          localStorage.setItem('bookings', JSON.stringify(this.bookings));
          
          return true;
        } else {
          this.error = 'Failed to trigger booking workflow';
          return false;
        }
      } catch (error: any) {
        this.error = error.message || 'An error occurred';
        return false;
      } finally {
        this.isLoading = false;
      }
    },
    
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