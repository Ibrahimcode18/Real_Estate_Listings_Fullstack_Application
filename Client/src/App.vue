<script setup>
  import { ref } from 'vue'
  import { RouterView } from 'vue-router'
  import { MenuOutlined } from '@ant-design/icons-vue'
  import AppMenu from '@/components/AppMenu.vue'

  const drawerOpen = ref(false)
</script>

<template>
  <a-layout class="layout">
    <a-layout-header class="header">
      <div class="logo">CR7 Estate Properties</div>

      <AppMenu class="desktop-menu" mode="horizontal" theme="dark" />

      <a-button type="text" class="mobile-menu-btn" aria-label="Open menu" @click="drawerOpen = true">
        <template #icon>
          <MenuOutlined />
        </template>
      </a-button>
    </a-layout-header>

    <a-drawer
      v-model:open="drawerOpen"
      title="Menu"
      placement="right"
      :width="280"
    >
      <AppMenu mode="inline" theme="light" @item-click="drawerOpen = false" />
    </a-drawer>

    <a-layout-content class="content">
      <div class="site-layout-content">
        <RouterView />
      </div>
    </a-layout-content>
    <a-layout-footer style="text-align: center">
      Web API Development ©2026 Created by Me
    </a-layout-footer>
  </a-layout>
</template>

<style scoped>
  .layout {
    min-height: 100vh;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding-inline: 16px;
    overflow: hidden;
  }

  .logo {
    flex-shrink: 1;
    min-width: 0;
    color: white;
    font-size: clamp(0.95rem, 3.5vw, 1.5rem);
    font-weight: bold;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .desktop-menu {
    flex: 1;
    min-width: 0;
    justify-content: flex-end;
  }

  .mobile-menu-btn {
    display: none;
    color: #fff;
    font-size: 22px;
    background: transparent !important;
    border-color: transparent !important;
    box-shadow: none !important;
  }

  .mobile-menu-btn:hover,
  .mobile-menu-btn:focus,
  .mobile-menu-btn:active,
  .mobile-menu-btn:focus-visible {
    color: #fff !important;
    background: transparent !important;
    border-color: transparent !important;
    box-shadow: none !important;
  }

  .mobile-menu-btn :deep(.anticon) {
    color: inherit;
  }

  .content {
    padding: 12px 12px 0;
    margin-top: 8px;
  }

  .site-layout-content {
    background: #fff;
    padding: 16px;
    min-height: 280px;
    margin-top: 8px;
    overflow-x: auto;
  }

  @media (min-width: 768px) {
    .header {
      padding-inline: 24px;
    }

    .content {
      padding: 0 50px;
      margin-top: 20px;
    }

    .site-layout-content {
      padding: 24px;
      margin-top: 24px;
    }
  }

  @media (max-width: 767px) {
    .desktop-menu {
      display: none;
    }

    .mobile-menu-btn {
      display: inline-flex;
    }
  }
</style>