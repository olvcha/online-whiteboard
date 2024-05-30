import { toolTypes } from "../../constants"; // Import tool types from constants

/**
 * Checks if an adjustment is required for a given element type.
 * 
 * @param {string} type - The type of the element to check.
 * @returns {boolean} - True if adjustment is required, false otherwise.
 */
export const adjustmentRequired = (type) =>
  // Check if the type is either RECTANGLE or LINE by seeing if it is included in the array
  [toolTypes.RECTANGLE, toolTypes.LINE].includes(type);
