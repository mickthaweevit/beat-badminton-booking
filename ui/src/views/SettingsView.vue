<template>
  <div class="settings">
    <h1 class="text-2xl font-bold mb-6">Settings</h1>
    
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-xl font-semibold mb-4">GitHub Integration</h2>
      
      <div class="mb-4">
        <label class="block text-gray-700 mb-2">GitHub Repository</label>
        <input type="text" class="w-full p-2 border rounded" placeholder="username/repository" v-model="repository" />
      </div>
      
      <div class="mb-4">
        <label class="block text-gray-700 mb-2">GitHub Token</label>
        <input type="password" class="w-full p-2 border rounded" placeholder="ghp_xxxxxxxxxxxx" v-model="token" />
        <p class="text-sm text-gray-500 mt-1">
          Needs permissions: repo, workflow
        </p>
      </div>
      
      <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" @click="saveSettings">
        Save Settings
      </button>
    </div>
    
    <div class="mt-8 bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-xl font-semibold mb-4">Booking Defaults</h2>
      
      <div class="mb-4">
        <label class="block text-gray-700 mb-2">Default Booking Time</label>
        <select class="w-full p-2 border rounded" v-model="defaultTime">
          <option value="18:00-19:00">18:00 - 19:00</option>
          <option value="19:00-20:00">19:00 - 20:00</option>
          <option value="20:00-21:00">20:00 - 21:00</option>
        </select>
      </div>
      
      <div class="mb-4">
        <label class="block text-gray-700 mb-2">Auto-book Days</label>
        <div class="flex flex-wrap gap-2">
          <label class="inline-flex items-center">
            <input type="checkbox" class="form-checkbox" value="1" v-model="autobookDays" />
            <span class="ml-2">Monday</span>
          </label>
          <label class="inline-flex items-center">
            <input type="checkbox" class="form-checkbox" value="2" v-model="autobookDays" />
            <span class="ml-2">Tuesday</span>
          </label>
          <label class="inline-flex items-center">
            <input type="checkbox" class="form-checkbox" value="3" v-model="autobookDays" />
            <span class="ml-2">Wednesday</span>
          </label>
          <label class="inline-flex items-center">
            <input type="checkbox" class="form-checkbox" value="4" v-model="autobookDays" />
            <span class="ml-2">Thursday</span>
          </label>
          <label class="inline-flex items-center">
            <input type="checkbox" class="form-checkbox" value="5" v-model="autobookDays" />
            <span class="ml-2">Friday</span>
          </label>
        </div>
      </div>
      
      <div class="flex space-x-4">
        <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" @click="saveBookingDefaults">
          Save Locally
        </button>
        
        <button class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" @click="updateGitHubConfig">
          Save to GitHub
        </button>
      </div>
      
      <div v-if="configUpdateStatus" class="mt-4" :class="configUpdateStatus.success ? 'text-green-600' : 'text-red-600'">
        {{ configUpdateStatus.message }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import githubService from '../services/github';

const repository = ref('');
const token = ref('');
const defaultTime = ref('18:00-19:00');
const autobookDays = ref(['3']); // Default to Wednesday
const configUpdateStatus = ref<{ success: boolean; message: string } | null>(null);

const saveSettings = () => {
  // Save GitHub settings
  localStorage.setItem('github_repo', repository.value);
  localStorage.setItem('github_token', token.value);
  alert('GitHub settings saved!');
};

const saveBookingDefaults = () => {
  // Save booking defaults
  localStorage.setItem('default_time', defaultTime.value);
  localStorage.setItem('autobook_days', JSON.stringify(autobookDays.value));
  alert('Booking defaults saved locally!');
};

const updateGitHubConfig = async () => {
  if (!githubService.isConfigured()) {
    configUpdateStatus.value = {
      success: false,
      message: 'GitHub is not configured. Please set up your repository and token first.'
    };
    return;
  }
  
  try {
    // Create a commit to update the config file
    const content = {
      defaultTime: defaultTime.value,
      autobookDays: autobookDays.value.map(Number)
    };
    
    const response = await githubService.updateConfigFile('booking-config.json', content);
    if (response) {
      configUpdateStatus.value = {
        success: true,
        message: 'GitHub configuration updated successfully!'
      };
      
      // Clear the status message after 3 seconds
      setTimeout(() => {
        if (configUpdateStatus.value?.success) {
          configUpdateStatus.value = null;
        }
      }, 3000);
    } else {
      configUpdateStatus.value = {
        success: false,
        message: 'Failed to update GitHub configuration.'
      };
    }
  } catch (error: any) {
    configUpdateStatus.value = {
      success: false,
      message: `Error: ${error.message}`
    };
  }
};

// Load saved settings
if (localStorage.getItem('github_repo')) {
  repository.value = localStorage.getItem('github_repo') || '';
}
if (localStorage.getItem('github_token')) {
  token.value = localStorage.getItem('github_token') || '';
}
if (localStorage.getItem('default_time')) {
  defaultTime.value = localStorage.getItem('default_time') || '18:00-19:00';
}
if (localStorage.getItem('autobook_days')) {
  try {
    autobookDays.value = JSON.parse(localStorage.getItem('autobook_days') || '["3"]');
  } catch (e) {
    console.error('Error parsing autobook days', e);
  }
}
</script>