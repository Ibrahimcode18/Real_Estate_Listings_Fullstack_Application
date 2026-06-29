<script setup>
  import { RouterView, RouterLink } from 'vue-router'
  import { useUserStore } from '@/stores/user' // Import Store

  const userStore = useUserStore()
</script>

<template>
  <a-layout class="layout">
    <a-layout-header>
      <div class="logo">CR7 Estate Properties</div>

      <a-menu theme="dark" mode="horizontal" :selectable="false">
        <a-menu-item key="1"><RouterLink to="/">Home</RouterLink></a-menu-item>
        <a-menu-item key="6"><RouterLink to="/locations">Locations</RouterLink></a-menu-item>

        <template v-if="userStore.user.loggedIn">
          <template v-if="userStore.user.role === 'admin'">
            <a-menu-item key="4"><RouterLink to="/dashboard">Dashboard</RouterLink></a-menu-item>
          </template>
          <template v-if="userStore.user.agent_id !== null">
            <a-menu-item key="8"><RouterLink to="/agentproperties">My Properties</RouterLink></a-menu-item>
          </template>
        </template>

        <template v-if="!userStore.user.loggedIn">
            <a-menu-item key="2" style="margin-left: auto">
                <RouterLink to="/login">Login</RouterLink>
            </a-menu-item>
            <a-menu-item key="3"><RouterLink to="/register">Register</RouterLink></a-menu-item>
        </template>

        <template v-else>
            <a-menu-item key="5" style="margin-left: auto">
                Hello, {{ userStore.user.username }}
            </a-menu-item>
            <a-menu-item key="7"><RouterLink to="/profile">Profile</RouterLink></a-menu-item>
            <a-menu-item key="9"><RouterLink to="/login" @click="userStore.logout">Logout</RouterLink></a-menu-item>
        </template>
    </a-menu>
    </a-layout-header>

    <a-layout-content style="padding: 0 50px; margin-top: 20px">
      <div class="site-layout-content">
        <RouterView />
      </div>
    </a-layout-content>
    <a-layout-footer style="text-align: center">
      Web Development ©2026 Created by Ibrahimcode18
    </a-layout-footer>
  </a-layout>
</template>

<style scoped>

  .site-layout-content {
    background: #fff;
    padding: 24px;
    min-height: 280px;
    margin-top: 24px;
  }
  .logo {
    float: left;
    width: 300px;
    height: 31px;
    color: white;
    font-size: 1.5rem;
    font-weight: bold;
    line-height: 64px; 
  }
  .router-link-active {
    color: #ffffff !important;
    font-weight: bold;
  }
</style>