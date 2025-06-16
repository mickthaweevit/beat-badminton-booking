<template>
  <div class="min-h-screen">
    <header class="bg-blue-600 text-white p-4 shadow-md">
      <div class="container mx-auto flex justify-between items-center">
        <h1 class="text-xl font-bold">Badminton Booking</h1>
      </div>
    </header>
    
    <main class="container mx-auto p-4">
      <router-view />
    </main>
    
    <footer class="bg-gray-100 p-4 mt-8">
      <div class="container mx-auto text-center text-gray-600 text-sm">
        &copy; {{ new Date().getFullYear() }} Badminton Booking
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// App component setup
</script>