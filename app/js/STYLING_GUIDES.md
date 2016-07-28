Here are some guidelines when you develop to make the code more coherent.

CommonJS
========
We use CommonJS to require packages. we have 3 types of them.
- npm dependencies packages (like angular, underscore) => require ('angular')
- folders one (like ./utils) => require ('utils/') use slash to make a difference with npm.
- files one (like ./class.js) => require ('class.js') use the extension to make a difference with folders.s

Always put npm first.
