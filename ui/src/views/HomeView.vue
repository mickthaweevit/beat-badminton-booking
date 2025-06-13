<template>
  <div class="home">
    <h1 class="text-2xl font-bold mb-6">Badminton Court Booking Dashboard</h1>
    
    <div v-if="!isConfigured" class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-yellow-700">
            GitHub integration is not configured. Please go to 
            <router-link to="/settings" class="font-medium underline text-yellow-700 hover:text-yellow-600">
              Settings
            </router-link> 
            to set up your GitHub repository and token.
          </p>
        </div>
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Booking Calendar -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4">Booking Calendar</h2>
        <div class="calendar-container">
          <DatePicker v-model="selectedDate" :min-date="minDate" :disabled-dates="disabledDates" />
        </div>
      </div>
      
      <!-- Booking Controls -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4">Book a Court</h2>
        
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">Day</label>
          <select class="w-full p-2 border rounded" v-model="selectedDay">
            <option value="1">Monday</option>
            <option value="2">Tuesday</option>
            <option value="3">Wednesday</option>
            <option value="4">Thursday</option>
            <option value="5">Friday</option>
          </select>
        </div>
        
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">Time</label>
          <select class="w-full p-2 border rounded" v-model="selectedTime">
            <option value="18:00-19:00">18:00 - 19:00</option>
            <option value="19:00-20:00">19:00 - 20:00</option>
            <option value="20:00-21:00">20:00 - 21:00</option>
          </select>
        </div>
        
        <button 
          class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          @click="bookCourt"
          :disabled="isLoading || !isConfigured"
        >
          {{ isLoading ? 'Booking...' : 'Book Now' }}
        </button>
        
        <p v-if="bookingError" class="mt-2 text-red-600 text-sm">{{ bookingError }}</p>
        <p v-if="bookingSuccess" class="mt-2 text-green-600 text-sm">Booking triggered successfully!</p>
      </div>
    </div>
    
    <!-- Upcoming Bookings -->
    <div class="mt-8 bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-xl font-semibold mb-4">Upcoming Bookings</h2>
      <div v-if="bookings.length === 0" class="text-gray-500 text-center py-4">
        No upcoming bookings
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="bg-gray-100">
              <th class="py-2 px-4 text-left">Day</th>
              <th class="py-2 px-4 text-left">Date</th>
              <th class="py-2 px-4 text-left">Time</th>
              <th class="py-2 px-4 text-left">Status</th>
              <th class="py-2 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="booking in bookings" :key="booking.id" class="border-b">
              <td class="py-2 px-4">{{ booking.day }}</td>
              <td class="py-2 px-4">{{ booking.date }}</td>
              <td class="py-2 px-4">{{ booking.time }}</td>
              <td class="py-2 px-4">
                <span 
                  :class="{
                    'bg-green-100 text-green-800': booking.status === 'confirmed',
                    'bg-yellow-100 text-yellow-800': booking.status === 'pending',
                    'bg-red-100 text-red-800': booking.status === 'failed'
                  }"
                  class="px-2 py-1 rounded"
                >
                  {{ booking.status.charAt(0).toUpperCase() + booking.status.slice(1) }}
                </span>
              </td>
              <td class="py-2 px-4">
                <button 
                  class="text-red-600 hover:text-red-800"
                  @click="cancelBooking(booking.id)"
                >
                  Cancel
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import DatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { useBookingStore } from '../stores/booking';
import githubService from '../services/github';

const bookingStore = useBookingStore();
const selectedDate = ref(new Date());
const selectedDay = ref('3'); // Default to Wednesday
const selectedTime = ref('18:00-19:00');
const isLoading = ref(false);
const bookingError = ref('');
const bookingSuccess = ref(false);

// Check if GitHub is configured
const isConfigured = computed(() => githubService.isConfigured());

// Only allow booking on weekdays
const disabledDates = (date: Date) => {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
};

// Minimum date is today
const minDate = new Date();

// Get bookings from store
const bookings = computed(() => bookingStore.bookings);

// Book a court
const bookCourt = async () => {
  if (!isConfigured.value) {
    bookingError.value = 'GitHub integration is not configured. Please go to Settings.';
    return;
  }
  
  bookingError.value = '';
  bookingSuccess.value = false;
  isLoading.value = true;
  
  try {
    const success = await bookingStore.bookCourt(parseInt(selectedDay.value), selectedTime.value);
    if (success) {
      bookingSuccess.value = true;
      setTimeout(() => {
        bookingSuccess.value = false;
      }, 3000);
    } else {
      bookingError.value = 'Failed to trigger booking workflow. Check GitHub settings.';
    }
  } catch (error: any) {
    bookingError.value = error.message || 'An error occurred';
  } finally {
    isLoading.value = false;
  }
};

// Cancel a booking
const cancelBooking = (id: string) => {
  if (confirm('Are you sure you want to cancel this booking?')) {
    bookingStore.cancelBooking(id);
  }
};

// Load bookings on component mount
onMounted(() => {
  bookingStore.loadBookings();
});
</script>