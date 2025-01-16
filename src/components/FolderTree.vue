<template>
  <ul>
    <!-- Loop untuk folder -->
    <li v-for="folder in folders" :key="folder.id" class="mb-2">
      <!-- Tombol untuk toggle folder -->
      <button @click="toggleFolder(folder)"
        class="text-left w-full bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded flex items-center">
        <span class="mr-2">
          {{ folder.open ? '📂' : '📁' }} <!-- Gunakan emoji folder -->
        </span>
        {{ folder.name }}
      </button>

      <!-- Recursive: Tampilkan sub-folder jika folder terbuka -->
      <ul v-if="folder.open && folder.children?.length" class="ml-4 mt-2">
        <FolderTree :folders="folder.children" @folderSelected="$emit('folderSelected', $event)" />
      </ul>
    </li>
  </ul>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';

// Tipe data Folder
interface Folder {
  id: number;
  name: string;
  parentId: number | null;
  children: Folder[];
  open?: boolean;
}

export default defineComponent({
  name: 'FolderTree',
  props: {
    folders: {
      type: Array as PropType<Folder[]>,
      required: true,
    },
  },
  emits: ['folderSelected'],
  methods: {
    toggleFolder(folder: Folder) {
      folder.open = !folder.open; // Toggle open/close folder
      this.$emit('folderSelected', folder); // Emit event saat folder dipilih
    },
  },
});
</script>
