<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <UTable
    class="flex"
    :data="processList[props.hcie]"
    :columns="columns"
    :ui="{
      th: 'p-2',
      tr: 'even:bg-gray-50 odd:bg-white',
      td: 'p-2'
    }"
  />
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { processes } from '~/composables/useIrisSessions'

const props = defineProps<{
  hcie: HCIE //  instance identifier
}>()

const { processList, endpoint } = useIrisSessions()
const columns: TableColumn<processes>[] = [
  {
    accessorKey: 'Production',
    meta: {
      class: {
        th: 'text-center',
        td: 'font-medium'
      }
    }
  },
  {
    accessorKey: 'File',
    meta: {
      class: {
        th: 'text-right',
        td: (cell) => {
          let format = 'text-right '
          if (cell.getValue() > 9) format += 'text-medium '
          if (cell.getValue() > 29) format += 'text-red-500 '
          return format
        }
      }
    }
  },
  {
    accessorKey: 'Net',
    meta: {
      class: {
        th: 'text-right',
        td: (cell) => {
          let format = 'text-right '
          if (cell.getValue() > 99) format += 'text-medium '
          return format
        }
      }
    }
  },
  {
    accessorKey: 'Queue',
    meta: {
      class: {
        th: 'text-right',
        td: (cell) => {
          let format = 'text-right '
          if (cell.getValue() > 99) format += 'text-medium '
          if (cell.getValue() > 999) format += 'text-red-500 '
          return format
        }
      }
    }
  },
  {
    accessorKey: 'Misc',
    meta: {
      class: {
        th: 'text-right',
        td: (cell) => {
          let format = 'text-right '
          if (cell.getValue() > 9) format += 'text-medium '
          return format
        }
      }
    }
  }
]

await processes()

async function processes() {
  await endpoint(props.hcie, 'processes').then((results) => {
    if (results) {
      processList.value[props.hcie] = results.productions
    }
  })
}
</script>
