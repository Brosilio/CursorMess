# CursorMess
This is a Node.js server and some dumb clientside JS to share the cursors of everyone using a particular webpage.
There's no actual functionality, (ie. clicking on other users' screens) but it's a cool aesthetic.

## To use
Simply include the `src/frontend/cursormess.js` file on your webpages. That's it.

I host a server somewhere currently, but you're welcome to host your own. Just change the WebSocket
connection string in `cursormess.js` to your server.

To host your own server, just clone the repo onto your host and then run `node .` in the `src/server` directory.
There are a few easily configurable global variables in `src/server/index.ts` that let you change how some stuff works.

## Credits
### PixelBlaster
I read this project's source a lot to figure out how to use TypeScript.
See this project here: [https://git.agiri.ninja/akari/pixelblaster](https://git.agiri.ninja/akari/pixelblaster)

### jsSHA2
The clientside script of this uses jsSHA2 by Angel Marin, available here: [https://anmar.eu.org/projects/jssha2/](https://anmar.eu.org/projects/jssha2/)