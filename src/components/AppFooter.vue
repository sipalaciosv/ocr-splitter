<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
    <footer data-app-footer class="mt-10 border-t border-[var(--border)] bg-[var(--surface-0)]">
        <div class="max-w-6xl mx-auto px-4 py-6 text-sm">
            <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
                <p class="text-[var(--text-muted)]">
                    © {{ year }} CuentasClaras
                </p>
                <div class="flex items-center gap-4">
                    <a class="hover:underline text-[var(--text-muted)]" href="#" rel="nofollow">Ayuda</a>
                    <a class="hover:underline text-[var(--text-muted)]" href="#" rel="nofollow">Acerca de</a>
                    <a class="hover:underline text-[var(--text-muted)]" href="#" rel="nofollow">Privacidad</a>
                </div>
            </div>
        </div>
    </footer>
</template>
