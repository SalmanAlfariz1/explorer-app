<script lang="ts">
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
<template>
  <div>
    <TransitionRoot as="template" :show="sidebarOpen">
      <Dialog class="relative z-50 lg:hidden" @close="sidebarOpen = false">
        <TransitionChild as="template" enter="transition-opacity ease-linear duration-300" enter-from="opacity-0"
          enter-to="opacity-100" leave="transition-opacity ease-linear duration-300" leave-from="opacity-100"
          leave-to="opacity-0">
          <div class="fixed inset-0 bg-gray-900/80" />
        </TransitionChild>

        <div class="fixed inset-0 flex">
          <TransitionChild as="template" enter="transition ease-in-out duration-300 transform"
            enter-from="-translate-x-full" enter-to="translate-x-0"
            leave="transition ease-in-out duration-300 transform" leave-from="translate-x-0"
            leave-to="-translate-x-full">
            <DialogPanel class="relative mr-16 flex w-full max-w-xs flex-1">
              <TransitionChild as="template" enter="ease-in-out duration-300" enter-from="opacity-0"
                enter-to="opacity-100" leave="ease-in-out duration-300" leave-from="opacity-100" leave-to="opacity-0">
                <div class="absolute left-full top-0 flex w-16 justify-center pt-5">
                  <button type="button" class="-m-2.5 p-2.5" @click="sidebarOpen = false">
                    <span class="sr-only">Close sidebar</span>
                    <XMarkIcon class="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </TransitionChild>
              <!-- Sidebar component, swap this element with another sidebar if you like -->
              <div class="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4 ring-1 ring-white/10">
                <div class="flex h-16 shrink-0 items-center">
                  <h1 class="text-gray-400">Explorer App</h1>
                </div>
                <nav class="flex flex-1 flex-col">
                  <ul role="list" class="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" class="-mx-2 space-y-1">
                        <li v-for="folder in folders" :key="folder.id" @click="handleFolderSelected(folder)">
                          <a v-if="!folder.children"
                            :class="[
                              folder.open ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white', 'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6']">
                            <component :is="FolderIcon" class="h-6 w-6 shrink-0" aria-hidden="true" />
                            {{ folder.name }}
                          </a>
                          <Disclosure as="div" v-else v-slot="{ open }">
                            <DisclosureButton :class="[
                              folder.open ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                              'flex w-full items-center gap-x-3 rounded-md p-2 text-left text-sm font-semibold leading-6',
                            ]">
                              <component :is="FolderIcon" class="h-6 w-6 shrink-0" aria-hidden="true" />
                              {{ folder.name }}
                              <ChevronRightIcon :class="[
                                open ? 'rotate-90 ' : 'text-gray-400',
                                'ml-auto h-5 w-5 shrink-0',
                              ]" aria-hidden="true" />
                            </DisclosureButton>
                            <DisclosurePanel as="ul" class="mt-1 px-2">
                        <li v-for="subItem in folder.children" :key="subItem.name"
                          @click="handleFolderSelected(subItem)">
                          <DisclosureButton as="button" :class="[
                            folder.open ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                            'flex w-full items-center gap-x-3 rounded-md p-2 text-left text-sm font-semibold leading-6',
                          ]">
                            <component :is="FolderIcon" class="h-6 w-6 shrink-0" aria-hidden="true" />
                            {{ subItem.name }}
                          </DisclosureButton>
                        </li>
                        </DisclosurePanel>
                        </Disclosure>
                    </li>
                  </ul>
                  </li>
                  </ul>
                </nav>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Static sidebar for desktop -->
    <div class="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <!-- Sidebar component, swap this element with another sidebar if you like -->
      <div class="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4">
        <div class="flex h-16 shrink-0 items-center">
          <h1 class="text-gray-400">Explorer App</h1>
        </div>
        <nav class="flex flex-1 flex-col">
          <ul role="list" class="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" class="-mx-2 space-y-1">
                <li v-for="folder in folders" :key="folder.id" @click="handleFolderSelected(folder)">
                  <a v-if="!folder.children"
                    :class="[
                      folder.open ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white', 'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6']">
                    <component :is="FolderIcon" class="h-6 w-6 shrink-0" aria-hidden="true" />
                    {{ folder.name }}
                  </a>
                  <Disclosure as="div" v-else v-slot="{ open }">
                    <DisclosureButton :class="[
                      folder.open ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                      'flex w-full items-center gap-x-3 rounded-md p-2 text-left text-sm font-semibold leading-6',
                    ]">
                      <component :is="FolderIcon" class="h-6 w-6 shrink-0" aria-hidden="true" />
                      {{ folder.name }}
                      <ChevronRightIcon :class="[
                        open ? 'rotate-90 ' : 'text-gray-400',
                        'ml-auto h-5 w-5 shrink-0',
                      ]" aria-hidden="true" />
                    </DisclosureButton>
                    <DisclosurePanel as="ul" class="mt-1 px-2">
                <li v-for="subItem in folder.children" :key="subItem.name" @click="handleFolderSelected(subItem)">
                  <DisclosureButton as="button" :class="[
                    folder.open ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                    'flex w-full items-center gap-x-3 rounded-md p-2 text-left text-sm font-semibold leading-6',
                  ]">
                    <component :is="FolderIcon" class="h-6 w-6 shrink-0" aria-hidden="true" />
                    {{ subItem.name }}
                  </DisclosureButton>
                </li>
                </DisclosurePanel>
                </Disclosure>
            </li>
          </ul>
          </li>
          </ul>
        </nav>
      </div>
    </div>

    <div class="lg:pl-72">
      <div
        class="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
        <button type="button" class="-m-2.5 p-2.5 text-gray-700 lg:hidden" @click="sidebarOpen = true">
          <span class="sr-only">Open sidebar</span>
          <Bars3Icon class="h-6 w-6" aria-hidden="true" />
        </button>

        <!-- Separator -->
        <div class="h-6 w-px bg-gray-900/10 lg:hidden" aria-hidden="true" />

        <div class="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          <form class="relative flex flex-1" action="#" method="GET">
            <label for="search-field" class="sr-only">Search</label>
            <MagnifyingGlassIcon class="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400"
              aria-hidden="true" />
            <input id="search-field"
              class="block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
              placeholder="Search..." type="search" name="search" />
          </form>
        </div>
      </div>

      <main class="py-10">
        <div class="px-4 sm:px-6 lg:px-8">
          <!-- Your content -->
          <TableComponent :folderData="selectedFolderData" />
        </div>
      </main>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineComponent, type PropType } from 'vue';
import { ref } from 'vue'
import {
  Dialog,
  DialogPanel,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'
import {
  Bars3Icon,
  FolderIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import { MagnifyingGlassIcon } from '@heroicons/vue/20/solid'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue';
import { ChevronRightIcon } from '@heroicons/vue/20/solid';
import TableComponent from '../components/TableComponent.vue';
import apiClient from '../api/axios';

const sidebarOpen = ref(false);
const selectedFolderData = ref(null); // Untuk menyimpan data folder yang dipilih

// Fungsi untuk memanggil API berdasarkan folder ID
const fetchFolderData = async (folderId: number) => {
  try {
    const response = await apiClient.get(`/${folderId}`);
    if (response.data.success) {
      selectedFolderData.value = response.data.data; // Simpan data ke state
    } else {
      console.error(response.data.message);
    }
  } catch (error) {
    console.error('Error fetching folder data:', error);
  }
};

// Event handler ketika folder dipilih
const handleFolderSelected = (folder: Folder) => {
  fetchFolderData(folder.id); // Panggil API berdasarkan ID folder
};

</script>
