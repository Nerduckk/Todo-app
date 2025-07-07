<template>
  <v-locale-provider>
    <v-app>
      <MainView />
      <v-main>
        <RouterView />
      </v-main>
    </v-app>
  </v-locale-provider>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import MainView from './MainView.vue'
</script>
