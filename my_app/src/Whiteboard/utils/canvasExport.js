/**
 * Exports the content of a canvas as a JPEG image with a white background.
 * 
 * @param {Object} canvasRef - A reference to the canvas element to export.
 */
const exportCanvas = (canvasRef) => {
    // Get the current canvas element from the reference
    const canvas = canvasRef.current;
    
    // Proceed only if the canvas element exists
    if (canvas) {
        // Create a temporary canvas element
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        // Set the dimensions of the temporary canvas to match the original canvas
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;

        // Fill the temporary canvas with a white background
        tempCtx.fillStyle = 'white';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        // Draw the original canvas onto the temporary canvas
        tempCtx.drawImage(canvas, 0, 0);

        // Get the data URL of the temporary canvas content as a JPEG image
        const dataUrl = tempCanvas.toDataURL('image/jpeg');

        // Create a download link for the generated image
        const link = document.createElement('a');
        link.href = dataUrl;         // Set the href to the data URL of the image
        link.download = 'whiteboard.jpg'; // Set the download attribute with the file name
        link.click();                // Trigger a click event to download the image
    }
};

export default exportCanvas; // Export the function as the default export
