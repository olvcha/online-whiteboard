import { toolTypes, cursorPositions } from "../../constants";
import {adjustElementCoordinates} from "./adjustElementCoordinates";

const nearPoint = (x, y, x1, y1, cursorPosition) => {
    return Math.abs(x-x1) < 5 && Math.abs(y - y1) < 5 ? cursorPosition : null;
};
const distance = (a, b) => {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
};

const isWithinElement = (x, y, element) => {
    const { x1, y1, x2, y2 } = adjustElementCoordinates(element);
    if (element.type === "rectangle" || element.type === "text") {
        return x >= x1 && x <= x2 && y >= y1 && y <= y2;
    } else if (element.type === "line") {
        const a = { x: x1, y: y1 };
        const b = { x: x2, y: y2 };
        const c = { x, y };
        const offset = distance(a, b) - (distance(a, c) + distance(b, c));
        return Math.abs(offset) < 1;
    } else if (element.type === "pencil") {
        for (let i = 0; i < element.roughElement.points.length - 1; i++) {
            const a = element.roughElement.points[i];
            const b = element.roughElement.points[i + 1];
            const c = { x, y };
            const offset = distance(a, b) - (distance(a, c) + distance(b, c));
            if (Math.abs(offset) < 1) {
                return true;
            }
        }
        return false;
    } else if (element.type === "image") {
        return x >= x1 && x <= x2 && y >= y1 && y <= y2;
    }
    return false;
};

const positionWithinElement = (x, y, element) =>{
    const {type, x1, x2, y1, y2} = element;

    switch (type){
        case toolTypes.RECTANGLE:
            const topLeft = nearPoint(x, y, x1, y1, cursorPositions.TOP_LEFT);
            const topRight = nearPoint(x, y, x2, y1, cursorPositions.TOP_RIGHT);
            const bottomLeft = nearPoint(x, y, x1, y2, cursorPositions.BOTTOM_LEFT);
            const bottomRight = nearPoint(x, y, x2, y2, cursorPositions.BOTTOM_RIGHT);
                const inside = x >= x1 && x <= x2 && y >= y1 && y <= y2 ? cursorPositions.INSIDE : null;
            
            return topLeft || topRight || bottomLeft || bottomRight || inside;
    }
};

export const getElementAtPosition = (x, y, elements) => {
    return elements
        .map(element => ({ ...element, position: cursorPositions.INSIDE }))
        .find(element => isWithinElement(x, y, element));
};


