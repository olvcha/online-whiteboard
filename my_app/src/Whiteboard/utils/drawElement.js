import { toolTypes } from "../../constants";
import { getStroke } from "perfect-freehand";
import { getSvgPathFromStroke } from "./getSvgPathFromStroke";

const imageCache = new Map(); // Cache for storing images

const drawPencilElement = (context, element) => {
  const myStroke = getStroke(element.points, {
    size: 10,
  });

  const pathData = getSvgPathFromStroke(myStroke);

  const myPath = new Path2D(pathData);
  context.fillStyle = element.color;
  context.fill(myPath);
};

const drawTextElement = (context, element) => {
  context.textBaseline = "top";
  context.font = "24px sans-serif";
  context.fillStyle = element.color;
  context.fillText(element.text, element.x1, element.y1);
};

const drawImageElement = (context, element) => {
  return new Promise((resolve) => {
    if (imageCache.has(element.data)) { // Check if the image is in cache
      const img = imageCache.get(element.data);
      console.log('Using cached image:', element.data);
      drawImage(context, img, element);
      resolve();
    } else {
      const img = new Image();
      img.src = element.data;
      img.onload = () => {
        imageCache.set(element.data, img); // Cache the image
        console.log('Image loaded:', element.data, 'Natural size:', img.naturalWidth, 'x', img.naturalHeight);
        drawImage(context, img, element);
        resolve();
      };
    }
  });
};

const drawImage = (context, img, element) => {
  let { x1, y1 } = element;
  const width = img.naturalWidth;
  const height = img.naturalHeight;

  console.log(`Drawing image at (${x1}, ${y1}) with width: ${width} and height: ${height}`);

  context.drawImage(img, x1, y1, width, height);
};

const drawElementSync = ({ roughCanvas, context, element }) => {
  switch (element.type) {
    case toolTypes.RECTANGLE:
      context.strokeStyle = element.color;
      context.fillStyle = element.color;
      roughCanvas.color = element.color;
      roughCanvas.draw(element.roughElement);
      break;
    case toolTypes.LINE:
      context.strokeStyle = element.color;
      context.fillStyle = element.color;
      roughCanvas.color = element.color;
      roughCanvas.draw(element.roughElement);
      break;
    case toolTypes.PENCIL:
      drawPencilElement(context, element);
      break;
    case toolTypes.TEXT:
      drawTextElement(context, element);
      break;
    case toolTypes.IMAGE:
      drawImageElement(context, element);
      break;
    default:
      throw new Error("Something went wrong when drawing element");
  }
};

export const drawElement = async ({ roughCanvas, context, element }) => {
  if (element.type === toolTypes.IMAGE) {
    await drawImageElement(context, element); // Use await for images
  } else {
    drawElementSync({ roughCanvas, context, element }); // Synchronous drawing for other elements
    return Promise.resolve(); // Return a Promise for non-image elements
  }
};
