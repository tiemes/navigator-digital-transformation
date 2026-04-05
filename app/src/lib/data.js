/**
 * data.js — Navigator data access
 * Imports navigator.json and provides helper functions
 * to look up dimensions, topics, and questions.
 *
 * Used by: compass overview, topic detail, pulse, barrier lens
 */
import navigatorData from '../data/navigator.json';

export const data = navigatorData;

/** @returns {object|undefined} Dimension object by ID */
export function getDimension(dimId) {
  return data.dimensions.find((d) => d.id === dimId);
}

/** @returns {object[]} All topics for a given dimension ID */
export function getTopicsByDimension(dimId) {
  return data.topics.filter((t) => t.dimension === dimId);
}

/** @returns {object|undefined} Topic object by ID */
export function getTopic(topicId) {
  return data.topics.find((t) => t.id === topicId);
}

/** @returns {string} Localised dimension name */
export function dimName(dimId, lang) {
  const dim = getDimension(dimId);
  return dim?.i18n[lang]?.name ?? dimId;
}

/** @returns {string} Localised topic name */
export function topicName(topicId, lang) {
  const topic = getTopic(topicId);
  return topic?.i18n[lang]?.name ?? topicId;
}
