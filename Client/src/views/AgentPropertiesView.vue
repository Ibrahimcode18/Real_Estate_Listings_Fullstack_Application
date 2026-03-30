<template>
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h1 style="margin: 0;">My Properties</h1>
      <a-button 
          type="primary" 
          size="large" 
          style="font-weight: bold;"
          @click="router.push('/newProperty')"
      >
          Add New Property
      </a-button>
  </div>

  <div v-if="loading">Loading...</div>

  <div v-else>
      <div v-if="properties.length === 0" style="text-align: center; margin-top: 50px; padding: 40px; background: #fafafa; border-radius: 8px;">
          <a-empty description="You haven't listed any properties yet." />
          <a-button type="primary" style="margin-top: 16px;" @click="router.push('/newProperty')">
              Create Your First Listing
          </a-button>
      </div>

      <a-row :gutter="[16, 16]" v-else>
          <a-col :xs="24" :sm="12" :md="12" :lg="8" :xl="6" v-for="property in properties" :key="property.id">
              <router-link :to="`/properties/${property.id}`" style="text-decoration: none; display: block;">
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
  </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue';
    import { useRouter } from 'vue-router';
    import { useUserStore } from '@/stores/user';
    import PropertyCard from '@/components/PropertyCard.vue';

    const router = useRouter();
    const userStore = useUserStore();
    
    const loading = ref(true);
    const properties = ref([]);

    onMounted(async () => {
        
        if (!userStore.user?.agent_id) {
            alert("You must be an agent to view this page.");
            router.push('/');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/v1/agents/${userStore.user.agent_id}/properties`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Secure request
                }
            });

            if (response.ok) {
                properties.value = await response.json();
            } else {
                console.error("Failed to fetch properties");
            }
        } catch (error) {
            console.error('Network error:', error);
        } finally {
            loading.value = false;
        }
    });
</script>