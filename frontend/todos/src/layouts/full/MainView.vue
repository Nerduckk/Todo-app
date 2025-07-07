<template>
  <v-navigation-drawer
    location="left"
    elevation="1"
    app
    class="fixed top-0"
    width="270"
    v-model="sDrawer"
  >
    <div class="py-3 flex justify-center align-center items-center gap-2">
      <Logo />
      <div class="flex align-baseline items-center">
        <div class="text-2xl font-bold text-green-500 gap-0.5">Yuki</div>
        <div class="text-xl font-bold text-gray-500">hara</div>
      </div>
    </div>
    <div>
      <perfect-scrollbar>
        <v-list class="pa-6">
          <v-list-item
            variant="flat"
            v-for="item in sidebarMenu"
            :key="item.title"
            class="rounded-lg mb-2"
            active-class="bg-primary !text-white !hover:bg-primary !hover:text-white"
            :prepend-icon="item.icon"
            :to="item.to"
            :disabled="item.disabled"
          >
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </perfect-scrollbar>
    </div>
  </v-navigation-drawer>
  <v-app-bar elevation="1" height="76" class="fixed">
    <v-app-bar-nav-icon variant="flat" @click="sDrawer = !sDrawer">
      <MenuIcon class="w-6 h-6" />
    </v-app-bar-nav-icon>
  </v-app-bar>
</template>

<script setup lang="ts">
import Logo from './vertical-sidebar/Logo/Logo.vue'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import sidebarItems from './vertical-sidebar/sidebarItem'
import { ref, shallowRef } from 'vue'
import { MenuIcon } from 'vue-tabler-icons'

const sidebarMenu = shallowRef(sidebarItems)
const sDrawer = ref(true)
</script>

<style scoped>
.v-btn__content:hover {
  color: white !important;
}
</style>
