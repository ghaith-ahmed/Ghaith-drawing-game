<template>
  <Toaster />
  <div class="min-h-dvh relative paper-background">
    <canvas
      class="w-full h-dvh absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      @mousemove="drawing"
      ref="canvas"
    ></canvas>
    <div class="h-dvh">
      <RouterView />
    </div>
  </div>
</template>

<script setup>
import { Toaster } from "vue-sonner";
import { ref, onMounted } from "vue";
import { i18n } from "./i18n";

const canvas = ref();
let ctx;
let snapshot;

onMounted(() => {
  localStorage.removeItem("guesses");
  localStorage.removeItem("messages");
  canvas.value.width = canvas.value.offsetWidth;
  canvas.value.height = canvas.value.offsetHeight;
  ctx = canvas.value.getContext("2d");
  ctx.beginPath();
  ctx.lineWidth = 15;
  ctx.strokeStyle = "#e8d6d630";
  ctx.fillStyle = "#e8d6d630";
  snapshot = ctx.getImageData(0, 0, canvas.value.width, canvas.value.height);

  if (localStorage.getItem("dark") == "true") {
    document.body.classList.add("dark");
  }

  if (localStorage.getItem("lang") == "Ar") {
    i18n.global.locale = "Ar";
    document.querySelector("body").dir = "rtl";
  }
});

const drawing = (e) => {
  ctx.putImageData(snapshot, 0, 0);

  ctx.strokeStyle = "#e8d6d630";
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
};

window.onerror = function (message, source, lineno, colno, error) {
  console.log("error message:", { message, source, lineno, colno, error });
};
</script>
