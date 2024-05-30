import { cursorPositions } from "../../constants"; // Import cursor positions from constants

/**
 * Returns the appropriate cursor style based on the given position.
 * 
 * @param {string} position - The position to get the cursor style for.
 * @returns {string} - The cursor style corresponding to the position.
 */
export const getCursorForPosition = (position) => {
    // Determine the cursor style based on the position value
    switch (position) {
        case cursorPositions.TOP_LEFT:
        case cursorPositions.BOTTOM_RIGHT:
        case cursorPositions.START:
        case cursorPositions.END:
            // For these positions, use the "nwse-resize" cursor style
            return "nwse-resize";
        case cursorPositions.TOP_RIGHT:
        case cursorPositions.BOTTOM_LEFT:
            // For these positions, use the "nesw-resize" cursor style
            return "nesw-resize";
        default:
            // For all other positions, use the "move" cursor style
            return "move";
    }
};
