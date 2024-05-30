import { cursorPositions } from "../../constants"; // Import cursor positions from constants

/**
 * Returns the resized coordinates of an element based on the cursor position.
 * 
 * @param {number} x - The new x coordinate based on the resize action.
 * @param {number} y - The new y coordinate based on the resize action.
 * @param {string} position - The position of the cursor during the resize action.
 * @param {Object} coordinates - The current coordinates of the element.
 * @returns {Object} - The new coordinates of the element after resizing.
 */
export const getResizedCoordinates = (x, y, position, coordinates) => {
    const { x1, y1, x2, y2 } = coordinates;

    // Determine the new coordinates based on the cursor position
    switch (position) {
        case cursorPositions.TOP_LEFT:
            // Adjust top-left corner
            return { x1: x, y1: y, x2, y2 };
        case cursorPositions.BOTTOM_RIGHT:
            // Adjust bottom-right corner
            return { x1, y1, x2: x, y2: y };
        case cursorPositions.TOP_RIGHT:
            // Adjust top-right corner
            return { x1, y1: y, x2: x, y2 };
        case cursorPositions.BOTTOM_LEFT:
            // Adjust bottom-left corner
            return { x1: x, y1, x2, y2: y };
        default:
            // If the position is not recognized, return the original coordinates
            return { x1, y1, x2, y2 };
    }
};
