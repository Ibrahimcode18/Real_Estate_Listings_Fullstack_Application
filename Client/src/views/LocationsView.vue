<script setup>
    import { ref, onMounted } from 'vue';
    import { useUserStore } from '@/stores/user';  
    import LocationCard from '@/components/LocationCard.vue';
    import LocationModal from '@/components/LocationModal.vue';

    const locations = ref([])
    const loading = ref(true)
    const userStore = useUserStore()
    
    const isModalVisible = ref(false)
    const selectedLocation = ref(null)

    onMounted(async () => {
        try {
            const res = await fetch('http://localhost:3000/api/v1/locations')
            const data = await res.json()
            console.log(data);
            locations.value = data
        } catch (e) {
            console.error(e)
        } finally {
            loading.value = false
        }
    })

    const openAddModal = () => {
        selectedLocation.value = null
        isModalVisible.value = true
    }

    const openUpdateModal = (location) => {
        selectedLocation.value = location
        isModalVisible.value = true
    }

    const handleLocationSaved = (savedLocation, wasEditing) => {
        if (wasEditing) {
            const index = locations.value.findIndex(loc => loc.id === savedLocation.id)
            if (index !== -1) locations.value[index] = savedLocation
        } else {
            locations.value.push(savedLocation)
        }
    }

    const handleDeleteLocation = async (id) => {
        if (confirm('Are you sure you want to delete this location?')) {
            try {
                const res = await fetch(`http://localhost:3000/api/v1/locations/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                })
                if (res.ok) {
                    locations.value = locations.value.filter(loc => loc.id !== id)
                }
            } catch (e) {
                console.error('Failed to delete:', e)
            }
        }
    }
</script>
<template>
    <div style="display: flex; justify-content: space-between; 
        align-items: center; margin-bottom: 20px;">
        <h1 style="margin: 0;">Locations</h1>
        
        <a-button type="primary" v-if="userStore.user?.role === 'admin'" 
            @click="openAddModal" size="large"style="font-weight: bold;"
        >
            Add Location
        </a-button>
    </div>
    <div v-if="loading">Loading...</div>

    <a-row :gutter="[16, 16]" v-else>
        <a-col :xs="24" :sm="12" :md="12" :lg="8" :xl="6" v-for="location in locations" :key="location.id" class="location-item">
            <router-link :to="`/locations/${location.id}?name=${location.city}`" class="location-link">
                <LocationCard
                    :name="location.city"
                    :imageURL="location.imageURL"
                />
            </router-link>
            <div 
                v-if="userStore.user?.role === 'admin'" 
                style="margin-top: 10px; display: flex; gap: 10px; justify-content: center;"
            >
                <a-button size="small" type="primary" ghost @click="openUpdateModal(location)">
                    Update
                </a-button>
                <a-button size="small" type="primary" danger @click="handleDeleteLocation(location.id)">
                    Delete
                </a-button>
            </div>
        </a-col>
    </a-row>
    <LocationModal 
      v-model:open="isModalVisible" 
      :initialData="selectedLocation" 
      @saved="handleLocationSaved"
    />
</template>

<style scoped>
.location-item {
    display: flex;
    flex-direction: column;
}

.location-link {
    display: block;
    width: 100%;
    height: 100%;
}
</style>