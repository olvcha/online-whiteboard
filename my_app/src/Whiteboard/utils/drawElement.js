import { toolTypes } from "../../constants"; // Import tool types constants
import { getStroke } from "perfect-freehand"; // Import getStroke function for pencil tool
import { getSvgPathFromStroke } from "./getSvgPathFromStroke"; // Import function to get SVG path from stroke

const imageCache = new Map(); // Cache for storing images


// Function to draw pencil element
const drawPencilElement = (context, element) => {
  const myStroke = getStroke(element.points, {
    size: element.pencilSize, // Set stroke size
  });

  const pathData = getSvgPathFromStroke(myStroke); // Get SVG path data from stroke

  const myPath = new Path2D(pathData); // Create a new path
  context.fillStyle = element.color; // Set fill color
  context.fill(myPath); // Fill the path
};

// Function to draw text element
const drawTextElement = (context, element) => {
  context.textBaseline = "top"; // Set text baseline to top
  context.font = "24px sans-serif"; // Set font style
  context.fillStyle = element.color; // Set fill color
  context.fillText(element.text, element.x1, element.y1); // Draw the text
};

// Function to draw image element
const drawImageElement = (context, element) => {
  return new Promise((resolve) => {
    if (imageCache.has(element.data)) { // Check if the image is in cache
      const img = imageCache.get(element.data); // Get cached image
      console.log('Using cached image:', element.data);  
      drawImage(context, img, element);  // Draw the image
      resolve(); // Resolve the promise
    } else {
      const img = new Image(); // Create a new image
      img.src = element.data; // Set image source
      img.onload = () => {
        imageCache.set(element.data, img); // Cache the image
        console.log('Image loaded:', element.data, 'Natural size:', img.naturalWidth, 'x', img.naturalHeight);
        drawImage(context, img, element); // Draw the image
        resolve(); // Resolve the promise
      };
    }
  });
};

// Helper function to draw the image on the canvas
const drawImage = (context, img, element) => {
  let { x1, y1 } = element;
  const width = img.naturalWidth;
  const height = img.naturalHeight;

  console.log(`Drawing image at (${x1}, ${y1}) with width: ${width} and height: ${height}`);

  context.drawImage(img, x1, y1, width, height); // Draw the image on canvas
};

// Function to draw element synchronously
const drawElementSync = ({ roughCanvas, context, element }) => {
  switch (element.type) {
    case toolTypes.RECTANGLE: // Draw rectangle element
      context.strokeStyle = element.color;
      context.fillStyle = element.color;
      roughCanvas.color = element.color;
      roughCanvas.draw(element.roughElement);
      break;
    case toolTypes.LINE: // Draw line element
      context.strokeStyle = element.color;
      context.fillStyle = element.color;
      roughCanvas.color = element.color;
      roughCanvas.draw(element.roughElement);
      break;
    case toolTypes.PENCIL: // Draw pencil element
      drawPencilElement(context, element);
      break;
    case toolTypes.TEXT: // Draw text element
      drawTextElement(context, element);
      break;
    case toolTypes.IMAGE: // Draw image element
      drawImageElement(context, element);
      break;
    default:  // Handle unsupported element types
      throw new Error("Something went wrong when drawing element");
  }
};

// Function to draw element, supports async drawing for images
export const drawElement = async ({ roughCanvas, context, element }) => {
  if (element.type === toolTypes.IMAGE) {
    await drawImageElement(context, element); // Use await for images
  } else {
    drawElementSync({ roughCanvas, context, element }); // Synchronous drawing for other elements
    return Promise.resolve(); // Return a Promise for non-image elements
  }
};
