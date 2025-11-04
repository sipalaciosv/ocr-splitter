<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import GroupBoard from '@/components/OCRSplitter/GroupBoard.vue'

const route = useRoute()
const groupId = computed(() => String(route.params.id ?? 'grp_demo'))
</script>

<template>
    <GroupBoard :group-id="groupId" />
</template>
