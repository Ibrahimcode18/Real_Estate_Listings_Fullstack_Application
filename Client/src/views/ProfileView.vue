<template>
    <div style="max-width: 500px; margin: 50px auto;">
    <a-card title="My Account Settings">

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
    </div>
</template>

<script setup>
    import { reactive, ref, onMounted } from 'vue';
    import { useUserStore } from '@/stores/user';
    
    const userStore = useUserStore();
    const isSaving = ref(false);
    
    const draftState = reactive({
        ...userStore.user,
        email: '',
        first_name: '',
        last_name: ''
    });

    // 2. Fetch the missing data the moment the component loads on the screen
    onMounted(async () => {
        try {
            // Note: Update this URL to match your actual backend route and port!
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
    });

    const onSave = async () => {
        isSaving.value = true; 
        const cleanPayload = {
            username: draftState.username,
            email: draftState.email
        };

        if (draftState.bio) cleanPayload.bio = draftState.bio;
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
</script>
