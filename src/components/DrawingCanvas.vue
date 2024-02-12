<template>
  <div class="flex max-h-[85dvh] flex-col w-full gap-[10px] relative">
    <div
      v-if="party.word"
      class="text-3xl font-medium text-white absolute px-4 py-2 bg-blue-600 rounded-xl left-1/2 -translate-x-1/2 top-[-20px]"
    >
      <div class="flex gap-2">
        <span
          class="underline underline-offset-4"
          v-for="letter of party.word"
          >{{ user._id == party.turn ? letter : "?" }}</span
        >
      </div>
    </div>
    <section class="w-full overflow-hidden h-full rounded-xl">
      <canvas
        class="w-full h-full"
        @mousedown="
          (e) =>
            user._id == party.turn && startDraw(e, brushWidth, selectedColor)
        "
        @mousemove="
          (e) =>
            user._id == party.turn && drawing(e, selectedTool, selectedColor)
        "
        @mouseup="() => user._id == party.turn && stopDrawing()"
        @mouseleave="() => user._id == party.turn && stopDrawing()"
        ref="canvas"
      ></canvas>
    </section>
    <section
      v-show="party.turn == user._id"
      class="flex font-medium flex-col justify-between h-[40%] pt-[15px] px-[22px] bg-[#fff] rounded-xl"
    >
      <div class="flex justify-between">
        <div class="row">
          <label class="title">Shapes</label>
          <ul class="options">
            <li
              v-for="tool of tools"
              class="option tool"
              :class="{ active: selectedTool == tool }"
              @click="selectedTool = tool"
            >
              <img :src="`/icons/${tool}.svg`" alt="" />
              <span>{{ `${tool[0].toUpperCase()}${tool.slice(1)}` }}</span>
            </li>
          </ul>
        </div>
        <div class="row">
          <label class="title">Options</label>
          <ul class="options">
            <li
              class="option tool"
              :class="{ active: selectedTool == 'brush' }"
              @click="selectedTool = 'brush'"
              id="brush"
            >
              <img src="/icons/brush.svg" alt="" />
              <span>Brush</span>
            </li>
            <li
              @click="selectedTool = 'eraser'"
              :class="{ active: selectedTool == 'eraser' }"
              class="option tool"
              id="eraser"
            >
              <img src="/icons/eraser.svg" alt="" />
              <span>Eraser</span>
            </li>
            <li class="option">
              <input
                type="range"
                id="size-slider"
                @change="(e) => (brushWidth = e.target.value)"
                min="1"
                max="30"
                value="5"
              />
            </li>
          </ul>
        </div>
        <div class="row colors">
          <label class="title">Colors</label>
          <ul class="options gap-2">
            <li
              class="option"
              v-for="color of palleteColors"
              @click="selectedColor = color"
              :class="{ selected: selectedColor == color }"
              :style="{ backgroundColor: color }"
            ></li>
            <li class="option" style="background-color: #4a98f7">
              <input
                type="color"
                id="color-picker"
                @change="
                  (e) => {
                    selectedColor = e.target.value;
                    e.target.parentElement.style.background = e.target.value;
                    e.target.parentElement.click();
                  }
                "
                value="#4A98F7"
              />
            </li>
          </ul>
        </div>
      </div>
      <div class="row buttons flex gap-3">
        <button
          class="clear-canvas"
          @click="user._id == party.turn && clearCanvas()"
        >
          Clear Canvas
        </button>
        <button class="clear-canvas" @click="user._id == party.turn && undo()">
          Undo
        </button>
        <button class="save-img" @click="user._id == party.turn && saveImg()">
          Save As Image
        </button>
      </div>
    </section>
    <Chat
      @sendGuess="(guess) => $emit('sendGuess', guess)"
      @sendMessage="(message) => $emit('sendMessage', message)"
      :party="party"
      v-if="party.turn != user._id"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, inject } from "vue";
import { useUserStore } from "@/stores/userStore";
import { watch } from "vue";
import Chat from "./Chat.vue";

const { user } = useUserStore();
const canvas = ref();
const snapshots = ref([]);
const isDrawing = ref(false);
const selectedTool = ref("brush");
const socket = inject("socket");
const party = inject("party");
const selectedColor = ref("#000");
const brushWidth = ref(5);
const fillColor = ref(false);
const palleteColors = ["#fff", "#000", "#e02020", "#6dd400", "#4a98f7"];
const tools = ["rectangle", "circle", "triangle"];
let prevMouseX, prevMouseY, snapshot, ctx;
const emit = defineEmits(["turnChanged", "next"]);
const MAX_UNDO_STACK_SIZE = 10;

const undo = (emit = true) => {
  if (snapshots.value.length > 1) {
    snapshots.value.pop(); // Remove the current state
    const lastSnapshot = snapshots.value[snapshots.value.length - 1];
    ctx.putImageData(lastSnapshot, 0, 0);
  } else {
    clearCanvas();
  }

  if (!emit) return;
  socket.emit("undo", party.value._id);
};

const takeSnapshot = () => {
  const snapshot = ctx.getImageData(
    0,
    0,
    canvas.value.width,
    canvas.value.height
  );
  snapshots.value.push(snapshot);
  if (snapshots.value.length > MAX_UNDO_STACK_SIZE) {
    snapshots.value.shift();
  }
};

const saveImg = () => {
  const link = document.createElement("a");
  link.download = `${Date.now()}.jpg`;
  link.href = canvas.value.toDataURL();
  link.click();
};

const setCanvasBackground = () => {
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.value.width, canvas.value.height);
  ctx.fillStyle = selectedColor.value;
};

const drawRect = (e) => {
  if (!fillColor.value.checked) {
    return ctx.strokeRect(
      e.offsetX,
      e.offsetY,
      prevMouseX - e.offsetX,
      prevMouseY - e.offsetY
    );
  }
  ctx.fillRect(
    e.offsetX,
    e.offsetY,
    prevMouseX - e.offsetX,
    prevMouseY - e.offsetY
  );
};

const drawCircle = (e) => {
  ctx.beginPath();
  let radius = Math.sqrt(
    Math.pow(prevMouseX - e.offsetX, 2) + Math.pow(prevMouseY - e.offsetY, 2)
  );
  ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
  fillColor.value.checked ? ctx.fill() : ctx.stroke();
};

const drawTriangle = (e) => {
  ctx.beginPath();
  ctx.moveTo(prevMouseX, prevMouseY);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY);
  ctx.closePath();
  fillColor.value.checked ? ctx.fill() : ctx.stroke();
};

const startDraw = (
  e,
  lineWidth = brushWidth.value,
  color = selectedColor.value,
  emit = true
) => {
  isDrawing.value = true;
  prevMouseX = e.offsetX;
  prevMouseY = e.offsetY;
  ctx.beginPath();
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  snapshot = ctx.getImageData(0, 0, canvas.value.width, canvas.value.height);
  if (!emit) return;
  socket.emit(
    "start-drawing",
    { offsetX: e.offsetX, offsetY: e.offsetY },
    lineWidth,
    color,
    party.value._id
  );
};

const drawing = (
  e,
  tool = selectedTool.value,
  color = selectedColor.value,
  emit = true
) => {
  if (!isDrawing.value) return;
  ctx.putImageData(snapshot, 0, 0);
  if (tool === "brush" || tool === "eraser") {
    ctx.strokeStyle = tool === "eraser" ? "#fff" : color;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
  } else if (tool === "rectangle") {
    drawRect(e);
  } else if (tool === "circle") {
    drawCircle(e);
  } else {
    drawTriangle(e);
  }
  if (!emit) return;
  socket.emit(
    "drawing",
    { offsetX: e.offsetX, offsetY: e.offsetY },
    tool,
    color,
    party.value._id
  );
};

const stopDrawing = () => {
  isDrawing.value = false;
  takeSnapshot();
  socket.emit("stop-drawing", party.value._id);
};

const clearCanvas = (emit = true) => {
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
  snapshots.value = [];
  setCanvasBackground();
  if (!emit) return;
  socket.emit("clear", party.value._id);
};

onMounted(() => {
  canvas.value.width = canvas.value.offsetWidth;
  canvas.value.height = canvas.value.offsetHeight;
  ctx = canvas.value.getContext("2d");
  setCanvasBackground();
  socket.on("start-drawing", (e, lineWidth, color) => {
    startDraw(e, lineWidth, color, false);
  });

  socket.on("drawing", (e, tool, color) => {
    drawing(e, tool, color, false);
  });

  socket.on("stop-drawing", () => {
    isDrawing.value = false;
    takeSnapshot();
  });

  socket.on("clear", () => clearCanvas(false));

  socket.on("undo", () => undo(false));

  socket.on("turn", (turn, word) => {
    stopDrawing();
    party.value.word = word ?? "";
    party.value.turn = party.value.members[turn]?.user._id ?? null;
    party.value.guesses = [];
    localStorage.removeItem("guesses");
    emit("turnChanged");
    clearCanvas();
  });

  socket.on("next", (turn) => {
    emit("next", turn);
  });
});
</script>

<style scoped>
.tools-board .row {
  margin-bottom: 20px;
}
.row .options {
  list-style: none;
  margin: 10px 0 0 5px;
}
.row .options .option {
  display: flex;
  cursor: pointer;
  align-items: center;
  margin-bottom: 10px;
}
.option:is(:hover, .active) img {
  filter: invert(17%) sepia(90%) saturate(3000%) hue-rotate(900deg)
    brightness(100%) contrast(100%);
}
.option :where(span, label) {
  color: #5a6168;
  cursor: pointer;
  padding-left: 10px;
}
.option:is(:hover, .active) :where(span, label) {
  color: #4a98f7;
}
.option #fill-color {
  cursor: pointer;
  height: 14px;
  width: 14px;
}
#fill-color:checked ~ label {
  color: #4a98f7;
}
.option #size-slider {
  width: 100%;
  height: 5px;
  margin-top: 10px;
}
.colors .options {
  display: flex;
  justify-content: space-between;
}
.colors .option {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  margin-top: 3px;
  position: relative;
}
.colors .option:nth-child(1) {
  border: 1px solid #bfbfbf;
}
.colors .option.selected::before {
  position: absolute;
  content: "";
  top: 50%;
  left: 50%;
  height: 12px;
  width: 12px;
  background: inherit;
  border-radius: inherit;
  border: 2px solid #fff;
  transform: translate(-50%, -50%);
}
.colors .option:first-child.selected::before {
  border-color: #ccc;
}
.option #color-picker {
  opacity: 0;
  cursor: pointer;
}
.buttons button {
  width: 100%;
  color: #fff;
  border: none;
  outline: none;
  padding: 11px 0;
  font-size: 0.9rem;
  margin-bottom: 13px;
  background: none;
  border-radius: 4px;
  cursor: pointer;
}
.buttons .clear-canvas {
  color: #6c757d;
  border: 1px solid #6c757d;
  transition: all 0.3s ease;
}
.clear-canvas:hover {
  color: #fff;
  background: #6c757d;
}
.buttons .save-img {
  background: #4a98f7;
  border: 1px solid #4a98f7;
}
.drawing-board {
  flex: 1;
  overflow: hidden;
}
.drawing-board canvas {
  width: 100%;
  height: 100%;
}
</style>
