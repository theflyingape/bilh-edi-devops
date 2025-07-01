<!-- eslint-disable vue/first-attribute-linebreak -->
<!-- eslint-disable vue/max-attributes-per-line -->
<!-- eslint-disable vue/singleline-html-element-content-newline -->
<template>
  <div class="flex flex-col items-center justify-center">
    <UCard class="m-2" variant="subtle">
      <template #default>
        <div class="flex flex-row justify-center">
          <div class="w-1/4">
            <b>Base64</b> (<i>also known as tetrasexagesimal</i>) is a group of binary-to-text encoding
            schemes that transforms binary data into a sequence of printable characters.
          </div>
          <div>
            <UButton class="h-10 m-4" @click="open64">Choose file</UButton>
          </div>
          <div class="ml-2 w-1/4">
            <UTextarea v-model="ascii" class="font-mono w-full" color="neutral" autoresize :maxrows="4" placeholder="Plaintext ..." />
          </div>
          <div class="flex flex-col justify-start">
            <UButton size="sm" icon="i-lucide-clipboard-x" color="neutral" variant="link" @click="ascii=''" />
            <UButton :color="cAscii ? 'success' : 'neutral'" :icon="cAscii ? 'i-lucide-copy-check' : 'i-lucide-copy'" variant="link" size="sm" @click="copy(ascii, 'ascii')" />
          </div>
          <div class="ml-6 w-1/3">
            <UTextarea v-model="b64" class="font-mono w-full" color="info" autoresize :maxrows="4" placeholder="base64 encoded ..." disabled />
          </div>
          <div class="flex flex-col justify-start">
            <UButton size="sm" icon="i-lucide-clipboard-x" color="neutral" variant="link" @click="ascii=''" />
            <UButton :color="cB64 ? 'success' : 'neutral'" :icon="cB64 ? 'i-lucide-copy-check' : 'i-lucide-copy'" variant="link" size="sm" @click="copy(b64, 'b64')" />
          </div>
        </div>
      </template>
    </UCard>
    <UCard class="m-2" variant="subtle">
      <template #default>
        <div class="flex flex-row justify-center">
          <div class="w-1/3">
            <div>
              <b>SFTP</b> (<i>Secure File Transfer Protocol)</i> is a secure method for transferring files
              between a local computer and a remote server over a network. It is built on top of the SSH protocol,
              providing encryption and authentication to <b>protect data during transfer</b>.
            </div>
          </div>
          <div class="w-full">
            <UStepper ref="stepper" :items="items">
              <template #start>
                <Placeholder class="aspect-video">
                  <div class="flex flex-row">
                    <IrisSelect />
                    <IrisProduction :hcie="Instance" />
                    <URadioGroup v-model="xfer" :items="xfers" />
                    start
                  </div>
                </Placeholder>
              </template>
              <template #test>
                <Placeholder class="aspect-video">
                  test
                </Placeholder>
              </template>
              <template #review>
                <Placeholder class="aspect-video">
                  review
                </Placeholder>
              </template>
            </UStepper>

            <div class="flex gap-2 justify-between mt-4">
              <UButton leading-icon="i-lucide-arrow-left" :disabled="!stepper?.hasPrev" @click="stepper?.prev()">
                Prev
              </UButton>
              <UButton trailing-icon="i-lucide-arrow-right" :disabled="!stepper?.hasNext" @click="stepper?.next()">
                Next
              </UButton>
            </div>
          </div>
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { set, useFileSystemAccess } from '@vueuse/core'
import type { RadioGroupItem, RadioGroupValue, StepperItem } from '@nuxt/ui'

definePageMeta({
  auth: false,
  pageTransition: { name: 'page', mode: 'out-in' }
})

const file = useFileSystemAccess({ excludeAcceptAllOption: false })

// Base64
const ascii = ref()
const cAscii = ref(false)
const { base64: b64 } = useBase64(ascii)
const cB64 = ref(false)

function copy(text: string, clip: string) {
  navigator.clipboard.writeText(text)
  const copied = clip == 'ascii' ? cAscii : clip == 'b64' ? cB64 : undefined
  set(copied!, true)

  setTimeout(() => {
    set(copied!, false)
  }, 2000)
}

async function open64() {
  await file.open()
  set(ascii, file.data.value)
}

// SFTP
const items: StepperItem[] = [
  {
    slot: 'start' as const,
    title: 'SFTP',
    description: 'Start here for essentials'
  }, {
    slot: 'test' as const,
    title: 'Unit-test',
    description: 'Validate access to endpoint'
  }, {
    slot: 'review' as const,
    title: 'Review',
    description: 'Summarize config to build interface'
  }
]

const InstanceDefault = useIrisSessions()
const Instance = ref(InstanceDefault)
const stepper = useTemplateRef('stepper')
const xfers = ref<RadioGroupItem[]>(['Pick-up', 'Drop-off'])
const xfer = ref<RadioGroupValue>('Pick-up')
</script>
