<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <div class="flex h-screen">
    <!-- Sidebar -->
    <aside class="w-64 bg-gray-800 text-white p-4">
      <h2 class="text-xl font-bold mb-4">
        M365 Chat
      </h2>
      <nav>
        <ul>
          <li class="mb-2">
            <NuxtLink to="/chat" class="block py-2 px-4 rounded hover:bg-gray-700">Chat</NuxtLink>
          </li>
          <li class="mb-2">
            <!-- Example of another sidebar link -->
            <NuxtLink to="/profile" class="block py-2 px-4 rounded hover:bg-gray-700">My Profile</NuxtLink>
          </li>
        </ul>
      </nav>

      <!-- Login component for M365 auth -->
      <div class="mt-8">
        <mgt-login />
      </div>
    </aside>

    <!-- Main content area -->
    <main class="flex-1 p-8">
      <slot />
    </main>
  </div>
</template>
