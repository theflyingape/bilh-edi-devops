<!-- eslint-disable vue/first-attribute-linebreak -->
<template>
  <div>
    <div v-if="editor">
      <UButton color="neutral" icon="i-heroicons-bold" variant="outline"
        :disabled="!editor.can().chain().focus().toggleBold().run()"
        :class="{ 'is-active': editor.isActive('bold') }" @click="editor.chain().focus().toggleBold().run()"
      />
      <UButton color="neutral" icon="i-heroicons-italic" variant="outline"
        :disabled="!editor.can().chain().focus().toggleItalic().run()"
        :class="{ 'is-active': editor.isActive('italic') }" @click="editor.chain().focus().toggleItalic().run()"
      />
      <UButton color="neutral" icon="i-heroicons-strikethrough" variant="outline"
        :disabled="!editor.can().chain().focus().toggleStrike().run()"
        :class="{ 'is-active': editor.isActive('strike') }" @click="editor.chain().focus().toggleStrike().run()"
      />
      <UButton color="neutral" icon="i-heroicons-code-bracket" variant="outline"
        :disabled="!editor.can().chain().focus().toggleCode().run()"
        :class="{ 'is-active': editor.isActive('code') }" @click="editor.chain().focus().toggleCode().run()"
      />
      <UButton @click="editor.chain().focus().unsetAllMarks().run()">
        clear marks
      </UButton>
      <UButton @click="editor.chain().focus().clearNodes().run()">
        clear nodes
      </UButton>
      <UButton color="neutral" icon="i-heroicons-arrow-turn-down-left" variant="outline"
        :class="{ 'is-active': editor.isActive('paragraph') }"
        @click="editor.chain().focus().setParagraph().run()"
      />
      <UButton color="neutral" icon="i-heroicons-h1" variant="outline"
        :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
        @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
      />
      <UButton color="neutral" icon="i-heroicons-h2" variant="outline"
        :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
      />
      <UButton color="neutral" icon="i-heroicons-h3" variant="outline"
        :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
      />
      <UButton color="neutral" icon="i-heroicons-list-bullet" variant="outline"
        :class="{ 'is-active': editor.isActive('bulletList') }"
        @click="editor.chain().focus().toggleBulletList().run()"
      />
      <UButton color="neutral" icon="i-heroicons-numbered-list" variant="outline"
        :class="{ 'is-active': editor.isActive('orderedList') }"
        @click="editor.chain().focus().toggleOrderedList().run()"
      />
      <UButton color="neutral" icon="i-heroicons-pencil-square" variant="outline"
        :class="{ 'is-active': editor.isActive('codeBlock') }"
        @click="editor.chain().focus().toggleCodeBlock().run()"
      />
      <UButton color="neutral" icon="i-heroicons-chat-bubble-left-ellipsis" variant="outline"
        :class="{ 'is-active': editor.isActive('blockquote') }"
        @click="editor.chain().focus().toggleBlockquote().run()"
      />
      <UButton color="neutral" icon="i-material-symbols-horizontal-rule" variant="outline"
        @click="editor.chain().focus().setHorizontalRule().run()"
      />
      <UButton color="neutral" icon="i-material-symbols-insert-page-break" variant="outline"
        @click="editor.chain().focus().setHardBreak().run()"
      />
      <UButton color="neutral" icon="i-material-symbols-undo" variant="outline"
        :disabled="!editor.can().chain().focus().undo().run()" @click="editor.chain().focus().undo().run()"
      />
      <UButton color="neutral" icon="i-material-symbols-redo" variant="outline"
        :disabled="!editor.can().chain().focus().redo().run()" @click="editor.chain().focus().redo().run()"
      />
    </div>
    <TiptapEditorContent :editor="editor" />
  </div>
</template>

<script setup>
const editor = useEditor({
  content: `<p>I'm running Tiptap with Vue.js. 🎉</p>`,
  extensions: [TiptapStarterKit]
})

onBeforeUnmount(() => {
  unref(editor).destroy()
})
</script>
