/**
 * +page.js — Topic detail page load
 * Extracts the topic ID from the URL params.
 * Generates all valid topic paths for static prerendering.
 */
import { data } from '$lib/data.js';

export function load({ params }) {
  return { topicId: params.id };
}

/** Generate static paths for all topics */
export function entries() {
  return data.topics.map((t) => ({ id: t.id }));
}
