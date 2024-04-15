<template>
  <button
    class="border-2 border-gray-300 hover:bg-gray-100 text-xl text-gray-900 font-normal px-4 min-w-12 h-10 rounded">
    <div class="m-auto">
      <slot>
        <i class="fa-solid fa-circle-exclamation"></i>
      </slot>
    </div>
  </button>
</template>

<script setup>

</script>