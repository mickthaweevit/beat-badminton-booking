<template>
  <div class="bookings max-w-4xl mx-auto">
    <div class="flex justify-between items-center mb-3">
      <h1 class="text-xl font-bold">My Bookings</h1>
      <button 
        class="bg-blue-600 text-white px-2 py-1 rounded text-sm hover:bg-blue-700"
        @click="fetchBookings"
      >
        {{ isLoading ? 'Loading...' : 'Refresh' }}
      </button>
    </div>
    
    <div v-if="error" class="bg-yellow-50 border-l-4 border-yellow-400 p-2 mb-3 text-sm">
      {{ error }}
    </div>
    
    <div v-if="bookings.length === 0 && !isLoading" class="bg-white p-3 rounded shadow-sm text-sm text-center text-gray-500">
      No bookings found
    </div>
    
    <div v-else class="space-y-4">
      <div v-for="group in groupedBookings" :key="group.date" class="booking-group">
        <div class="flex items-center mb-2">
          <div class="h-px bg-gray-200 flex-grow mr-3"></div>
          <div class="text-xs font-medium text-gray-500">{{ group.formattedDate }}</div>
          <div class="h-px bg-gray-200 flex-grow ml-3"></div>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div v-for="booking in group.bookings" :key="booking.appointment_id" 
            class="bg-white p-2 rounded shadow-sm text-sm"
            :class="{'border-l-4 border-red-400': booking.status === 'C'}">
            
            <div class="flex justify-between items-center mb-1">
              <div class="font-medium">{{ booking.activity_name }}</div>
              <span 
                :class="{
                  'bg-green-100 text-green-800': booking.status === 'A',
                  'bg-red-100 text-red-800': booking.status === 'C'
                }"
                class="px-1 py-0.5 rounded text-xs"
              >
                {{ booking.status_name }}
              </span>
            </div>
            
            <div class="grid grid-cols-2 gap-1 text-xs">
              <div><span class="text-gray-500">Date:</span> {{ formatDate(booking.start_time) }}</div>
              <div><span class="text-gray-500">Time:</span> {{ getTimeRange(booking.start_time, booking.end_time) }}</div>
              <div><span class="text-gray-500">Courts:</span> {{ booking.amount }} {{ booking.amount_unit }}</div>
              <div><span class="text-gray-500">Location:</span> {{ booking.branch_name }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import bookingService, { Booking } from '../services/booking';

const bookings = ref<Booking[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

// Group bookings by date (last_update)
const groupedBookings = computed(() => {
  // First sort bookings by last_update in ascending order
  const sorted = [...bookings.value].sort((a, b) => b.last_update - a.last_update);
  
  // Group by date (ignoring time)
  const groups: Record<string, Booking[]> = {};
  
  sorted.forEach(booking => {
    // Get date string as key (YYYY-MM-DD)
    const date = new Date(booking.last_update * 1000);
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    
    groups[dateKey].push(booking);
  });
  
  // Convert to array of groups for v-for
  return Object.entries(groups).map(([date, bookings]) => ({
    date,
    formattedDate: formatDate(bookings[0].last_update),
    bookings
  }));
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