<template>
  <div class="home">
    <h1 class="text-2xl font-bold mb-6">Automation Booking Settings</h1>
    
    <div v-if="!isConfigured" class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-yellow-700">
            GitHub integration is not configured. Please fill in your GitHub repository and token below to enable automatic booking.
          </p>
        </div>
      </div>
    </div>

    <div class="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 class="text-xl font-semibold mb-4">How It Works</h2>
      <p class="text-gray-700 mb-2">
        This app automatically books badminton courts <strong>exactly one week in advance</strong> of your selected days.
      </p>
      <p class="text-gray-700">
        For example, if you enable Wednesday bookings, the system will book next Wednesday's court on the current Wednesday.
      </p>
    </div>
    
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
      
      <div v-if="isConfigured" class="mb-4">
        <button 
          class="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          @click="fetchGitHubConfig"
        >
          Load Settings from GitHub
        </button>
      </div>
      
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
      
      <div class="mb-4">
        <label class="block text-gray-700 mb-2">Time Slots Configuration</label>
        <div class="bg-gray-50 p-4 rounded border">
          <div class="flex flex-col gap-3">
            <div v-for="(slot, index) in bookingSlots" :key="index" class="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0">
              <div class="flex items-center">
                <input type="checkbox" class="form-checkbox" v-model="slot.enabled" />
                <span class="ml-2 font-medium">{{ getTimeLabel(index) }}</span>
              </div>
              
              <div>
                <label class="inline-block text-sm text-gray-600 mr-2">Courts:</label>
                <select class="p-2 border rounded" v-model="slot.courts">
                  <option :value="1">1</option>
                  <option :value="2">2</option>
                  <option :value="3">3</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="flex">
        <button class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" @click="updateGitHubConfig">
          Save to GitHub
        </button>
      </div>
      
      <div v-if="configUpdateStatus" class="mt-4" :class="configUpdateStatus.success ? 'text-green-600' : 'text-red-600'">
        {{ configUpdateStatus.message }}
      </div>
    </div>
    
    <div v-if="isConfigured" class="mt-8 bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-xl font-semibold mb-4">Recent Workflow Runs</h2>
      <button 
        class="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        @click="fetchWorkflowRuns"
        :disabled="isLoadingWorkflows"
      >
        {{ isLoadingWorkflows ? 'Loading...' : 'Refresh Workflows' }}
      </button>
      
      <div v-if="workflowRuns.length === 0 && !isLoadingWorkflows" class="text-gray-500 text-center py-4">
        No workflow runs found
      </div>
      
      <div v-else-if="isLoadingWorkflows" class="text-gray-500 text-center py-4">
        Loading workflow runs...
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="bg-gray-100">
              <th class="py-2 px-4 text-left">Name</th>
              <th class="py-2 px-4 text-left">Status</th>
              <th class="py-2 px-4 text-left">Created</th>
              <th class="py-2 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="run in workflowRuns" :key="run.id" class="border-b">
              <td class="py-2 px-4">{{ run.name || 'Unknown' }}</td>
              <td class="py-2 px-4">
                <span 
                  :class="{
                    'bg-green-100 text-green-800': run.status === 'completed' && run.conclusion === 'success',
                    'bg-yellow-100 text-yellow-800': run.status === 'in_progress',
                    'bg-red-100 text-red-800': run.status === 'completed' && run.conclusion !== 'success'
                  }"
                  class="px-2 py-1 rounded"
                >
                  {{ run.status === 'completed' ? run.conclusion : run.status }}
                </span>
              </td>
              <td class="py-2 px-4">{{ new Date(run.created_at).toLocaleString() }}</td>
              <td class="py-2 px-4">
                <a 
                  :href="run.html_url" 
                  target="_blank" 
                  class="text-blue-600 hover:text-blue-800"
                >
                  View
                </a>
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
import githubService from '../services/github';

// Check if GitHub is configured
const isConfigured = computed(() => githubService.isConfigured());

// Load settings on component mount
onMounted(() => {
  // Load saved settings when component mounts
  loadSavedSettings();
  
  // Fetch workflow runs and config if GitHub is configured
  if (isConfigured.value) {
    fetchWorkflowRuns();
    fetchGitHubConfig();
  }
});

const repository = ref('');
const token = ref('');
const defaultTime = ref('18:00-19:00');
const autobookDays = ref(['3']); // Default to Wednesday
const bookingSlots = ref([
  { enabled: true, time: '17:00-18:00', courts: 1 },
  { enabled: true, time: '18:00-19:00', courts: 1 },
  { enabled: true, time: '19:00-20:00', courts: 1 },
  { enabled: true, time: '20:00-21:00', courts: 1 },
  { enabled: true, time: '21:00-22:00', courts: 1 }
]);

// Function to get the time label for each slot
const getTimeLabel = (index: number): string => {
  const timeSlots = [
    '17:00 - 18:00',
    '18:00 - 19:00',
    '19:00 - 20:00',
    '20:00 - 21:00',
    '21:00 - 22:00'
  ];
  return timeSlots[index] || `Slot ${index + 1}`;
};
const configUpdateStatus = ref<{ success: boolean; message: string } | null>(null);
const workflowRuns = ref<any[]>([]);
const isLoadingWorkflows = ref(false);

const saveSettings = () => {
  // Save GitHub settings
  localStorage.setItem('github_repo', repository.value);
  localStorage.setItem('github_token', token.value);
  alert('GitHub settings saved!');
  
  // Fetch config from GitHub if now configured
  if (githubService.isConfigured()) {
    fetchGitHubConfig();
    fetchWorkflowRuns();
  }
};

// Function removed as we're only saving to GitHub now

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
      autobookDays: autobookDays.value.map(Number),
      slots: bookingSlots.value
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

// Fetch GitHub workflow runs
const fetchWorkflowRuns = async () => {
  if (!isConfigured.value) return;
  
  isLoadingWorkflows.value = true;
  try {
    const runs = await githubService.getWorkflowRuns();
    workflowRuns.value = runs;
    console.log('Workflow runs:', runs);
  } catch (error: any) {
    console.error('Error fetching workflow runs:', error.message);
  } finally {
    isLoadingWorkflows.value = false;
  }
};

// Fetch booking configuration from GitHub
const fetchGitHubConfig = async () => {
  if (!isConfigured.value) return;
  
  try {
    // Add a method to githubService to fetch file content
    const configContent = await githubService.getFileContent('booking-config.json');
    if (configContent) {
      console.log('GitHub config:', configContent);
      
      // Update local state with GitHub config
      if (configContent.defaultTime) {
        defaultTime.value = configContent.defaultTime;
      }
      
      if (configContent.autobookDays && Array.isArray(configContent.autobookDays)) {
        // Convert numbers to strings for checkbox binding
        autobookDays.value = configContent.autobookDays.map((day: number|string) => String(day));
      }
      
      // Load slots configuration if available
      if (configContent.slots && Array.isArray(configContent.slots)) {
        // Make sure we have all required slots
        const defaultSlots = [
          { enabled: true, time: '17:00-18:00', courts: 1 },
          { enabled: true, time: '18:00-19:00', courts: 1 },
          { enabled: true, time: '19:00-20:00', courts: 1 },
          { enabled: true, time: '20:00-21:00', courts: 1 },
          { enabled: true, time: '21:00-22:00', courts: 1 }
        ];
        
        // Use the slots from config, or default if not available
        bookingSlots.value = configContent.slots.map((slot: any, index: number) => {
          // Ensure all required properties exist
          return {
            enabled: slot.enabled !== undefined ? slot.enabled : true,
            time: slot.time || defaultSlots[index]?.time || `${17 + index}:00-${18 + index}:00`,
            courts: slot.courts || 1
          };
        });
        
        // Ensure we have all 5 slots
        while (bookingSlots.value.length < 5) {
          const index = bookingSlots.value.length;
          bookingSlots.value.push(defaultSlots[index] || { 
            enabled: true, 
            time: `${17 + index}:00-${18 + index}:00`, 
            courts: 1 
          });
        }
      }
    }
  } catch (error: any) {
    console.error('Error fetching GitHub config:', error.message);
  }
};

// Function to load saved settings from localStorage
const loadSavedSettings = () => {
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
}
</script>