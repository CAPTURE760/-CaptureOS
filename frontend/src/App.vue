<template>
  <router-view v-slot="{ Component }">
    <component :is="Component" />
  </router-view>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>
