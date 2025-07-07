<template>
  <div class="flex justify-center items-center text-center min-h-screen p-4">
    <div class="max-w-md mx-auto">
      <img
        src="@/assets/images/background/errorimg.svg"
        width="500"
        alt="404"
        class="max-w-full h-auto mx-auto transition-transform duration-300 hover:scale-105"
      />
      <h1 class="text-4xl md:text-5xl font-bold pt-3 mt-4 text-rose-600">Opps!!!</h1>
      <h4 class="text-xl md:text-2xl my-8 text-gray-600">
        This page you are looking for could not be found.
      </h4>
      <v-btn variant="flat" class="mb-4 !hover:text-white" to="/">Go Back to Home</v-btn>
    </div>
  </div>
</template>
