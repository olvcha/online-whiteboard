import { toolTypes, cursorPositions } from "../../constants"; // Import tool types and cursor positions from constants
import { adjustElementCoordinates } from "./adjustElementCoordinates"; // Import the function to adjust element coordinates

/**
 * Determines if a point (x, y) is near another point (x1, y1).
 * 
 * @param {number} x - The x coordinate of the point.
 * @param {number} y - The y coordinate of the point.
 * @param {number} x1 - The x coordinate to check against.
 * @param {number} y1 - The y coordinate to check against.
 * @param {string} cursorPosition - The cursor position to return if near.
 * @returns {string|null} - The cursor position if near, otherwise null.
 */
const nearPoint = (x, y, x1, y1, cursorPosition) => {
    return Math.abs(x - x1) < 5 && Math.abs(y - y1) < 5 ? cursorPosition : null;
};

/**
 * Calculates the distance between two points a and b.
 * 
 * @param {Object} a - The first point with x and y properties.
 * @param {Object} b - The second point with x and y properties.
 * @returns {number} - The distance between points a and b.
 */
const distance = (a, b) => {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
};

/**
 * Checks if a point (x, y) is within an element.
 * 
 * @param {number} x - The x coordinate of the point.
 * @param {number} y - The y coordinate of the point.
 * @param {Object} element - The element to check against.
 * @returns {boolean} - True if the point is within the element, false otherwise.
 */
const isWithinElement = (x, y, element) => {
    const { x1, y1, x2, y2 } = adjustElementCoordinates(element);
    if (element.type === toolTypes.RECTANGLE || element.type === toolTypes.TEXT || element.type === toolTypes.IMAGE) {
        // Check if point is within a rectangle, text, or image element
        return x >= x1 && x <= x2 && y >= y1 && y <= y2;
    } else if (element.type === toolTypes.LINE) {
        // Check if point is on a line element
        const a = { x: x1, y: y1 };
        const b = { x: x2, y: y2 };
        const c = { x, y };
        const offset = distance(a, b) - (distance(a, c) + distance(b, c));
        return Math.abs(offset) < 1;
    } else if (element.type === toolTypes.PENCIL) {
        // Check if point is near any segment of a pencil element
        for (let i = 0; i < element.points.length - 1; i++) {
            const a = element.points[i];
            const b = element.points[i + 1];
            const c = { x, y };
            const offset = distance(a, b) - (distance(a, c) + distance(b, c));
            if (Math.abs(offset) < 5) {
                return true;
            }
        }
        return false;
    }
    return false;
};

/**
 * Determines the cursor position within an element based on the point (x, y).
 * 
 * @param {number} x - The x coordinate of the point.
 * @param {number} y - The y coordinate of the point.
 * @param {Object} element - The element to check against.
 * @returns {string|null} - The cursor position if within the element, otherwise null.
 */
const positionWithinElement = (x, y, element) => {
    const { type, x1, x2, y1, y2 } = element;

    switch (type) {
        case toolTypes.RECTANGLE:
            // Check positions near the corners and inside the rectangle
            const topLeft = nearPoint(x, y, x1, y1, cursorPositions.TOP_LEFT);
            const topRight = nearPoint(x, y, x2, y1, cursorPositions.TOP_RIGHT);
            const bottomLeft = nearPoint(x, y, x1, y2, cursorPositions.BOTTOM_LEFT);
            const bottomRight = nearPoint(x, y, x2, y2, cursorPositions.BOTTOM_RIGHT);
            const inside = x >= x1 && x <= x2 && y >= y1 && y <= y2 ? cursorPositions.INSIDE : null;

            return topLeft || topRight || bottomLeft || bottomRight || inside;
        case toolTypes.LINE:
            // Check if point is near the line
            const a = { x: x1, y: y1 };
            const b = { x: x2, y: y2 };
            const c = { x, y };
            const offset = distance(a, b) - (distance(a, c) + distance(b, c));
            return Math.abs(offset) < 5 ? cursorPositions.INSIDE : null;
        case toolTypes.PENCIL:
            // Check if point is near any segment of the pencil drawing
            for (let i = 0; i < element.points.length - 1; i++) {
                const a = element.points[i];
                const b = element.points[i + 1];
                const c = { x, y };
                const offset = distance(a, b) - (distance(a, c) + distance(b, c));
                if (Math.abs(offset) < 5) {
                    return cursorPositions.INSIDE;
                }
            }
            return null;
        case toolTypes.TEXT:
        case toolTypes.IMAGE:
            // Check if point is within the text or image element
            return x >= x1 && x <= x2 && y >= y1 && y <= y2 ? cursorPositions.INSIDE : null;
        default:
            return null;
    }
};

/**
 * Finds the element at a given position (x, y) within a list of elements.
 * 
 * @param {number} x - The x coordinate of the point.
 * @param {number} y - The y coordinate of the point.
 * @param {Array} elements - The list of elements to check against.
 * @returns {Object|null} - The element at the position if found, otherwise null.
 */
export const getElementAtPosition = (x, y, elements) => {
    return elements
        .map(element => ({ ...element, position: positionWithinElement(x, y, element) }))
        .find(element => element.position !== null);
};
