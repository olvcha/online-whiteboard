import { toolTypes } from "../../constants"; // Import tool types from constants

/**
 * Adjusts the coordinates of a given element based on its type.
 * 
 * @param {Object} element - The element whose coordinates need adjustment.
 * @returns {Object} - The adjusted coordinates of the element.
 */
export const adjustElementCoordinates = (element) => {
  // Check if the element is undefined or null
  if (!element) {
    // Return default coordinates if the element is not defined
    return { x1: 0, y1: 0, x2: 0, y2: 0 };
  }

  // Destructure the necessary properties from the element
  const { type, x1, y1, x2, y2 } = element;

  // If the element type is RECTANGLE
  if (type === toolTypes.RECTANGLE) {
    // Calculate minimum and maximum coordinates to adjust the rectangle
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);

    // Return the adjusted coordinates for the rectangle
    return { x1: minX, y1: minY, x2: maxX, y2: maxY };
  }

  // If the element type is LINE
  if (type === toolTypes.LINE) {
    // Check if the line is drawn from left to right or top to bottom
    if (x1 < x2 || (x1 === x2 && y1 < y2)) {
      // If drawing started from left to right, return the coordinates as is
      return { x1, y1, x2, y2 };
    } else {
      // If drawing started from right to left, swap the coordinates
      return {
        x1: x2,
        y1: y2,
        x2: x1,
        y2: y1,
      };
    }
  }

  // Fallback for unsupported element types, return the coordinates as is
  return { x1, y1, x2, y2 };
};
