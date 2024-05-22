import { cursorPositions } from "../../constants";


export const getResizedCoordinates = (x, y, position, coordinates) => {
    const { x1, y1, x2, y2 } = coordinates;
    switch (position) {
        case cursorPositions.TOP_LEFT:
        case cursorPositions.BOTTOM_RIGHT:
            return { x1: x, y1: y, x2, y2 };
        case cursorPositions.TOP_RIGHT:
        case cursorPositions.BOTTOM_LEFT:
            return { x1, y1, x2: x, y2: y };
        default:
            return { x1, y1, x2, y2 };
    }
};