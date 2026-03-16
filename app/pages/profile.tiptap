<template>
  <div>
    <UEditor
      ref="editorRef"
      v-slot="{ editor }"
      :model-value="content"
      content-type="markdown"
      :extensions="extensions"
      :handlers="customHandlers"
      autofocus
      placeholder="…"
      class="min-h-screen"
      :ui="{
        base: 'p-4 sm:p-14',
        content: 'max-w-4xl mx-auto'
      }"
      @update:model-value="onUpdate"
      @create="onCreate"
    >
      <!-- UEditorToolbar
        :editor="editor"
        :items="toolbarItems"
      / -->
      <UEditorToolbar
        :editor="editor"
        :items="bubbleToolbarItems"
        layout="bubble"
        :should-show="({ editor, view, state }: any) => {
          const { selection } = state
          return view.hasFocus() && !selection.empty
        }"
      >
        <template #link>
          <EditorLinkPopover :editor="editor" />
        </template>
      </UEditorToolbar>
      <UEditorToolbar
        :editor="editor"
        :items="getTableToolbarItems(editor)"
        layout="bubble"
        :should-show="({ editor, view }: any) => {
          return editor.state.selection instanceof CellSelection && view.hasFocus()
        }"
      />
      <UEditorDragHandle
        v-slot="{ ui }"
        :editor="editor"
        @node-change="onNodeChange"
      >
        <UDropdownMenu
          v-slot="{ open }"
          :modal="false"
          :items="getDragHandleItems(editor)"
          :content="{ side: 'left' }"
          :ui="{ content: 'w-48', label: 'text-xs' }"
          @update:open="editor.chain().setMeta('lockDragHandle', $event).run()"
        >
          <UButton
            color="neutral"
            variant="ghost"
            active-variant="soft"
            size="sm"
            icon="i-lucide-grip-vertical"
            :active="open"
            :class="ui.handle()"
          />
        </UDropdownMenu>
      </UEditorDragHandle>
      <UEditorEmojiMenu
        :editor="editor"
        :items="emojiItems"
      />
      <UEditorSuggestionMenu
        :editor="editor"
        :items="suggestionItems"
      />
    </UEditor>
  </div>
</template>

<script setup lang="ts">
import type { EditorCustomHandlers } from '@nuxt/ui'
import type { Editor } from '@tiptap/core'
import { Emoji } from '@tiptap/extension-emoji'
import { TaskList, TaskItem } from '@tiptap/extension-list'
import { TableKit } from '@tiptap/extension-table'
import { CellSelection } from '@tiptap/pm/tables'
// import { CodeBlockShiki } from 'tiptap-extension-code-block-shiki'

const route = useRoute()

const room = computed(() => route.query.room as string | undefined)

const editorRef = useTemplateRef('editorRef')

// Custom handlers for editor
const customHandlers = {
  table: {
    canExecute: (editor: Editor) => editor.can().insertTable({ rows: 3, cols: 3, withHeaderRow: true }),
    execute: (editor: Editor) => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }),
    isActive: (editor: Editor) => editor.isActive('table'),
    isDisabled: undefined
  }
} satisfies EditorCustomHandlers

const { items: emojiItems } = useEditorEmojis()
const { items: suggestionItems } = useEditorSuggestions(customHandlers)
const { getItems: getDragHandleItems, onNodeChange } = useEditorDragHandle(customHandlers)
const { toolbarItems, bubbleToolbarItems, getTableToolbarItems } = useEditorToolbar(customHandlers)

// Default content - only used when Y.js document is empty
const content = ref('')

// Set initial content for collaborative documents (only if empty)
function onCreate({ editor }: { editor: Editor }) {
  const storageKey = `editor-initialized-${room.value}`

  // Skip if already initialized this session (handles HMR)
  if (sessionStorage.getItem(storageKey)) return

  // Wait for Y.js to sync existing content from server before checking if empty
  setTimeout(() => {
    const text = editor.state.doc.textContent.trim()
    if (!text) {
      editor.commands.setContent(content.value, { contentType: 'markdown' })
    }
    sessionStorage.setItem(storageKey, 'true')
  }, 500)
}

function onUpdate(value: string) {
}

const extensions = computed(() => [
/*
  CodeBlockShiki.configure({
    defaultTheme: 'material-theme',
    themes: {
      light: 'material-theme-lighter',
      dark: 'material-theme-palenight'
    }
  }),
*/
  Emoji,
  TableKit,
  TaskList,
  TaskItem
])
</script>
