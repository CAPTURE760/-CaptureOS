<template>
  <n-config-provider :theme="darkTheme" :theme-overrides="themeOverrides">
    <n-message-provider>
      <n-dialog-provider>
        <n-notification-provider>
          <router-view />
        </n-notification-provider>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { NConfigProvider, NMessageProvider, NDialogProvider, NNotificationProvider, darkTheme } from 'naive-ui'
import type { GlobalThemeOverrides } from 'naive-ui'

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#e94560',
    primaryColorHover: '#ff6b81',
    primaryColorPressed: '#c0392b',
    bodyColor: '#0d1117',
    cardColor: '#161b22',
    modalColor: '#161b22',
    popoverColor: '#161b22',
    inputColor: '#0d1117',
    tableColor: '#161b22',
    borderColor: 'rgba(255,255,255,0.06)',
    dividerColor: 'rgba(255,255,255,0.06)',
    textColorBase: '#e0e0e0',
    textColor1: '#e0e0e0',
    textColor2: '#c0c0c0',
    textColor3: '#8b949e',
  },
  Card: {
    borderColor: 'rgba(255,255,255,0.06)',
    color: '#161b22',
  },
  DataTable: {
    borderColor: 'rgba(255,255,255,0.06)',
    thColor: '#161b22',
    tdColor: '#161b22',
  },
  Input: {
    color: '#0d1117',
    borderColor: 'rgba(255,255,255,0.1)',
    colorFocus: '#0d1117',
  },
  Button: {
    colorPrimary: '#e94560',
    colorHoverPrimary: '#ff6b81',
    colorPressedPrimary: '#c0392b',
  },
  Menu: {
    itemTextColorActive: '#e94560',
    itemTextColorActiveHover: '#e94560',
    itemIconColorActive: '#e94560',
    itemIconColorActiveHover: '#e94560',
    itemTextColorHoverActive: '#e94560',
    itemIconColorHoverActive: '#e94560',
    arrowColorActive: '#e94560',
    arrowColorActiveHover: '#e94560',
  },
}
</script>
