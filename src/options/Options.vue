<template>
  <div class="wrap">
    <h1>Source Reliability Database</h1>
    <p>
      This is the dataset the plugin uses to score sources in Google search
      results. Today it's a static mock; once the Kirby CMS is connected, the
      team will manage these rows there instead of by editing a JSON file.
    </p>

    <table v-if="!loading">
      <thead>
        <tr>
          <th>Source</th>
          <th>Domain</th>
          <th>Trust score</th>
          <th>Explanation</th>
          <th>Agree</th>
          <th>Disagree</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="s in sortedSources" :key="s.source_domain">
          <td>{{ s.source_name }}</td>
          <td>{{ s.source_domain }}</td>
          <td class="score" :class="tierClass(s.trust_score)">
            {{ s.trust_score }}/100
          </td>
          <td class="explanation">{{ s.trust_score_explanation }}</td>
          <td>{{ s.validated_count }}</td>
          <td>{{ s.invalidated_count }}</td>
        </tr>
      </tbody>
    </table>
    <p v-else>Loading...</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useSources } from "../composables/useSources";

const { sources, loading } = useSources();

const sortedSources = computed(() =>
  [...sources.value].sort((a, b) => b.trust_score - a.trust_score)
);

function tierClass(score: number) {
  if (score >= 70) return "is-high";
  if (score >= 40) return "is-medium";
  return "is-low";
}
</script>

<style scoped>
.wrap {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
  font-family: var(--decode-font);
  color: var(--decode-ink);
}

h1 {
  font-size: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
  font-size: 13px;
}

th,
td {
  text-align: left;
  padding: 8px 10px;
  border-bottom: 1px solid var(--decode-border);
  vertical-align: top;
}

th {
  background: var(--decode-grey-light);
  font-weight: 600;
}

.explanation {
  max-width: 360px;
}

.score {
  font-weight: 700;
  white-space: nowrap;
}
.score.is-high {
  color: var(--decode-high-text);
}
.score.is-medium {
  color: var(--decode-medium-text);
}
.score.is-low {
  color: var(--decode-low-text);
}
</style>
