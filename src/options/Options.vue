<template>
  <div class="wrap">
    <h1>Source Reliability Database</h1>
    <p>
      This is the dataset the plugin uses to score sources in Google search
      results, from the DECODE Project 3 workbook. Once the Kirby CMS is
      connected, the team will manage these rows there instead of by editing
      a JSON file.
    </p>

    <div class="toolbar">
      <input
        v-model="query"
        type="search"
        placeholder="Search by name, domain, country..."
        class="search"
      />
      <span class="count">{{ sortedSources.length }} of {{ sources.length }} sources</span>
    </div>

    <div v-if="topicFilter" class="chip">
      Filtered by topic: {{ topicFilter }}
      <button @click="clearFilter" aria-label="Clear filter">&times;</button>
    </div>

    <div v-if="!loading" class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Source</th>
            <th>Domain</th>
            <th>Type</th>
            <th>Country</th>
            <th>Topic</th>
            <th>Score</th>
            <th>Level</th>
            <th>Explanation</th>
            <th>Evidence</th>
            <th>Agree</th>
            <th>Disagree</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in sortedSources" :key="s.source_domain">
            <td>{{ s.source_name }}</td>
            <td>{{ s.source_domain }}</td>
            <td>{{ s.source_type ?? "-" }}</td>
            <td>{{ s.country_or_region ?? "-" }}</td>
            <td>{{ s.topic ?? "-" }}</td>
            <td class="score" :class="tierClass(s)">{{ s.trust_score }}/100</td>
            <td>{{ s.trust_level ?? "-" }}</td>
            <td class="explanation" :title="s.trust_score_explanation">
              {{ s.trust_score_explanation }}
            </td>
            <td>
              <a
                v-if="s.authority_sources?.[0]"
                :href="s.authority_sources[0]"
                target="_blank"
                rel="noopener noreferrer"
                >{{ s.authority_sources.length }} link{{
                  s.authority_sources.length > 1 ? "s" : ""
                }}</a
              >
              <span v-else>-</span>
            </td>
            <td>{{ s.validated_count }}</td>
            <td>{{ s.invalidated_count }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else>Loading...</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useSources } from "../composables/useSources";
import type { Source } from "../api/sources";

const { sources, loading } = useSources();

const query = ref("");
const params = new URLSearchParams(window.location.search);
const topicFilter = ref(params.get("topic"));

function clearFilter() {
  topicFilter.value = null;
  const url = new URL(window.location.href);
  url.searchParams.delete("topic");
  window.history.replaceState({}, "", url);
}

const sortedSources = computed(() => {
  let list = sources.value;
  if (topicFilter.value) {
    list = list.filter((s) => s.topic === topicFilter.value);
  }
  const q = query.value.trim().toLowerCase();
  if (q) {
    list = list.filter((s) =>
      [s.source_name, s.source_domain, s.country_or_region, s.topic, s.source_type]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q))
    );
  }
  return [...list].sort((a, b) => b.trust_score - a.trust_score);
});

function tierClass(s: Source) {
  const level = s.trust_level?.toLowerCase();
  if (level) {
    if (level === "very high" || level === "high") return "is-high";
    if (level === "medium") return "is-medium";
    if (level === "low" || level === "very low") return "is-low";
    return "";
  }
  if (s.trust_score >= 70) return "is-high";
  if (s.trust_score >= 40) return "is-medium";
  return "is-low";
}
</script>

<style scoped>
.wrap {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px;
  font-family: var(--decode-font);
  color: var(--decode-ink);
}

h1 {
  font-size: 20px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 12px 0;
}

.search {
  flex: 1;
  max-width: 320px;
  padding: 7px 10px;
  border-radius: 6px;
  border: 1px solid var(--decode-border);
  font-size: 13px;
}

.count {
  font-size: 12px;
  color: var(--decode-grey);
  white-space: nowrap;
}

.table-scroll {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
  font-size: 13px;
}

th,
td {
  text-align: left;
  padding: 8px 10px;
  border-bottom: 1px solid var(--decode-border);
  vertical-align: top;
  white-space: nowrap;
}

th {
  background: var(--decode-grey-light);
  font-weight: 600;
}

.explanation {
  max-width: 320px;
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.score {
  font-weight: 700;
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

.chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  background: var(--decode-grey-light);
  border-radius: 14px;
  padding: 4px 8px 4px 12px;
  margin-bottom: 12px;
}
.chip button {
  border: none;
  background: transparent;
  font-size: 15px;
  line-height: 1;
  cursor: pointer;
  color: var(--decode-grey);
  padding: 0 2px;
}
</style>
