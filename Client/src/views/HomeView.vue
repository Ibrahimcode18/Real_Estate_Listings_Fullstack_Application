<script setup>
  import { ref, onMounted } from 'vue'
  import PropertyCard from '@/components/PropertyCard.vue'

  const properties = ref([])
  const loading = ref(true)

  onMounted(async () => {
      try {
          const res = await fetch('http://localhost:3000/api/v1/properties')
          const data = await res.json()
          console.log(data);
          properties.value = data
      } catch (e) {
          console.error(e)
      } finally {
          loading.value = false
      }
  })
</script>
<template>
  <h1>Properties</h1>
  <div v-if="loading">Loading...</div>

  <a-row :gutter="[16, 16]" v-else>
      <a-col :xs="24" :sm="12" :md="12" :lg="8" :xl="6" v-for="property in properties" :key="property.id">
        <router-link :to="`properties/${property.id}`">
          <PropertyCard
              :title="property.title"
              :location="property.location"
              :price="property.price"
              :imageURL="property.image_url"
              :listing_type="property.listing_type"
          />
      </router-link>
      </a-col>
  </a-row>
</template>