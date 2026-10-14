<script setup>
  import { RouterLink } from 'vue-router'
  import { useUserStore } from '@/stores/user'
  defineProps({
    mode: { type: String, default: 'horizontal' },
    theme: { type: String, default: 'dark' }
  })
  const emit = defineEmits(['itemClick'])
  const userStore = useUserStore()
</script>
<template>
  <a-menu :theme="theme" :mode="mode" :selectable="false" @click="emit('itemClick')">
    <a-menu-item key="home">
      <RouterLink to="/">Home</RouterLink>
    </a-menu-item>
    <a-menu-item key="locations">
      <RouterLink to="/locations">Locations</RouterLink>
    </a-menu-item>
    <template v-if="userStore.user.loggedIn">
      <a-menu-item v-if="userStore.user.role === 'admin'" key="dashboard">
        <RouterLink to="/dashboard">Dashboard</RouterLink>
      </a-menu-item>
      <a-menu-item v-if="userStore.user.agent_id !== null" key="agent-properties">
        <RouterLink to="/agentproperties">My Properties</RouterLink>
      </a-menu-item>
    </template>
    <template v-if="!userStore.user.loggedIn">
      <a-menu-item key="login" :class="{ 'push-right': mode === 'horizontal' }">
        <RouterLink to="/login">Login</RouterLink>
      </a-menu-item>
      <a-menu-item key="register">
        <RouterLink to="/register">Register</RouterLink>
      </a-menu-item>
    </template>
    <template v-else>
      <a-menu-item key="greeting" :class="{ 'push-right': mode === 'horizontal' }" disabled>
        Hello, {{ userStore.user.username }}
      </a-menu-item>
      <a-menu-item key="profile">
        <RouterLink to="/profile">Profile</RouterLink>
      </a-menu-item>
      <a-menu-item key="logout">
        <RouterLink to="/login" @click="userStore.logout">Logout</RouterLink>
      </a-menu-item>
    </template>
  </a-menu>
</template>
<style scoped>
  .push-right {
    margin-left: auto;
  }
  :deep(.ant-menu-dark) .router-link-active {
    color: #ffffff !important;
    font-weight: bold;
  }
  :deep(.ant-menu-light) .router-link-active {
    font-weight: bold;
  }
</style>