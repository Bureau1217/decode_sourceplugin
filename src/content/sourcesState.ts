import { ref } from "vue";
import type { Source } from "../api/sources";

/**
 * The full loaded database, kept around (not just the domain index used for
 * badge lookups) so the side panel can compute "related sources on this
 * topic" without a second fetch.
 */
export const allSources = ref<Source[]>([]);
