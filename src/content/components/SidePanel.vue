<template>
  <transition name="decode-slide">
    <aside v-if="visible" class="decode-panel">
      <header class="decode-panel__header">
        <h2>DE.CO.DE Plugin</h2>
        <div class="decode-panel__header-actions">
          <button
            class="decode-panel__icon-btn"
            :class="{ 'is-active': methodologyOpen }"
            aria-label="How scores are calculated"
            title="How scores are calculated"
            @click="methodologyOpen = !methodologyOpen"
          >
            i
          </button>
          <button
            class="decode-panel__icon-btn"
            aria-label="Close"
            @click="$emit('close')"
          >
            &times;
          </button>
        </div>
      </header>

      <div v-if="methodologyOpen" class="decode-panel__methodology">
        <strong>How this score is calculated</strong>
        <p>
          Scores combine editorial-standards checks, funding and ownership
          transparency, and cross-checks against independent media
          reliability databases. They are reviewed periodically, not
          generated automatically.
        </p>
        <p>
          A score is a starting point, not a verdict - always check the
          individual article. Community Agree/Disagree votes are tracked
          separately and shown alongside the score; they don't change it
          automatically.
        </p>
      </div>

      <div class="decode-panel__source">
        <div class="decode-panel__name">
          {{ source?.source_name ?? domain }}
        </div>
        <div class="decode-panel__domain">{{ domain }}</div>
      </div>

      <div class="decode-panel__score-card">
        <div class="decode-panel__score-row">
          <div class="decode-panel__score">{{ scoreLabel }}</div>
          <span class="decode-panel__qualifier" :class="tierClass">{{
            qualifier
          }}</span>
        </div>
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
        <button
          v-if="related.length"
          class="decode-panel__related-link"
          @click="$emit('view-topic', source!.topic!)"
        >
          See more relevant sources on this subject &rarr;
        </button>
      </section>

      <section v-if="evidenceLinks.length" class="decode-panel__section">
        <h3>Evidence</h3>
        <ul class="decode-panel__evidence-list">
          <li v-for="(link, i) in evidenceLinks" :key="i">
            <a :href="link" target="_blank" rel="noopener noreferrer">{{
              shortLink(link)
            }}</a>
          </li>
        </ul>
      </section>

      <section v-if="source" class="decode-panel__section">
        <h3>Community evaluation</h3>
        <div class="decode-panel__community-row">
          <div class="decode-panel__counts">
            <span>{{ agreeCount.toLocaleString() }} agree</span>
            <span>{{ disagreeCount.toLocaleString() }} disagree</span>
          </div>
          <div class="decode-panel__vote-compact">
            <button
              class="decode-panel__vote-circle decode-panel__vote-circle--minus"
              :class="{ 'is-active': userVote === 'disagree' }"
              aria-label="I disagree with this score"
              title="I disagree with this score"
              @click="$emit('vote', 'disagree')"
            >
              &minus;
            </button>
            <button
              class="decode-panel__vote-circle decode-panel__vote-circle--plus"
              :class="{ 'is-active': userVote === 'agree' }"
              aria-label="I agree with this score"
              title="I agree with this score"
              @click="$emit('vote', 'agree')"
            >
              &plus;
            </button>
          </div>
        </div>
      </section>

      <section v-else class="decode-panel__section">
        <h3>Suggest a trust score</h3>
        <p v-if="mySuggestion" class="decode-panel__suggest-note">
          You suggested {{ mySuggestion.score }}/100. Saved on this device
          only - not yet reviewed by the team.
        </p>
        <p v-else class="decode-panel__suggest-note">
          This domain isn't in the database yet. Your suggestion saves
          locally on this device, as a starting point for the team to
          review.
        </p>
        <input
          v-model.number="draftScore"
          type="range"
          min="0"
          max="100"
          class="decode-panel__slider"
        />
        <div class="decode-panel__suggest-row">
          <span class="decode-panel__suggest-score">{{ draftScore }}/100</span>
          <button class="decode-panel__suggest-btn" @click="handleSuggest">
            {{ mySuggestion ? "Update suggestion" : "Submit suggestion" }}
          </button>
        </div>
      </section>

      <hr class="decode-panel__divider" />

      <button class="decode-panel__view-db" @click="$emit('view-database')">
        View full data base
      </button>
    </aside>
  </transition>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { relatedSources, type Source } from "../../api/sources";
import type { Vote } from "../votesState";
import { allSources } from "../sourcesState";
import { suggestions, submitSuggestion } from "../suggestionsState";

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
  "view-topic": [topic: string];
}>();

const methodologyOpen = ref(false);

const scoreLabel = computed(() =>
  props.source ? `${props.source.trust_score}/100` : "No data"
);

const barWidth = computed(() => {
  if (!props.source) return "0%";
  const clamped = Math.max(0, Math.min(100, props.source.trust_score));
  return `${clamped}%`;
});

// The workbook already assigns a trust_level ("Very high" / "High" /
// "Medium" / "Low" / "Very low" / "Unclear") per source - use that
// directly rather than re-deriving our own wording, and fall back to the
// numeric score only for sources that somehow don't have one.
const tierClass = computed(() => {
  const level = props.source?.trust_level?.toLowerCase();
  if (level) {
    if (level === "very high" || level === "high") return "is-high";
    if (level === "medium") return "is-medium";
    if (level === "low" || level === "very low") return "is-low";
    return "is-unknown";
  }
  const score = props.source?.trust_score ?? null;
  if (score === null) return "is-unknown";
  if (score >= 70) return "is-high";
  if (score >= 40) return "is-medium";
  return "is-low";
});

const qualifier = computed(() => {
  if (props.source?.trust_level) return props.source.trust_level;
  const score = props.source?.trust_score ?? null;
  if (score === null) return "Not yet rated";
  if (score >= 80) return "Highly reliable";
  if (score >= 70) return "Reliable";
  if (score >= 40) return "Mixed reliability";
  if (score >= 20) return "Low reliability";
  return "Unreliable";
});

const analysisParagraphs = computed(() => {
  const text =
    props.source?.trust_score_explanation ??
    "This domain has not been evaluated yet. It is not in the reliability database.";
  return text.split("\n\n").filter(Boolean);
});

const related = computed(() => {
  if (!props.source) return [];
  return relatedSources(allSources.value, props.source);
});

const evidenceLinks = computed(() => props.source?.authority_sources ?? []);

function shortLink(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./i, "");
  } catch {
    return url;
  }
}

const agreeCount = computed(() => {
  const base = props.source?.validated_count ?? 0;
  return base + (props.userVote === "agree" ? 1 : 0);
});

const disagreeCount = computed(() => {
  const base = props.source?.invalidated_count ?? 0;
  return base + (props.userVote === "disagree" ? 1 : 0);
});

const mySuggestion = computed(() => suggestions[props.domain] ?? null);
const draftScore = ref(mySuggestion.value?.score ?? 50);

// Reset the slider to this domain's existing suggestion (or the 50/100
// default) whenever a different badge is opened.
watch(
  () => props.domain,
  () => {
    draftScore.value = mySuggestion.value?.score ?? 50;
  }
);

function handleSuggest() {
  submitSuggestion(props.domain, draftScore.value);
}
</script>
