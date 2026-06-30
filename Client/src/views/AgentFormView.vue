<template>
    <div style="max-width: 500px; margin: 50px auto;">
        <a-card title="Agent Application">
            
            <template #extra>
                <a-button @click="router.go(-1)">
                    Back
                </a-button>
            </template>

            <a-form :model="formState" layout="vertical" @finish="onFinish">
                <a-form-item label="Agency Name" name="agency_name" :rules="[{ required: true }]">
                    <a-input v-model:value="formState.agency_name" />
                </a-form-item>
                
                <a-form-item label="Phone Number" name="phone_number" :rules="[{ required: true }]">
                    <a-input v-model:value="formState.phone_number" />
                </a-form-item>
                
                <a-form-item label="License Number" name="license_number" :rules="[{ required: true }]">
                    <a-input v-model:value="formState.license_number" />
                </a-form-item>

                <a-form-item label="About" name="about">
                    <a-textarea v-model:value="formState.about" :rows="4" />
                </a-form-item>
                
                <a-form-item>
                    <a-button type="primary" html-type="submit" :loading="loading" block>
                        Submit Application
                    </a-button>
                </a-form-item>
            </a-form>
        </a-card>
    </div>
</template>

<script setup>
    import { reactive, ref } from 'vue';
    import { useRouter } from 'vue-router';
    import { API_BASE_URL } from '@/services/api';
    
    const loading = ref(false);
    
    const router = useRouter(); 
    
    const formState = reactive({
        agency_name: '',
        phone_number: '',
        license_number: '',
        about: ''
    });

    const onFinish = async () => {
        loading.value = true;
        const cleanPayload = {
            agency_name: formState.agency_name,
            phone_number: formState.phone_number,
            license_number: formState.license_number
        };

        if (formState.about) cleanPayload.about = formState.about;
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/agents`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(cleanPayload)
            });
            
            if (response.ok) {
                alert('Request sent! You will be able to add Property listings upon admin approval.');
                router.push('/profile'); 
            } else {
                const errorData = await response.json();
                alert(`Request failed: ${errorData.message}`);
            }
        } catch (error) {
            console.error("Error sending request:", error);
            alert("A network error occurred while sending request.");
        } finally {
            loading.value = false;
        }
    };
</script>