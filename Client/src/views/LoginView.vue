<script setup>
    import { reactive, ref } from 'vue';
    import { useRouter } from 'vue-router';
    import { useUserStore } from '@/stores/user';

    const router = useRouter();
    const userStore = useUserStore();
    const loading = ref(false);
    const formState = reactive({ username: '', password: '' });

    const onFinish = async (values) => {
        loading.value = true;

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
                
                const user = data.user;
                const token = data.token; 

                userStore.login(user);
                
                localStorage.setItem("token", token); 

                alert('Welcome back ' + user.username);
                
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

