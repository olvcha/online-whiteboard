import { toolTypes } from "../../constants";

export const adjustElementCoordinates = (element) => {
  if (!element) {
    return { x1: 0, y1: 0, x2: 0, y2: 0 }; // Fallback values if element is undefined
  }

  const { type, x1, y1, x2, y2 } = element;

  if (type === toolTypes.RECTANGLE) {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const maxY = Math.max(y1, y2);
    const minY = Math.min(y1, y2);

    return { x1: minX, y1: minY, x2: maxX, y2: maxY };
  }

  if (type === toolTypes.LINE) {
    if (x1 < x2 || (x1 === x2 && y1 < y2)) {
      // drawing started from left to right
      return { x1, y1, x2, y2 };
    } else {
      return {
        x1: x2,
        y1: y2,
        x2: x1,
        y2: y1,
      };
    }
  }

  // Fallback for unsupported types
  return { x1, y1, x2, y2 };
};
