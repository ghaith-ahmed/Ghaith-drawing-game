<template>
  <div v-if="party">
    <div class="flex justify-between container mx-auto pt-8 mb-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        class="w-10 fill-red-500 hover:fill-red-600 transition cursor-pointer relative z-[10]"
        @click="leaveParty"
      >
        <path
          d="M512 256A256 256 0 1 0 0 256a256 256 0 1 0 512 0zM217.4 376.9L117.5 269.8c-3.5-3.8-5.5-8.7-5.5-13.8s2-10.1 5.5-13.8l99.9-107.1c4.2-4.5 10.1-7.1 16.3-7.1c12.3 0 22.3 10 22.3 22.3l0 57.7 96 0c17.7 0 32 14.3 32 32l0 32c0 17.7-14.3 32-32 32l-96 0 0 57.7c0 12.3-10 22.3-22.3 22.3c-6.2 0-12.1-2.6-16.3-7.1z"
        />
      </svg>
      <span
        class="text-right text-4xl bg-gradient-to-r from-rose-600 to-indigo-600 bg-clip-text text-transparent font-bold h-[50px]"
      >
        لعبة الرسم
      </span>
    </div>
    <div
      class="md:flex min-h-[85dvh] container mx-auto relative gap-2 justify-center items-stretch"
    >
      <DrawingCanvas
        @sendGuess="sendGuess"
        @sendMessage="sendMessage"
        @turnChanged="deleteLeavedMembers"
        @next="next"
        v-show="!nextTurn"
      />

      <div v-show="nextTurn" class="w-full">
        <h1 class="text-3xl dark:text-white text-center">
          The answer was : {{ party.word }}
        </h1>
        <h1 class="text-3xl dark:text-white text-center">
          Next is {{ nextTurn?.name ?? user.name }}
        </h1>
      </div>
      <div
        class="md:w-1/2 w-full relative bg-gray-100 dark:bg-gray-800 mt-2 md:mt-0"
      >
        <div class="flex justify-center w-full mt-3 dark:text-white">
          <div
            class="flex gap-2 px-2 py-2 bg-blue-500 rounded-xl border-4 border-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              class="w-5 fill-white"
            >
              <path
                d="M336 352c97.2 0 176-78.8 176-176S433.2 0 336 0S160 78.8 160 176c0 18.7 2.9 36.8 8.3 53.7L7 391c-4.5 4.5-7 10.6-7 17v80c0 13.3 10.7 24 24 24h80c13.3 0 24-10.7 24-24V448h40c13.3 0 24-10.7 24-24V384h40c6.4 0 12.5-2.5 17-7l33.3-33.3c16.9 5.4 35 8.3 53.7 8.3zM376 96a40 40 0 1 1 0 80 40 40 0 1 1 0-80z"
              />
            </svg>
            <h1 class="text-white font-medium">{{ party.code }}</h1>
          </div>
        </div>
        <div class="flex flex-col gap-1 divide-y-4">
          <Members
            :active="
              member.user._id == party.turn && !nextTurnDelete.includes(member)
            "
            :leaved="
              member.user._id == party.turn && nextTurnDelete.includes(member)
            "
            v-for="member of party.members"
            :member="member"
          />
          <h1
            v-if="party.members.length == 1"
            class="text-center font-medium animate-pulse"
          >
            Waiting for another player ...
          </h1>
        </div>
      </div>
    </div>
  </div>
  <div
    v-else
    class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
  >
    <FwbSpinner color="blue" size="12" />
  </div>
</template>

<script setup>
import { FwbSpinner, FwbButton } from "flowbite-vue";
import { ref, onMounted, provide, watch } from "vue";
import { useUserStore } from "@/stores/userStore";
import { onBeforeRouteLeave, useRoute, useRouter } from "vue-router";
import { tryCatch } from "@/errorHandler";
import { axiosClient } from "@/axios";
import { toast } from "vue-sonner";
import { io } from "socket.io-client";
import Members from "../components/Members.vue";
import DrawingCanvas from "@/components/DrawingCanvas.vue";
import { onBeforeUnmount } from "vue";

const { user } = useUserStore();
const party = ref();
const route = useRoute();
const router = useRouter();
const socket = io("https://ghaith-drawing.onrender.com");
const nextTurnDelete = ref([]);
const nextTurn = ref();
provide("socket", socket);
provide("party", party);

const getParty = async () => {
  try {
    party.value = (await axiosClient.get(`/party/${route.params.code}`)).data;
    // because when fetching the party the user joined will not be populated so
    // I'm doing it manually to prevent making another database query
    const populateLastUser = party.value.members.find(
      (member) => member.user == user._id
    );
    if (populateLastUser) {
      party.value.members[party.value.members.indexOf(populateLastUser)].user =
        user;
    }
    party.value.guesses = JSON.parse(localStorage.getItem("guesses") ?? "[]");
    party.value.messages = JSON.parse(localStorage.getItem("messages") ?? "[]");
    socket.emit("joined", party.value._id, user._id);
    socket.on("joined", async (partyId, userId) => {
      if (
        partyId == party.value._id &&
        !party.value.members
          .map((member) => member.user._id.toString())
          .includes(userId.toString())
      ) {
        tryCatch(await getUser(userId));
      }
    });
    socket.on("leaved", (partyId, userId) => {
      if (
        party.value.members
          .map((member) => member.user._id.toString())
          .includes(userId.toString())
      ) {
        if (party.value.turn == userId) {
          const memberToDeleteNextTurn =
            party.value.members[
              party.value.members.findIndex(
                (member) => member.user._id == userId
              )
            ];
          nextTurnDelete.value.push(memberToDeleteNextTurn);
          party.value.members[
            party.value.members.indexOf(memberToDeleteNextTurn)
          ].deleteNextTurn = true;
        } else {
          party.value.members = party.value.members.filter(
            (member) => member.user._id != userId
          );
        }
      }
    });
    socket.on("receive-guess", (guess) => {
      party.value.guesses.push(guess);
      if (guess.correct) correctGuess(guess.sender_id);
      localStorage.setItem("guesses", JSON.stringify(party.value.guesses));
    });
    socket.on("receive-message", (message) => {
      party.value.messages.push(message);
      localStorage.setItem("messages", JSON.stringify(party.value.messages));
    });
  } catch (e) {
    toast.error("Party doesn't exist !");
    router.push({ name: "Play" });
  }
};

const getUser = async (id) => {
  const { data } = await axiosClient.get(`/users?id=${id}`);

  party.value.members.push({ user: data, score: 0 });

  if (party.value.members.length == 2) {
    party.value.turn = party.value.members[0].user._id;
  }
};

const sendGuess = (guess) => {
  const guessToSend = {
    guess,
    sender_id: user._id,
    correct:
      guess.toLowerCase().trim() == party.value.word.toLowerCase().trim(),
  };
  if (guessToSend.correct) correctGuess(user._id);
  party.value.guesses.push(guessToSend);
  localStorage.setItem("guesses", JSON.stringify(party.value.guesses));
  socket.emit("send-guess", party.value._id, guessToSend);
};

const sendMessage = (message) => {
  const messageToSend = {
    message,
    sender_id: user._id,
  };
  party.value.messages.push(messageToSend);
  localStorage.setItem("messages", JSON.stringify(party.value.messages));
  socket.emit("send-message", party.value._id, messageToSend);
};

const correctGuess = (senderId) => {
  new Audio("/winning.mp3").play();
  party.value.members[
    party.value.members.findIndex(
      (member) => member.user._id === party.value.turn
    )
  ].score += 2;

  party.value.members[
    party.value.members.findIndex((member) => member.user._id === senderId)
  ].score += 3;
};

const leaveParty = tryCatch(async () => {
  if (!party.value) return;
  await axiosClient.post(`/party/leave/${party.value._id}`);
  socket.emit("leaved", party.value._id, user._id);
  socket.disconnect();
  router.push({ name: "Play" });
});

const deleteLeavedMembers = () => {
  party.value.members = party.value.members.filter(
    (member) =>
      !nextTurnDelete.value.find((leaved) => leaved.user._id == member.user._id)
  );
  nextTurnDelete.value = [];
  nextTurn.value = null;
};

const next = (turn) => {
  nextTurn.value = party.value.members[turn].user;
};

onBeforeRouteLeave(async (to, from, next) => {
  leaveParty();
  next();
});

onMounted(getParty);

onBeforeUnmount(() => {});
</script>
