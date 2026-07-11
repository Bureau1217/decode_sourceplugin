<template>
  <transition name="decode-slide">
    <aside v-if="visible" class="decode-panel">
      <header class="decode-panel__header">
        <h2>DE.CO.DE Plugin</h2>
        <button
          class="decode-panel__close"
          aria-label="Close"
          @click="$emit('close')"
        >
          &times;
        </button>
      </header>

      <div class="decode-panel__source">
        <div class="decode-panel__name">
          {{ source?.source_name ?? domain }}
        </div>
        <div class="decode-panel__domain">{{ domain }}</div>
      </div>

      <div class="decode-panel__score-card">
        <div class="decode-panel__score">{{ scoreLabel }}</div>
        <div class="decode-panel__score-label">Trust score</div>
        <div class="decode-panel__bar">
          <div
            class="decode-panel__bar-fill"
            :class="tierClass"
            :style="{ width: barWidth }"
          />
        </div>
      </div>

      <section class="decode-panel__section">
        <h3>Analysis</h3>
        <p v-for="(paragraph, i) in analysisParagraphs" :key="i">
          {{ paragraph }}
        </p>
      </section>

      <section class="decode-panel__section">
        <h3>Community evaluation</h3>
        <div class="decode-panel__counts">
          <span>{{ agreeCount.toLocaleString() }} agree</span>
          <span>{{ disagreeCount.toLocaleString() }} disagree</span>
        </div>
        <button
          class="decode-panel__vote-btn decode-panel__vote-btn--agree"
          :class="{ 'is-active': userVote === 'agree' }"
          :disabled="!source"
          @click="$emit('vote', 'agree')"
        >
          Agree
        </button>
        <button
          class="decode-panel__vote-btn decode-panel__vote-btn--disagree"
          :class="{ 'is-active': userVote === 'disagree' }"
          :disabled="!source"
          @click="$emit('vote', 'disagree')"
        >
          Disagree
        </button>
      </section>

      <hr class="decode-panel__divider" />

      <button class="decode-panel__view-db" @click="$emit('view-database')">
        View full data base
      </button>
    </aside>
  </transition>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Source } from "../../api/sources";
import type { Vote } from "../votesState";

const props = defineProps<{
  visible: boolean;
  domain: string;
  source: Source | null;
  userVote: Vote;
}>();

defineEmits<{
  close: [];
  vote: [vote: "agree" | "disagree"];
  "view-database": [];
}>();

const scoreLabel = computed(() =>
  props.source ? `${props.source.trust_score}/100` : "No data"
);

const barWidth = computed(() => {
  if (!props.source) return "0%";
  const clamped = Math.max(0, Math.min(100, props.source.trust_score));
  return `${clamped}%`;
});

const tierClass = computed(() => {
  const score = props.source?.trust_score ?? null;
  if (score === null) return "is-unknown";
  if (score >= 70) return "is-high";
  if (score >= 40) return "is-medium";
  return "is-low";
});

const analysisParagraphs = computed(() => {
  const text =
    props.source?.trust_score_explanation ??
    "This domain has not been evaluated yet. It is not in the reliability database.";
  return text.split("\n\n").filter(Boolean);
});

const agreeCount = computed(() => {
  const base = props.source?.validated_count ?? 0;
  return base + (props.userVote === "agree" ? 1 : 0);
});

const disagreeCount = computed(() => {
  const base = props.source?.invalidated_count ?? 0;
  return base + (props.userVote === "disagree" ? 1 : 0);
});
</script>
