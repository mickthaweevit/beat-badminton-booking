<template>
  <div class="home max-w-4xl mx-auto">
    <h1 class="text-xl font-bold mb-3">Badminton Booking</h1>
    
    <div v-if="!isConfigured" class="bg-yellow-50 border-l-4 border-yellow-400 p-2 mb-3 text-sm">
      GitHub integration not configured. Please set up your repository and token below.
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <!-- GitHub Integration -->
      <div class="bg-white p-3 rounded shadow-sm">
        <h2 class="text-lg font-medium mb-2">GitHub Integration</h2>
        
        <div class="mb-2">
          <label class="text-sm text-gray-600">Repository</label>
          <input type="text" class="w-full p-1 border rounded text-sm" placeholder="username/repository" v-model="repository" />
        </div>
        
        <div class="mb-2">
          <label class="text-sm text-gray-600">Token</label>
          <input type="password" class="w-full p-1 border rounded text-sm" placeholder="ghp_xxxxxxxxxxxx" v-model="token" />
          <p class="text-xs text-gray-500">Needs: repo, workflow</p>
        </div>
        
        <div class="flex space-x-2">
          <button class="bg-blue-600 text-white px-2 py-1 rounded text-sm hover:bg-blue-700" @click="saveSettings">
            Save
          </button>
          <button v-if="isConfigured" class="bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm" @click="fetchGitHubConfig">
            Load Config
          </button>
        </div>
      </div>

      <!-- Booking Configuration -->
      <div class="bg-white p-3 rounded shadow-sm">
        <h2 class="text-lg font-medium mb-2">Booking Configuration</h2>
        
        <div class="mb-3">
          <label class="text-sm text-gray-600 block mb-1">Auto-book Days</label>
          <div class="flex flex-wrap gap-2 mb-2">
            <label v-for="(day, i) in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']" :key="i" class="inline-flex items-center">
              <input type="checkbox" class="form-checkbox" :value="i+1" v-model="autobookDays" />
              <span class="ml-1 text-sm">{{ day }}</span>
            </label>
          </div>
        </div>
        
        <div class="mb-3">
          <label class="text-sm text-gray-600 block mb-1">Time Slots</label>
          <div class="grid grid-cols-1 sm:grid-cols-5 gap-2">
            <div v-for="(slot, index) in bookingSlots" :key="index" 
                class="booking-slot border rounded p-1 flex flex-col items-center justify-between items-stretch"
                :class="{'bg-green-50 border-green-200': slot.enabled, 'bg-gray-50': !slot.enabled}">
              <div class="flex items-center justify-between">
                <input type="checkbox" class="form-checkbox" v-model="slot.enabled" />
                <span class="ml-1 text-xs">{{ getTimeLabel(index) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-500 mr-1">Qty:</span>
                <select class="p-0.5 border rounded text-xs" v-model="slot.courts">
                  <option :value="1">1</option>
                  <option :value="2">2</option>
                  <option :value="3">3</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <button class="bg-green-600 text-white px-2 py-1 rounded text-sm hover:bg-green-700" @click="updateGitHubConfig">
          Save to GitHub
        </button>
        
        <div v-if="configUpdateStatus" class="mt-2 text-sm" :class="configUpdateStatus.success ? 'text-green-600' : 'text-red-600'">
          {{ configUpdateStatus.message }}
        </div>
      </div>
    </div>
    
    <!-- Workflow Runs -->
    <div v-if="isConfigured" class="mt-3 bg-white p-3 rounded shadow-sm">
      <div class="flex justify-between items-center mb-2">
        <h2 class="text-lg font-medium">Recent Runs</h2>
        <button 
          class="bg-blue-600 text-white px-2 py-1 rounded text-sm hover:bg-blue-700"
          @click="fetchWorkflowRuns"
          :disabled="isLoadingWorkflows"
        >
          {{ isLoadingWorkflows ? 'Loading...' : 'Refresh' }}
        </button>
      </div>
      
      <div v-if="workflowRuns.length === 0 && !isLoadingWorkflows" class="text-sm text-gray-500 text-center py-2">
        No workflow runs found
      </div>
      
      <div v-else-if="isLoadingWorkflows" class="text-sm text-gray-500 text-center py-2">
        Loading...
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50">
              <th class="py-1 px-2 text-left">Name</th>
              <th class="py-1 px-2 text-left">Status</th>
              <th class="py-1 px-2 text-left">Created</th>
              <th class="py-1 px-2 text-left w-16">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="run in workflowRuns" :key="run.id" class="border-b">
              <td class="py-1 px-2">{{ run.name || 'Unknown' }}</td>
              <td class="py-1 px-2">
                <span 
                  :class="{
                    'bg-green-100 text-green-800': run.status === 'completed' && run.conclusion === 'success',
                    'bg-yellow-100 text-yellow-800': run.status === 'in_progress',
                    'bg-red-100 text-red-800': run.status === 'completed' && run.conclusion !== 'success'
                  }"
                  class="px-1 py-0.5 rounded text-xs"
                >
                  {{ run.status === 'completed' ? run.conclusion : run.status }}
                </span>
              </td>
              <td class="py-1 px-2 text-xs">{{ formatDate(run.created_at) }}</td>
              <td class="py-1 px-2">
                <a 
                  :href="run.html_url" 
                  target="_blank" 
                  class="text-blue-600 hover:text-blue-800 text-xs"
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
const autobookDays = ref(['3']); // Default to Wednesday
const bookingSlots = ref([
  { label: '17:00', enabled: false, time: '17:00-18:00', courts: 1 },
  { label: '18:00', enabled: false, time: '18:00-19:00', courts: 1 },
  { label: '19:00', enabled: false, time: '19:00-20:00', courts: 1 },
  { label: '20:00', enabled: false, time: '20:00-21:00', courts: 1 },
  { label: '21:00', enabled: false, time: '21:00-22:00', courts: 1 }
]);

// Function to get the time label for each slot
const getTimeLabel = (index: number): string => {
  // Use the label from the slot if available, otherwise use the time
  const slot = bookingSlots.value[index];
  if (slot && slot.label) {
    return slot.label;
  }
  
  const timeSlots = [
    '17:00-18:00',
    '18:00-19:00',
    '19:00-20:00',
    '20:00-21:00',
    '21:00-22:00'
  ];
  return timeSlots[index] || `Slot ${index + 1}`;
};

// Format date to DD-MM-YYYY HH:MM:SS
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
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
      
      if (configContent.autobookDays && Array.isArray(configContent.autobookDays)) {
        // Convert numbers to strings for checkbox binding
        autobookDays.value = configContent.autobookDays.map((day: number|string) => String(day));
      }
      
      // Load slots configuration if available
      if (configContent.slots && Array.isArray(configContent.slots)) {
        // Make sure we have all required slots
        const defaultSlots = [
          { label: '17:00', enabled: false, time: '17:00-18:00', courts: 1 },
          { label: '18:00', enabled: false, time: '18:00-19:00', courts: 1 },
          { label: '19:00', enabled: false, time: '19:00-20:00', courts: 1 },
          { label: '20:00', enabled: false, time: '20:00-21:00', courts: 1 },
          { label: '21:00', enabled: false, time: '21:00-22:00', courts: 1 }
        ];
        
        // Use the slots from config, or default if not available
        bookingSlots.value = configContent.slots.map((slot: any, index: number) => {
          // Ensure all required properties exist
          return {
            label: slot.label || defaultSlots[index]?.label || `${17 + index}:00`,
            enabled: slot.enabled !== undefined ? slot.enabled : true,
            time: slot.time || defaultSlots[index]?.time || `${17 + index}:00-${18 + index}:00`,
            courts: slot.courts || 1
          };
        });
        
        // Ensure we have all 5 slots
        while (bookingSlots.value.length < 5) {
          const index = bookingSlots.value.length;
          bookingSlots.value.push(defaultSlots[index] || { 
            label: `${17 + index}:00`,
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
  // We no longer use localStorage for booking configuration
  // Configuration is now stored in GitHub only
}
</script>