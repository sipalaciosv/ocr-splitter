<script setup lang="ts">
import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'
</script>

<template>
    <div class="min-h-screen flex flex-col bg-[var(--surface-1)] text-[var(--text-0)]">
        <AppNavbar />

        <!-- Contenido -->
        <main class="flex-1 w-full">
            <div class="max-w-6xl mx-auto px-3 sm:px-4 py-6">
                <slot />
            </div>
        </main>

        <AppFooter />
    </div>
</template>
