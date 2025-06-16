<template>
  <div class="bookings">
    <h1 class="text-2xl font-bold mb-6">My Bookings</h1>
    
    <div v-if="isLoading" class="bg-white p-6 rounded-lg shadow-md mb-6">
      <p class="text-gray-700">Loading bookings...</p>
    </div>
    
    <div v-else-if="error" class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-yellow-700">
            {{ error }}
          </p>
        </div>
      </div>
    </div>
    
    <div v-else-if="bookings.length === 0" class="bg-white p-6 rounded-lg shadow-md mb-6">
      <p class="text-gray-700">No bookings found.</p>
    </div>
    
    <div v-else class="grid grid-cols-1 gap-6">
      <div v-for="booking in sortedBookings" :key="booking.appointment_id" 
        class="bg-white p-6 rounded-lg shadow-md"
        :class="{'border-l-4 border-red-400': booking.status === 'C'}">
        
        <div class="flex justify-between items-start mb-4">
          <h2 class="text-xl font-semibold">{{ booking.activity_name }}</h2>
          <span 
            :class="{
              'bg-green-100 text-green-800': booking.status === 'A',
              'bg-red-100 text-red-800': booking.status === 'C'
            }"
            class="px-2 py-1 rounded text-sm"
          >
            {{ booking.status_name }}
          </span>
        </div>
        
        <div class="mb-4">
          <p class="text-gray-700">
            <span class="font-semibold">Date:</span> {{ formatDate(booking.start_time) }}
          </p>
          <p class="text-gray-700">
            <span class="font-semibold">Time:</span> {{ getTimeRange(booking.start_time, booking.end_time) }}
          </p>
          <p class="text-gray-700">
            <span class="font-semibold">Location:</span> {{ booking.branch_name }}
          </p>
        </div>
        
        <div class="flex justify-between items-center">
          <p class="text-gray-700">
            <span class="font-semibold">Amount:</span> {{ booking.amount }} {{ booking.amount_unit }}
          </p>
          <p class="text-gray-700">
            <span class="font-semibold">Price:</span> {{ booking.price }} {{ booking.currency }}
          </p>
        </div>
      </div>
    </div>
    
    <div class="mt-6 flex justify-center">
      <button 
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        @click="fetchBookings"
      >
        Refresh Bookings
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import bookingService, { Booking } from '../services/booking';

const bookings = ref<Booking[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

// Computed property to sort bookings by last_update in descending order (newest first)
const sortedBookings = computed(() => {
  return [...bookings.value].sort((a, b) => b.last_update - a.last_update);
});

const fetchBookings = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    bookings.value = await bookingService.getBookings();
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch bookings';
  } finally {
    isLoading.value = false;
  }
};

const formatDate = (timestamp: number) => {
  return bookingService.formatDate(timestamp);
};

const getTimeRange = (startTime: number, endTime: number) => {
  return bookingService.getTimeRange(startTime, endTime);
};

onMounted(() => {
  fetchBookings();
});
</script>