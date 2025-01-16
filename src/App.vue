<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import apiClient from './api/axios';
import Homeview from './views/HomeView.vue';

interface ApiResponse<T> {
  data: T;
}
interface Folder {
  id: number;
  name: string;
  parentId: number | null;
  children: Folder[];
  open?: boolean;
}

export default defineComponent({
  name: 'App',
  components: {
    Homeview,
  },
  setup() {
    const folders = ref<Folder[]>([]); // State untuk folder
    const selectedFolder = ref<Folder | null>(null); // Folder yang dipilih

    const fetchFolders = async () => {
      try {
        const response = await apiClient.get<ApiResponse<Folder[]>>('/'); // Gunakan tipe Folder[]
        folders.value = response.data.data;
      } catch (error) {
        console.error('Error fetching folders:', error);
      }
    };

    const onFolderSelected = (folder: Folder) => {
      selectedFolder.value = folder;
    };

    onMounted(fetchFolders);

    return { folders, selectedFolder, onFolderSelected };
  },
});

</script>
<template>
  <!-- Pastikan folders diteruskan -->
  <Homeview :folders="folders" @folderSelected="onFolderSelected" />
</template>
