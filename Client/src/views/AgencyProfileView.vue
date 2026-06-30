<script setup>
    import { ref, onMounted } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import { PhoneOutlined, IdcardOutlined } from '@ant-design/icons-vue';
    import { API_BASE_URL } from '@/services/api';
    
    const route = useRoute();
    const router = useRouter();
    const agencyId = route.params.id;

    const agency = ref(null);
    const loading = ref(true);
    const fetchAgencyDetails = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/agents/${agencyId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}` 
                }
            }
                
            );
            if (response.ok) {
                agency.value = await response.json();
            }
        } catch (error) {
            console.error('Network error:', error);
        } finally {
            loading.value = false;
        }
    };

    onMounted(() => {
        fetchAgencyDetails();
    });
</script>

<template>
    <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
        
        <div v-if="loading" style="text-align: center; margin-top: 50px;">
            <a-spin size="large" />
        </div>

        <div v-else-if="agency">
            <a-page-header
                style="padding-left: 0;"
                @back="() => router.go(-1)"
                title="Back to Property"
            />

            <a-card style="margin-bottom: 24px; border-radius: 8px;">
                <div style="display: flex; align-items: center; gap: 24px;">
                    <div>
                        <h1 style="margin: 0; font-size: 2rem;">{{ agency.agency_name || 'Agency Name' }}</h1>
                        <p style="color: #888; font-size: 1.1rem; margin-top: 8px;">
                            {{ agency.about || 'Trusted real estate professionals.' }}
                        </p>
                    </div>
                </div>
            </a-card>

            <a-row :gutter="[16, 16]">
                <a-col :xs="24" :md="12">
                    <a-card title="Contact Details" bordered style="height: 100%; border-radius: 8px;">
                        <div style="display: flex; flex-direction: column; gap: 16px; font-size: 1.1rem;">
                            <span>
                                <PhoneOutlined style="color: #1890ff; margin-right: 8px;" /> 
                                {{ agency.phone_number || 'Not provided' }}
                            </span>
                            <span>
                                <IdcardOutlined style="color: #1890ff; margin-right: 8px;" /> 
                                License: {{ agency.license_number || 'Not provided' }}
                            </span>
                        </div>
                    </a-card>
                </a-col>
            </a-row>
        </div>

        <div v-else style="text-align: center; margin-top: 50px;">
            <h2>Agency not found.</h2>
            <a-button @click="router.push('/')">Return Home</a-button>
        </div>
    </div>
</template>