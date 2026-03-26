<script setup>
    import { reactive, ref } from 'vue';
    import { useRouter } from 'vue-router';
    const router = useRouter(); // To redirect user after success
    const loading = ref(false);
    // Reactive object to hold form data
    const formState = reactive({
        username: '',
        email: '',
        password: ''
    });
    const onFinish = async (values) => {
        loading.value = true;
        try {
            // Send data to Week 6 Backend
            const response = await fetch('http://localhost:3000/api/v1/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values)
            });
            if (response.ok) {
                alert('Registration successful! Please login.');
                router.push('/login'); // Redirect to login page
            } else {
                alert('Registration failed');
            }
        } catch (error) {
            console.error(error);
        } finally {
            loading.value = false;
        }
    };
</script>

<template>
    <div style="max-width: 400px; margin: 50px auto;">
        <a-card title="Register">
            <a-form :model="formState" @finish="onFinish">
                <a-form-item label="Username" name="username" :rules="[{ required: true, message: 'Please input your username!' }]">
                    <a-input v-model:value="formState.username" />
                </a-form-item>
                <a-form-item label="Email" name="email" :rules="[{ required: true, type: 'email' }]">
                    <a-input v-model:value="formState.email" />
                </a-form-item>
                <a-form-item label="Password" name="password" :rules="[{ required: true }]">
                    <a-input-password v-model:value="formState.password" />
                </a-form-item>
                <a-form-item>
                    <a-button type="primary" html-type="submit" :loading="loading">Sign Up</a-button>
                </a-form-item>
            </a-form>
        </a-card>
    </div>
</template>

