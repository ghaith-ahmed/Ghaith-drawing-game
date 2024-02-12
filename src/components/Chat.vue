<template>
  <section
    class="flex relative justify-center min-h-[30%] max-h-[30%] pt-[15px] px-[22px] bg-[#fff] rounded-xl"
  >
    <div class="flex-1 max-w-[50%] relative flex flex-col h-full">
      <h1 class="font-medium">Guess</h1>
      <div
        class="flex flex-col gap-2 h-full overflow-y-auto pt-3 pb-16 pr-5"
        ref="guessConversation"
      >
        <div class="flex flex-col gap-2" v-for="guess of party.guesses ?? []">
          <div
            v-if="guess.sender_id == user._id"
            class="flex gap-2 w-1/2 items-start"
          >
            <div
              class="w-8 h-8 shrink-0 flex justify-center items-center object-cover bg-emerald-500 rounded-full overflow-hidden"
              src=""
              alt=""
            >
              <h1 class="text-xs text-white truncate">{{ user.name }}</h1>
            </div>
            <h1
              class="bg-gray-200 p-2 font-medium rounded-xl text-xs max-w-[50%] break-words"
              :class="{ '!bg-green-500 italic text-white': guess.correct }"
            >
              {{ guess.correct ? "Correct !" : guess.guess }}
            </h1>
          </div>
          <div v-else class="w-full flex justify-end">
            <div class="flex flex-row-reverse w-1/2 gap-2 items-start">
              <div
                class="w-8 flex justify-center items-center h-8 shrink-0 object-cover bg-emerald-500 rounded-full"
                src=""
                alt=""
              >
                <h1 class="text-xs truncate text-white text-ellipsis">
                  {{
                    party.members.find(
                      (member) => member.user._id == guess.sender_id
                    ).user.name
                  }}
                </h1>
              </div>
              <h1
                class="bg-gray-200 p-2 font-medium rounded-xl text-xs max-w-[50%] break-words"
                :class="{ '!bg-green-500 italic text-white': guess.correct }"
              >
                {{ guess.correct ? "Correct !" : guess.guess }}
              </h1>
            </div>
          </div>
        </div>
      </div>
      <div class="absolute bottom-0 w-full right-[10px]">
        <input
          v-model="guess"
          @keypress="(event) => event.key == 'Enter' && sendGuess()"
          placeholder="Write a guess .."
          :disabled="guessedIt"
          class="bg-white focus:ring-0 focus:outline-none border-0 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
        />
        <FwbButton
          class="absolute disabled:cursor-not-allowed py-2 px-3 top-1/2 -translate-y-1/2 text-xs right-0 cursor-pointer"
          color="light"
          :disabled="!guess"
          @click="sendGuess"
          >Send</FwbButton
        >
      </div>
    </div>
    <div class="flex-1 max-w-[50%] relative flex flex-col h-full">
      <h1 class="font-medium">Chat</h1>
      <div
        class="flex flex-col gap-2 h-full overflow-y-auto pt-3 pb-16 px-5"
        ref="chatConversation"
      >
        <div
          class="flex flex-col gap-2"
          v-for="message of party.messages ?? []"
        >
          <div
            v-if="message.sender_id == user._id"
            class="flex gap-2 w-1/2 items-start"
          >
            <div
              class="w-8 h-8 shrink-0 flex justify-center items-center object-cover bg-emerald-500 rounded-full overflow-hidden"
              src=""
              alt=""
            >
              <h1 class="text-xs text-white truncate">{{ user.name }}</h1>
            </div>
            <h1
              class="bg-gray-200 p-2 font-medium rounded-xl text-xs max-w-[50%] break-words"
            >
              {{ message.message }}
            </h1>
          </div>
          <div v-else class="w-full flex justify-end">
            <div class="flex flex-row-reverse w-1/2 gap-2 items-start">
              <div
                class="w-8 flex justify-center items-center h-8 shrink-0 object-cover bg-emerald-500 rounded-full"
                src=""
                alt=""
              >
                <h1 class="text-xs truncate text-white text-ellipsis">
                  {{
                    party.members.find(
                      (member) => member.user._id == message.sender_id
                    ).user.name
                  }}
                </h1>
              </div>
              <h1
                class="bg-gray-200 p-2 font-medium rounded-xl text-xs max-w-[50%] break-words"
              >
                {{ message.message }}
              </h1>
            </div>
          </div>
        </div>
      </div>
      <div class="absolute bottom-0 w-[95%] right-[10px]">
        <input
          v-model="message"
          @keypress="(event) => event.key == 'Enter' && sendMessage()"
          placeholder="Write a message .."
          class="bg-white focus:ring-0 focus:outline-none border-0 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
        />
        <FwbButton
          class="absolute disabled:cursor-not-allowed py-2 px-3 top-1/2 -translate-y-1/2 text-xs right-0 cursor-pointer"
          color="light"
          :disabled="!message"
          @click="sendMessage"
          >Send</FwbButton
        >
      </div>
    </div>
  </section>
</template>

<script setup>
import { FwbButton } from "flowbite-vue";
import { ref } from "vue";
import { useUserStore } from "@/stores/userStore";
import { watch } from "vue";
import { onMounted } from "vue";
import { computed } from "vue";

const { user } = useUserStore();
const guess = ref("");
const message = ref("");
const { party } = defineProps(["party"]);
const guessConversation = ref();
const chatConversation = ref();
const emit = defineEmits(["sendGuess", "sendMessage"]);
const guessedIt = computed(() =>
  party.guesses.find((guess) => guess.correct && guess.sender_id == user._id)
);

const scrollToBottom = (ele) => {
  setTimeout(() => {
    if (!ele) {
      guessConversation.value.scrollTop = guessConversation.value.scrollHeight;
      chatConversation.value.scrollTop = chatConversation.value.scrollHeight;
    } else if (ele == "guess") {
      guessConversation.value.scrollTop = guessConversation.value.scrollHeight;
    } else if (ele == "chat") {
      chatConversation.value.scrollTop = chatConversation.value.scrollHeight;
    }
  }, 0);
};

const sendGuess = () => {
  if (!guess.value || guessedIt.value) return;
  emit("sendGuess", guess.value);
  guess.value = "";
};

const sendMessage = () => {
  if (!message.value) return;
  emit("sendMessage", message.value);
  message.value = "";
};

watch(party.guesses, () => scrollToBottom("guess"));
watch(party.messages, () => scrollToBottom("chat"));
onMounted(scrollToBottom);
</script>
