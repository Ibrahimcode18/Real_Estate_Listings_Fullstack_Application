<script setup>
    import { reactive, ref } from 'vue';
    import { useRouter } from 'vue-router';
    import { useUserStore } from '@/stores/user';

    const router = useRouter();
    const userStore = useUserStore(); // Initialize the store
    const loading = ref(false);
    const formState = reactive({ username: '', password: '' });

    const onFinish = async (values) => {
        loading.value = true;

        // Create the Basic Auth String
        const authString = btoa(`${values.username}:${values.password}`);

        try {
            const response = await fetch('http://localhost:3000/api/v1/users/login', {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${authString}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                
                // 1. Grab BOTH the user and the token from your backend response
                const user = data.user;
                const token = data.token; // Make sure 'token' matches your backend's exact key name!

                // 2. SAVE TO PINIA (The Global Brain)
                userStore.login(user);
                
                // 3. THE FIX: Save the JWT token using the exact key your Profile page is looking for
                localStorage.setItem("token", token); 

                alert('Welcome back ' + user.username);
                
                // Check the URL for a redirect tag, otherwise default to '/'
                const redirectPath = router.currentRoute.value.query.redirect || '/';
                router.push(redirectPath);
            } else {
                alert('Login failed');
            }
        }
        catch (error) {
            console.error(error);
        } finally {
            loading.value = false;
        }
    };
</script>


<template>
    <div style="max-width: 400px; margin: 50px auto;">
        <a-card title="Login">
            <a-form :model="formState" @finish="onFinish">

                <a-form-item label="Username" name="username" :rules="[{ required: true }]">
                    <a-input v-model:value="formState.username" />
                </a-form-item>
                <a-form-item label="Password" name="password" :rules="[{ required: true }]">
                    <a-input-password v-model:value="formState.password" />
                </a-form-item>
                <a-form-item>
                    <a-button type="primary" html-type="submit" :loading="loading">Login</a-button>
                </a-form-item>
            </a-form>
        </a-card>
    </div>
</template>

