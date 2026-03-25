<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import AppCard from '@/components/AppCard.vue'
import heroIllustration from '@/assets/home-terminal.png'

const router = useRouter()

function goToApp() {
    router.push({ name: 'upload' })
}
</script>

<template>
    <div class="py-10 sm:py-16">
        <div class="max-w-4xl mx-auto">
            <AppCard dense>
                <template #header>
                    <div class="hero-layout">
                        <div class="flex flex-col gap-3 sm:gap-4">
                            <span class="inline-flex items-center rounded-full border border-[var(--border)]
                       px-3 py-1 text-[11px] uppercase tracking-wide text-[var(--text-muted)]">
                                CuentasClaras
                            </span>

                            <div class="space-y-2">
                                <h1 class="text-2xl sm:text-3xl font-semibold leading-tight">
                                    Tú pagas la boleta,
                                    <br />
                                    <span class="text-sky-500">
                                        nosotros la dividimos entre todos.
                                    </span>
                                </h1>
                                <p class="text-sm text-[var(--text-muted)] max-w-xl">
                                    Sube una foto de la boleta, invita a tus amigos y reparte cada ítem en tiempo real.
                                    Ideal para salidas al pub, pizzas, cumpleaños y más.
                                </p>
                            </div>

                            <div class="flex flex-wrap gap-3 pt-1">
                                <Button label="Usar app · subir boleta" icon="pi pi-arrow-right" @click="goToApp" />
                            </div>
                        </div>

                        <div class="hero-figure">
                            <img :src="heroIllustration" alt="Terminal de pago con boleta y tarjeta"
                                class="hero-figure-img" />
                        </div>
                    </div>
                </template>

                <div class="mt-4 text-xs sm:text-sm text-[var(--text-muted)] space-y-2">
                    <p>1. Sube la foto de tu boleta o PDF.</p>
                    <p>2. CuentasClaras detecta los ítems y genera un grupo.</p>
                    <p>
                        3. Comparte el link con tus amigos, cada uno toma lo que le corresponde y el sistema
                        reparte automáticamente el total.
                    </p>
                    <p class="pt-1">

                    </p>
                </div>
            </AppCard>
        </div>
    </div>
</template>

<style scoped>
/* Mobile: apilado texto + imagen */
.hero-layout {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

/* Desktop: texto a la izq, imagen grande a la der */
@media (min-width: 768px) {
    .hero-layout {
        flex-direction: row;
        align-items: center;
        gap: 2rem;
    }
}

.hero-figure {
    display: flex;
    justify-content: center;
}

.hero-figure-img {
    max-width: 22rem;
    /* más grande que antes */
    width: 100%;
    border-radius: 1.5rem;
    box-shadow: var(--shadow-card-hover);
    /* sin borde oscuro extra para que se sienta más “hero” */
}
</style>
