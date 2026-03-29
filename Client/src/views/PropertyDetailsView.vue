<script setup>
import { ref, computed, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { MessageOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import { useUserStore } from '@/stores/user';

const route = useRoute();
const router = useRouter();
const property = ref(null);
const loading = ref(true);
const userStore = useUserStore();
const locations = ref([]);
const isUpdating = ref(false);
const isDeleting = ref(false);

const updateFormState = reactive({
    title: '',
    description: '',
    price: null,
    listing_type: '',
    location_id: null
});


const canEdit = computed(() => {
    if (!userStore.user || !property.value) return false;
    return userStore.user.role === 'admin' || userStore.user.agent_id === property.value.agent_id;
});

const fetchLocations = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/v1/locations');
        if (response.ok) locations.value = await response.json();
    } catch (error) {
        console.error('Error fetching locations:', error);
    }
};

const fetchPropertyDetails = async () => {
    const propertyId = route.params.id;
    try {
        const response = await fetch(`http://localhost:3000/api/v1/properties/${propertyId}`);
        if (response.ok) {
            property.value = await response.json();
            Object.assign(updateFormState, {
                title: property.value.title,
                description: property.value.description,
                price: property.value.price,
                listing_type: property.value.listing_type,
                location_id: property.value.location_id
            });
            if (canEdit.value) fetchLocations();
        } else {
            console.error('Property not found');
        }
    } catch (error) {
        console.error('Network error:', error);
    } finally {
        loading.value = false;
    }
};

const onUpdate = async () => {
    isUpdating.value = true;
    try {
        const response = await fetch(`http://localhost:3000/api/v1/properties/${property.value.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(updateFormState)
        });

        if (response.ok) {
            alert('Property updated successfully!');
            // Instantly update the UI with the new data without refreshing the page!
            Object.assign(property.value, updateFormState); 
        } else {
            const errorData = await response.json();
            alert(`Update failed: ${errorData.message}`);
        }
    } catch (error) {
        console.error("Update Error:", error);
        alert("A network error occurred.");
    } finally {
        isUpdating.value = false;
    }
};

const onDelete = async () => {
    isDeleting.value = true;
    try {
        const response = await fetch(`http://localhost:3000/api/v1/properties/${property.value.id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            alert('Property deleted successfully.');
            router.push('/'); 
        } else {
            const errorData = await response.json();
            alert(`Delete failed: ${errorData.message}`);
        }
    } catch (error) {
        console.error("Delete Error:", error);
        alert("A network error occurred while trying to delete.");
    } finally {
        isDeleting.value = false;
    }
};

onMounted(() => {
    fetchPropertyDetails();
});
</script>

<template>
    <div style="max-width: 1000px; margin: 0 auto; padding: 20px;">
        
        <div v-if="loading" style="text-align: center; margin-top: 50px;">
            <a-spin size="large" />
            <p>Loading property details...</p>
        </div>

        <div v-else-if="property">
            <a-page-header
                style="border: 1px solid rgb(235, 237, 240); margin-bottom: 20px; background: white;"
                :title="property.title"
                :sub-title="` ${property.location || 'England'}`"
                @back="() => router.go(-1)"
            >
                <template #extra>
                    <a-button type="primary" size="large" @click="router.push(`/agency/${property.agent_id}`)">
                        <template #icon><MessageOutlined /></template>
                        Contact Agency For Enquiries
                    </a-button>
                </template>
            </a-page-header>

            <img 
                :src="property.imageURL || 'https://picsum.photos/1000/500'" 
                style="width: 100%; height: 400px; object-fit: cover; border-radius: 8px; margin-bottom: 24px;"
            />

            <a-descriptions title="Property Information" bordered :column="{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }">
                <a-descriptions-item label="Price">
                    <span style="font-size: 1.1rem; font-weight: bold; color: black;">
                        £{{ property.price ? property.price : '0' }}
                        <span v-if="property.listing_type === 'rent'" style="font-size: 0.8rem; color: black;"> pcm</span>
                    </span>
                </a-descriptions-item>
                
                <a-descriptions-item label="Listing Type">
                    <a-tag :color="property.listing_type === 'rent' ? 'green' : 'red'">
                        {{ property.listing_type === 'rent' ? 'To Rent' : 'For Sale' }}
                    </a-tag>
                </a-descriptions-item>
                
                <a-descriptions-item label="Location">
                    {{ property.location }}
                </a-descriptions-item>

                <a-descriptions-item label="Description" :span="3">
                    {{ property.description || 'No description provided by the agent.' }}
                </a-descriptions-item>
            </a-descriptions>
        </div>

        <div v-else style="text-align: center; margin-top: 50px;">
            <h2>Property not found.</h2>
            <a-button @click="router.push('/')">Return to Home</a-button>
        </div>

        <div v-if="canEdit" style="display: flex; justify-content: flex-end; margin-top: 32px; margin-bottom: 16px;">
            <a-popconfirm
                title="Are you sure you want to delete this listing? This cannot be undone."
                ok-text="Yes, Delete"
                cancel-text="Cancel"
                placement="left"
                @confirm="onDelete"
            >
                <a-button type="primary" danger :loading="isDeleting">
                    <template #icon><DeleteOutlined /></template>
                    Delete Property
                </a-button>
            </a-popconfirm>
        </div>

        <a-card v-if="canEdit" title="Edit Property Details" style="margin-top: 32px; border: 1px solid #1890ff;">
            <a-form :model="updateFormState" layout="vertical" @finish="onUpdate">
                
                <a-row :gutter="16">
                    <a-col :xs="24" :md="12">
                        <a-form-item label="Property Title" name="title" :rules="[{ required: true }]">
                            <a-input v-model:value="updateFormState.title" :maxlength="62" />
                        </a-form-item>
                    </a-col>
                    <a-col :xs="24" :md="6">
                        <a-form-item label="Price (£)" name="price" :rules="[{ required: true }]">
                            <a-input-number v-model:value="updateFormState.price" style="width: 100%" :min="0" />
                        </a-form-item>
                    </a-col>
                    <a-col :xs="24" :md="6">
                        <a-form-item label="Listing Type" name="listing_type" :rules="[{ required: true }]">
                            <a-select v-model:value="updateFormState.listing_type">
                                <a-select-option value="sale">For Sale</a-select-option>
                                <a-select-option value="rent">For Rent</a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>
                </a-row>

                <a-row :gutter="16">
                    <a-col :xs="24" :md="12">
                        <a-form-item label="Location" name="location_id" :rules="[{ required: true }]">
                            <a-select v-model:value="updateFormState.location_id">
                                <a-select-option v-for="loc in locations" :key="loc.id" :value="loc.id">
                                    {{ loc.name || loc.city }}
                                </a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>
                </a-row>

                <a-form-item label="Description" name="description" :rules="[{ required: true }]">
                    <a-textarea v-model:value="updateFormState.description" :rows="4" />
                </a-form-item>

                <a-form-item style="margin-bottom: 0;">
                    <a-button type="primary" html-type="submit" :loading="isUpdating">
                        Save Changes
                    </a-button>
                </a-form-item>

            </a-form>
        </a-card>
    </div>
</template>