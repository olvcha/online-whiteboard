# Description
An interactive board that allows remote collaboration among people. It offers ability to draw, write and paste pictures.

# How to install

1. Download code (ZIP)
2. Open in the environment of your choice (ex. Visual Studio Code, WebStorm)
3. Download node modules (type npm install in the console in both the server and my_app directories)
4. Start the server side (type node index.js in the console of the server directory)
5. Start the application (type npm start in the console of the my_app directory)
6. The app should open in your browser as a localhost site. Have fun!

# What does the solution offer?
1. Creating an interface containing: a screen with the ability to create and join a room and a screen with a canvas and menu bar
2. Creating a menu with tools enabling:
- line drawing,
- drawing a rectangle,
- drawing with a pencil, changing its size,
- entering text from the keyboard, changing the font size,
- pasting a photo,
- changing the size and position of elements on the canvas,
- selecting and changing the color of the tool,
- exporting the table to an external file,
- resizing the canvas,
- cleaning the canvas and removing individual elements
3. Creating rooms and allowing you to join rooms

# What are the limitations of the solution?
- no mechanism for undoing or copying actions
- unable to change the size and position of images
- inability to freely move text that has already been created
- the assumption that once created, elements in a room remain despite shrinking the canvas beyond their scope
- the room is deleted after a minute without any users
