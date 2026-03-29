<script setup>
    import { ref, onMounted } from 'vue'  
    import LocationCard from '@/components/LocationCard.vue'

    const locations = ref([])
    const loading = ref(true)

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
</script>
<template>
  <h1>Locations</h1>
  <div v-if="loading">Loading...</div>

  <a-row :gutter="[16, 16]" v-else>
    <a-col :xs="24" :sm="12" :md="12" :lg="8" :xl="6" v-for="location in locations" :key="location.id">
        <router-link :to="`locations/${location.id}?name=${location.city}`">
          <LocationCard
              :name="location.city"
              :imageURL="location.imageURL"
          />
      </router-link>
    </a-col>
  </a-row>
</template>