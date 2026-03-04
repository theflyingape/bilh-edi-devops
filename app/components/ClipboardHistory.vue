<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <UCard
    :ui="{
      header: 'p-1 sm:px-1',
      body: 'p-1 sm:px-1',
      footer: 'p-1 sm:px-1'
    }"
  >
    <template v-if="props.title" #header>
      <div class="text-highlighted">
        Clipboard history ({{ clipBoard.items.value.length }})
      </div>
    </template>
    <template #default>
      <!-- UScrollArea with a fixed height -->
      <UScrollArea
        v-slot="{ item, index }"
        ref="scrollArea"
        :items="clipBoard.items.value"
        :virtualize="{ estimateSize: 72, skipMeasurement: false }"
        class="max-h-72 -m-1 -mt-4 -mb-4"
      >
        <div class="flex items-center justify-between h-auto">
          <UBadge class="wrap-anywhere" :color="copied == index ? 'primary' : 'neutral'" :variant="copied == index ? 'soft' : 'ghost'">
            {{ item }}
          </UBadge>
          <div class="flex-none space-x-1 space-y-1 pr-1">
            <UTooltip arrow :content="{ side: 'left', sideOffset: 2 }" text="copy to clipboard">
              <UButton
                icon="i-heroicons-clipboard-document-check"
                color="neutral"
                variant="subtle"
                @click="handleCopy(index)"
              />
            </UTooltip>
            <UTooltip arrow :content="{ side: 'left', sideOffset: 16 }" text="remove">
              <UButton
                icon="i-heroicons-archive-box-x-mark"
                color="error"
                variant="soft"
                @click="handleDelete(index)"
              />
            </UTooltip>
          </div>
        </div>
      </UScrollArea>
    </template>
    <template v-if="clipBoard.items.value.length > 4" #footer>
      <div class="flex justify-between">
        <div class="flex gap-1">
          <UTooltip arrow :content="{ side: 'top', sideOffset: 1 }" text="move to top">
            <UButton
              icon="i-lucide-arrow-up-to-line"
              color="neutral"
              variant="outline"
              @click="scrollArea?.virtualizer?.scrollToIndex(0, { align: 'start', behavior: 'smooth' })"
            />
          </UTooltip>
          <UTooltip arrow :content="{ side: 'right', sideOffset: 1 }" text="move to bottom">
            <UButton
              icon="i-lucide-arrow-down-to-line"
              color="neutral"
              variant="outline"
              @click="scrollArea?.virtualizer?.scrollToIndex(clipBoard.items.value.length - 1, { align: 'end', behavior: 'smooth' })"
            />
          </UTooltip>
        </div>
        <div class="flex justify-end">
          <UButton
            class="hover:bg-red-600"
            icon="i-heroicons-trash-solid"
            label="Clear all"
            color="neutral"
            variant="solid"
            @click="clipBoard.clear()"
          />
        </div>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { get, set } from '@vueuse/core'
import { tooltip } from '#build/ui';

const props = defineProps<{
  title?: false
}>()

const clipBoard = useClipboardHistory()
const copied = ref(-1)
const scrollArea = useTemplateRef('scrollArea')

watch(clipBoard.items, (value, oldValue) => {
  if (value.length > oldValue.length)
    setTimeout(() => {
      set(copied, value.length - 1)
      get(scrollArea)?.virtualizer?.scrollToIndex(get(copied), { align: 'end', behavior: 'smooth' })
      setTimeout(() => {
        set(copied, -1)
      }, 1000)
    }, 100)
})

// Define the click actions
const handleCopy = (item: number) => {
  if (clipBoard.items.value[item]) {
    navigator.clipboard.writeText(clipBoard.items.value[item])
    set(copied, item)
    setTimeout(() => {
      set(copied, -1)
    }, 500)
  }
}

const handleDelete = (item: number) => {
  clipBoard.items.value.splice(item, 1)
}
</script>
