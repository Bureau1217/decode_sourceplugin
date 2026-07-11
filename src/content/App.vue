<template>
  <SidePanel
    :visible="panelState.visible"
    :domain="panelState.domain"
    :source="panelState.source"
    :user-vote="userVote"
    @close="closePanel"
    @vote="handleVote"
    @view-database="handleViewDatabase"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import SidePanel from "./components/SidePanel.vue";
import { panelState, closePanel } from "./panelState";
import { votes, setVote, type Vote } from "./votesState";

const userVote = computed<Vote>(() => votes[panelState.domain] ?? null);

function handleVote(vote: "agree" | "disagree") {
  const current = votes[panelState.domain] ?? null;
  setVote(panelState.domain, current === vote ? null : vote);
}

function handleViewDatabase() {
  chrome.runtime.sendMessage({ type: "OPEN_OPTIONS" });
}
</script>
