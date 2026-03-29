<template>
    <div style="max-width: 500px; margin: 50px auto;">
        <a-card title="My Account Settings">
            <template #extra>
                <a-button type="default" v-if="userStore.user.role !== 'admin' && !userStore.user.agent_id"
                @click="router.push('/agent-application')">
                    Become an Agent
                </a-button>
            </template>
            <a-form :model="draftState" layout="vertical" @finish="onSave">
                <a-form-item label="Username" name="username" :rules="[{ required: true }]">
                    <a-input v-model:value="draftState.username" />
                </a-form-item>
                <a-form-item label="Email" name="email" :rules="[{ required: true, type:'email' }]">
                    <a-input v-model:value="draftState.email" />
                </a-form-item>
                <a-form-item label="Firstname" name="first_name">
                    <a-input v-model:value="draftState.first_name" />
                </a-form-item>

                <a-form-item label="Lastname" name="last_name">
                    <a-input v-model:value="draftState.last_name" />
                </a-form-item>
                <a-form-item>
                    <a-button type="primary" html-type="submit" :loading="isSaving">Save Changes</a-button>
                </a-form-item>
            </a-form>
        </a-card>

        <a-card title="Agent Information" style="margin-top: 20px;" v-if="userStore.user.agent_id">
            <a-form :model="agentDraftState" layout="vertical" @finish="onAgentSave">
                
                <a-form-item label="Agency Name" name="agency_name">
                    <a-input v-model:value="agentDraftState.agency_name" />
                </a-form-item>
                <a-form-item label="Phone Number" name="phone_number">
                    <a-input v-model:value="agentDraftState.phone_number" />
                </a-form-item>
                <a-form-item label="License Number" name="license_number">
                    <a-input :value="agentDraftState.license_number" disabled />
                </a-form-item>
                <a-form-item label="About Agency" name="about">
                    <a-textarea v-model:value="agentDraftState.about" :rows="4" />
                </a-form-item>

                <a-form-item>
                    <a-button type="primary" html-type="submit" :loading="isAgentSaving">Save Agent Info</a-button>
                </a-form-item>
            </a-form>
        </a-card>
    </div>
</template>

<script setup>
    import { reactive, ref, onMounted } from 'vue';
    import { useUserStore } from '@/stores/user';
    import { useRouter } from 'vue-router'; 
    
    const userStore = useUserStore();
    const isSaving = ref(false);
    const isAgentSaving = ref(false);
    const router = useRouter();
    
    const draftState = reactive({
        ...userStore.user,
        email: '',
        first_name: '',
        last_name: ''
    });

    const agentDraftState = reactive({
        license_number: '',
        agency_name: '',
        phone_number: '',
        about: ''
    });

    onMounted(async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/v1/users/${userStore.user.ID}`, {
                headers: {
                    // Don't forget to send your JWT so the backend knows you have permission!
                    'Authorization': `Bearer ${localStorage.getItem('token')}` 
                }
            });
            console.log(response);

            if (response.ok) {
                const fullProfile = await response.json();
                
                // Merge the fresh database data into our draftState!
                Object.assign(draftState, fullProfile);
                console.log(draftState);
            } else {
                console.error("Failed to fetch profile");
            }
        } catch (error) {
            console.error("Network error:", error);
        }

        if (userStore.user.agent_id) {
            try {
                const agentResponse = await fetch(`http://localhost:3000/api/v1/agents/${userStore.user.agent_id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}` 
                    }
                });

                if (agentResponse.ok) {
                    const agentProfile = await agentResponse.json();
                    Object.assign(agentDraftState, agentProfile);
                } else {
                    console.error("Failed to fetch agent profile");
                }
            } catch (error) {
                console.error("Network error fetching agent data:", error);
            }
        }
    });

    const onSave = async () => {
        isSaving.value = true; 
        const cleanPayload = {
            username: draftState.username,
            email: draftState.email
        };

        if (draftState.first_name) cleanPayload.first_name = draftState.first_name;
        if (draftState.last_name) cleanPayload.last_name = draftState.last_name;
        try {
            const response = await fetch(`http://localhost:3000/api/v1/users/${userStore.user.ID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(cleanPayload)
            });

            if (response.ok) {
                userStore.updateProfile({
                    username: draftState.username,
                    email: draftState.email
                });
                
                alert("Profile updated successfully!");
            } else {
                const errorData = await response.json();
                alert(`Update failed: ${errorData.message}`);
            }
        } catch (error) {
            console.error("Error saving profile:", error);
            alert("A network error occurred while saving.");
        } finally {
            isSaving.value = false; 
        }
    };

    const onAgentSave = async () => {
        isAgentSaving.value = true; 
        
        const agentPayload = {
            agency_name: agentDraftState.agency_name,
            phone_number: agentDraftState.phone_number,
            about: agentDraftState.about
        };

        try {
            const response = await fetch(`http://localhost:3000/api/v1/agents/${userStore.user.agent_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(agentPayload)
            });

            if (response.ok) {
                alert("Agent information updated successfully!");
            } else {
                const errorData = await response.json();
                alert(`Agent update failed: ${errorData.message}`);
            }
        } catch (error) {
            console.error("Error saving agent profile:", error);
            alert("A network error occurred while saving.");
        } finally {
            isAgentSaving.value = false; 
        }
    };
</script>
