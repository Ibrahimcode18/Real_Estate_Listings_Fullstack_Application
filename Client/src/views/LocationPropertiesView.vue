<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PropertyCard from '@/components/PropertyCard.vue'; // Make sure this path is correct
import { API_BASE_URL } from '@/services/api';

const route = useRoute();
const router = useRouter();
const properties = ref([]);
const loading = ref(true);

const locationName = route.query.name;
const fetchPropertiesByLocation = async () => {
    const locationId = route.params.id;
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/locations/${locationId}/properties`, {
            headers: {
                // Don't forget to send your JWT so the backend knows you have permission!
                'Authorization': `Bearer ${localStorage.getItem('token')}` 
            }
        });
        if (response.ok) {
            properties.value = await response.json();
        }
    } catch (error) {
        console.error('Network error:', error);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchPropertiesByLocation();
});
</script>

<template>
    <div style="padding: 20px;">
        <a-page-header style="padding: 0 0 20px 0;" @back="() => router.go(-1)">
            <template #title>
                <h2 style="margin: 0;">Properties in {{ locationName }}</h2>
            </template>
        </a-page-header>
        <div v-if="loading" style="text-align: center; margin-top: 50px;">
            <a-spin size="large" />
        </div>

        <div v-else-if="properties.length === 0" style="text-align: center; margin-top: 50px;">
            <h2>No properties currently available in {{ locationName }}.</h2>
        </div>

        <a-row :gutter="[16, 16]" v-else>
            <a-col 
                :xs="24" :sm="12" :md="12" :lg="8" :xl="6" 
                v-for="property in properties" 
                :key="property.id"
            >
                <router-link :to="`/properties/${property.id}`" style="text-decoration: none;">
                    <PropertyCard
                        :title="property.title"
                        :location="property.location" 
                        :price="property.price"
                        :imageURL="property.imageURL"
                        :listing_type="property.listing_type"
                    />
                </router-link>
            </a-col>
        </a-row>
    </div>
</template>