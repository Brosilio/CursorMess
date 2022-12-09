# CursorMess
[CursorMess Repository @ GitHub](https://github.com/brosilio/cursormess)

This is a Node.js server and some dumb clientside JS to share the cursors of everyone using a particular webpage.
There's no actual functionality, (ie. clicking on other users' screens) but it's a cool aesthetic.

## To use
Simply include the [`src/frontend/cursormess.js`](src/frontend/cursormess.js) file on your webpages. That's it.

To host your own server, just clone the repo onto your host and then run `node .` in the `src/server` directory.
There are a few easily configurable global variables in [`src/server/index.ts`](src/server/index.ts) that let you change how some stuff works.

## Credits
### PixelBlaster
I read this project's source a lot to figure out how to use TypeScript.
See this project here: [https://git.agiri.ninja/akari/pixelblaster](https://git.agiri.ninja/akari/pixelblaster)

## License
This is licensed under the [MIT license](LICENSE.txt).
