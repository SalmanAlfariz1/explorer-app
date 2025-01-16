<script lang="ts" setup>
import { ref, watch } from 'vue';
import apiClient from '../api/axios';

const defaultFolderData: FolderData = {
  idFolder: 0,
  namaFolder: '',
  folders: [],
  files: [],
};

interface Folder {
  id: number;
  name: string;
  parentId: number;
  createdAt: string;
  updatedAt: string;
  type: 'Folder';
}

interface File {
  id: number;
  name: string;
  size: number;
  fileType: string;
  folderId: number;
  file_upload: string;
  createdAt: string;
  updatedAt: string;
}

// Props untuk menerima data folder
interface FolderData {
  idFolder: number;
  namaFolder: string;
  folders: Array<{
    id: number;
    name: string;
    parentId: number;
    createdAt: string;
    updatedAt: string;
    files: Array<{
      id: number;
      name: string;
      size: number;
      fileType: string;
      folderId: number;
      file_upload: string;
      createdAt: string;
      updatedAt: string;
    }>;
  }>;
  files: Array<{
    id: number;
    name: string;
    size: number;
    fileType: string;
    folderId: number;
    file_upload: string;
    createdAt: string;
    updatedAt: string;
  }>;
}


const props = defineProps<{ folderData: FolderData | null }>();
const emit = defineEmits<{ (event: 'updateFolderData', folderData: FolderData): void }>();


// State untuk data yang ditampilkan di tabel
const items = ref([
  {
    id: 0,
    name: 'Folder 1',
    type: 'Folder',
    size: 0,
    date: '2025-01-15 14:00',
  },
  {
    id: 0,
    name: 'File 1',
    type: 'JPEG',
    size: 503404,
    date: '2025-01-15 15:56',
  },
]);

// Salinan dari folderData untuk dimodifikasi
const localFolderData = ref<FolderData>(props.folderData || defaultFolderData);

// Watcher untuk memantau perubahan pada props.folderData
watch(
  () => props.folderData,
  (newData) => {
    localFolderData.value = newData || defaultFolderData;
    items.value = [
      ...localFolderData.value.folders.map((folder) => ({
        id: folder.id,  // Menambahkan id dari folder
        name: folder.name,
        type: 'Folder',
        size: 0,
        date: new Date(folder.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
      })),
      ...localFolderData.value.files.map((file) => ({
        id: file.id,  // Menambahkan id dari file
        name: file.name,
        type: file.fileType,
        size: file.size,
        date: new Date(file.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
      })),
    ];
  },
  { immediate: true }
);

// State untuk item yang dipilih
const selectedItems = ref<string[]>([]);
// State untuk modal tambah folder
const isModalOpen = ref(false);
const newFolderName = ref('');
const isLoading = ref(false);

// Format ukuran file
const formatSize = (size: number): string => {
  if (size === 0) return '-';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(size) / Math.log(1024));
  return `${(size / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
};

// Fungsi untuk membuat folder baru
const createFolder = async () => {
  // Pastikan parentId diambil dari folder induk yang saat ini dilihat
  const parentId = props.folderData ? props.folderData.idFolder : 0; // Default ke 0 jika tidak ada parent

  // Cek nilai newFolderName
  console.log("Nama folder:", newFolderName.value);
  if (!newFolderName.value.trim()) {
    alert('Nama folder tidak boleh kosong.');
    return;
  }

  try {
    isLoading.value = true;

    // Mengirimkan data ke API
    const response = await apiClient.post(`/${parentId}`, {
      name: newFolderName.value,
    });
    if (response.data.success) {
      alert('Folder berhasil dibuat!')
      // Mendapatkan folder yang baru dibuat
      const newFolder = response.data;
      // Menambahkan folder ke dalam salinan data lokal
      localFolderData.value.folders.push(newFolder);
      items.value.unshift({
        id: newFolder.id,
        name: newFolderName.value,
        type: 'Folder',
        size: 0,
        date: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
      });
    } else {
      alert(response.data.message);
    }

    // Emit event ke komponen induk untuk memberitahukan adanya perubahan
    emit('updateFolderData', localFolderData.value);

    newFolderName.value = '';
    isModalOpen.value = false;
  } catch (error) {
    console.error('Error creating folder:', error);
  } finally {
    isLoading.value = false;
  }
};
// Fungsi untuk mengubah nama folder atau file
const handleUpdate = async (item: Folder | File) => {
  const isFolder = (item as Folder).type == 'Folder'; // Mengecek apakah item adalah folder

  if (isFolder) {
    // Jika item adalah folder, panggil API untuk memperbarui folder
    updateFolder((item as Folder).id);  // updateFolder sudah dijelaskan sebelumnya
  } else {
    // Jika item adalah file, panggil API untuk memperbarui file
    // updateFile((item as File).folderId, (item as File).id);  // updateFile sudah dijelaskan sebelumnya
  }
};

// Fungsi untuk menghapus folder atau file
const handleDelete = async (item: Folder | File) => {
  const isFolder = (item as Folder).type == 'Folder'; // Mengecek apakah item adalah folder

  try {
    isLoading.value = true;

    if (isFolder) {
      // Jika item adalah folder, panggil API untuk menghapus folder
      const response = await apiClient.delete(`${(item as Folder).id}`);
      if (response.data.success) {
        alert('Folder berhasil dihapus!');
        // Hapus folder dari localFolderData dan items
        localFolderData.value.folders = localFolderData.value.folders.filter((folder) => folder.id !== (item as Folder).id);
      } else {
        alert('Gagal menghapus folder');
      }
    } else {
      // Jika item adalah file, panggil API untuk menghapus file
      const response = await apiClient.delete(`/file/${(item as File).id}`);
      if (response.data.success) {
        alert('File berhasil dihapus!');
        // Hapus file dari localFolderData dan items
        localFolderData.value.files = localFolderData.value.files.filter((file) => file.id !== (item as File).id);
      } else {
        alert('Gagal menghapus file');
      }
    }

    // Update items setelah perubahan
    items.value = [
      ...localFolderData.value.folders.map((folder) => ({
        id: folder.id,
        name: folder.name,
        type: 'Folder',
        size: 0,
        date: new Date(folder.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
      })),
      ...localFolderData.value.files.map((file) => ({
        id: file.id,
        name: file.name,
        type: file.fileType,
        size: file.size,
        date: new Date(file.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
      })),
    ];
  } catch (error) {
    console.error('Error deleting item:', error);
  } finally {
    isLoading.value = false;
  }
};


// Fungsi untuk mengubah nama folder
const updateFolder = async (folderId: number) => {
  const folderToUpdate = localFolderData.value.folders.find(folder => folder.id === folderId);
  if (!folderToUpdate) {
    alert('Folder tidak ditemukan.');
    return;
  }

  const newFolderName = prompt('Masukkan nama folder baru:', folderToUpdate.name);
  if (!newFolderName?.trim()) {
    alert('Nama folder tidak boleh kosong.');
    return;
  }

  try {
    isLoading.value = true;
    const response = await apiClient.patch(`/${folderId}`, {
      name: newFolderName,
    });
    if (response.data.success) {
      folderToUpdate.name = newFolderName; // Update nama folder di data lokal
      alert('Folder berhasil diubah!');
      // Perbarui nama folder di local data
      const folder = localFolderData.value.folders.find(f => f.id === response.data.data.id);
      if (folder) {
        folder.name = folderToUpdate.name; // Update name di localFolderData
      }

      // Perbarui tabel (items) dengan perubahan nama folder
      const itemIndex = items.value.findIndex(item => item.id === response.data.data.id);
      if (itemIndex !== -1) {
        items.value[itemIndex].name = folderToUpdate.name; // Update name di tabel
      }
      // Emit perubahan data ke komponen induk
      emit('updateFolderData', localFolderData.value);
    } else {
      alert(response.data.message);
    }
  } catch (error) {
    console.error('Error updating folder:', error);
  } finally {
    isLoading.value = false;
  }
};

// State untuk modal upload file
const isUploadModalOpen = ref(false);
const newFileName = ref('');
const fileToUpload = ref<File | null>(null); // Khusus untuk file yang diunggah

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;

  if (target && target.files && target.files[0]) {
    const file = target.files[0];
    if (file instanceof File) {
      fileToUpload.value = file; // Pastikan ini adalah instance File
    } else {
      console.error('File yang dipilih bukan tipe File.');
      fileToUpload.value = null;
    }
  } else {
    fileToUpload.value = null;
    console.error('File input tidak valid atau tidak ada file yang dipilih.');
  }
};


// upload file
const uploadFile = async () => {
  const folderId = props.folderData ? props.folderData.idFolder : 0;

  // Validasi input file
  if (!fileToUpload.value || !(fileToUpload.value instanceof File)) {
    alert('Pilih file valid untuk diunggah.');
    return;
  }
  if (!newFileName.value.trim()) {
    alert('Nama file tidak boleh kosong.');
    return;
  }

  try {
    isLoading.value = true;

    // Buat FormData
    const formData = new FormData();
    formData.append('name', newFileName.value); // Nama file
    formData.append('file', fileToUpload.value); // Pastikan ini adalah tipe File
    formData.forEach((value, key) => {
      console.log(key, value); // Debug payload
    });

    // Kirim request
    const response = await apiClient.post(
      `/file/${folderId}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );

    if (response.data.success) {
      alert('File berhasil diunggah!');
      const newFile = response.data.data;

      // Update data lokal
      localFolderData.value.files.push(newFile);
      items.value.push({
        id: newFile.id,
        name: newFile.name,
        type: newFile.fileType,
        size: newFile.size,
        date: new Date(newFile.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
      });

      emit('updateFolderData', localFolderData.value);

      // Reset modal
      newFileName.value = '';
      fileToUpload.value = null;
      isUploadModalOpen.value = false;
    } else {
      alert(response.data.message);
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    if (error.response) {
      alert(`Error: ${error.response.data.message}`);
    }
  } finally {
    isLoading.value = false;
  }
};



</script>

<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-none">
        <h1 class="text-base font-semibold leading-6 text-gray-900">{{ folderData?.namaFolder }}</h1>
      </div>
      <div class="mt-4 sm:ml-6 sm:mt-0 sm:flex">
        <button @click="isModalOpen = true" type="button"
          class="block rounded-md bg-indigo-600 px-3 sm:mr-6 py-1.5 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
          Buat Folder
        </button>
        <button @click="isUploadModalOpen = true" type="button"
          class="block rounded-md bg-indigo-600 px-3 py-1.5 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
          Upload File
        </button>
      </div>
    </div>
    <div class="mt-8 flow-root">
      <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div class="relative">
            <table class="min-w-full table-fixed divide-y divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" class="min-w-[12rem] py-3.5 pr-3 text-left text-sm font-semibold text-gray-900">
                    Nama
                  </th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tipe</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Size</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tanggal</th>
                  <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-3">Aksi </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-for="(item, index) in items" :key="`${item.name}-${index}`"
                  :class="{ 'bg-gray-50': selectedItems.includes(item.name) }">
                  <td :class="[
                    'whitespace-nowrap py-4 pr-3 text-sm font-medium',
                    selectedItems.includes(item.name) ? 'text-indigo-600' : 'text-gray-900',
                  ]">
                    {{ item.name }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ item.type }}</td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ formatSize(item.size) }}</td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ item.date }}</td>
                  <td class="whitespace-nowrap py-4 pl-3 pr-4 text-sm font-medium sm:pr-3 text-center">
                    <a href="#" @click="handleDelete(item)" class="text-indigo-600 hover:text-indigo-900">Hapus</a>
                    <a href="#" @click="handleUpdate(item)" class="text-indigo-600 hover:text-indigo-900 ml-6">Ubah</a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <!-- Modal Buat Folder -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white rounded-lg p-6 shadow-lg max-w-md">
        <h2 class="text-lg font-semibold mb-4">Buat Folder Baru</h2>
        <!-- Input Folder Name -->
        <input v-model="newFolderName" type="text" placeholder="Nama Folder"
          class="w-full p-2 border border-gray-300 rounded mb-4" />
        <div class="flex justify-end">
          <button @click="isModalOpen = false" class="px-4 py-2 text-gray-700">Batal</button>
          <button @click="createFolder" :disabled="isLoading" class="ml-2 px-4 py-2 bg-indigo-600 text-white rounded">
            Simpan
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Upload File -->
    <!-- Modal Upload File -->
    <div v-if="isUploadModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white rounded-lg p-6 shadow-lg max-w-md">
        <h2 class="text-lg font-semibold mb-4">Upload File</h2>

        <!-- Input Nama File -->
        <input v-model="newFileName" type="text" placeholder="Nama File"
          class="w-full p-2 border border-gray-300 rounded mb-4" />

        <!-- Input File -->
        <input type="file" @change="handleFileChange" class="w-full p-2 border border-gray-300 rounded mb-4" />

        <!-- Tombol Aksi -->
        <div class="flex justify-end">
          <button @click="isUploadModalOpen = false" class="px-4 py-2 text-gray-700">
            Batal
          </button>
          <button @click="uploadFile" :disabled="isLoading" class="ml-2 px-4 py-2 bg-indigo-600 text-white rounded">
            Upload
          </button>
        </div>
      </div>
    </div>


  </div>
</template>
