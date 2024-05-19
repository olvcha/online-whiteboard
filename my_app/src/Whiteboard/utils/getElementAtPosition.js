import { toolTypes, cursorPositions } from "../../constants";

const nearPoint = (x, y, x1, y1, cursorPosition) => {
    return Math.abs(x-x1) < 5 && Math.abs(y - y1) < 5 ? cursorPosition : null;
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

export const getElementAtPosition =(x, y, elements) =>{
    return elements
    .map((el) => 
        ({
        ...el,
        position: positionWithinElement(x, y, el),
    }))
    .find(el => el.position !== null && el.position !== undefined);
};

