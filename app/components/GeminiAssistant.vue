<template>
  <div class="ai-container">
    <h3>Gemini Assistant</h3>
    <textarea
      v-model="input"
      placeholder="Ask something..."
    />
    <UButton
      :disabled="loading"
      @click="askAI"
    >
      {{ loading ? 'Thinking...' : 'Generate' }}
    </UButton>
    <div
      v-if="response"
      class="result"
    >
      <strong>AI Response:</strong>
      <p>{{ response }}</p>
    </div>
  </div>
</template>

<script setup>
const input = ref('')
const response = ref('')
const loading = ref(false)

async function askAI() {
  if (!input.value) return
  loading.value = true

  try {
    const { data } = await useFetch('/api/chat', {
      method: 'POST',
      body: { prompt: input.value }
    })
    response.value = data.value.response
  } catch (err) {
    response.value = `Error connecting to AI: ${err}`
  } finally {
    loading.value = false
  }
}
</script>
