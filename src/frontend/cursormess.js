/*
* CursorMess
* https://github.com/brosilio/cursormess
* Copyright (C) 2020 Brosilio
* Licensed under the license specified at:
*   https://github.com/Brosilio/CursorMess/blob/master/LICENSE.txt
*/

/* -- variables -- */
const CURSORMESS_WEBSOCKET_HOST_ENDPOINT = "wss://phantom.brosil.io/cursormess";
const cursorMess = {};
cursorMess.id = null;
cursorMess.cursors = {};
cursorMess.myCur = {
    x: 0,
    y: 0
};
cursorMess.myLastCurPos = {
    x: 0,
    y: 0
};
cursorMess.ws = new WebSocket(CURSORMESS_WEBSOCKET_HOST_ENDPOINT);

/* -- shit -- */
cursorMess.ws.onopen = () => {
    console.log("CursorMess connected");
    if (window.Event) {
        document.captureEvents(Event.MOUSEMOVE);
        document.onmousemove = e => {
            cursorMess.myCur.x = e.pageX;
            cursorMess.myCur.y = e.pageY;
        };
    } else {
        document.onmousemove = e => {
            cursorMess.myCur.x = e.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
            cursorMess.myCur.y = e.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
        };
    }

    /* send join command with the url hash (minus query strings and #section-bullshit) */
    cursorMess.ws.send(JSON.stringify({
        c: 'j',
        urlHash: fnv1a_str(document.location.protocol + '//' + document.location.host + document.location.pathname)
    }
    ));

    /* update position every 1000ms (if the position has changed since the last update) */
    setInterval(() => {
        let pos = cursorMess.myCur;
        if (pos.x != cursorMess.myLastCurPos.x || pos.y != cursorMess.myLastCurPos.y) {
            let cockSucker = JSON.stringify({
                c: 'p',
                /* convert to percentage */
                x: cursorMess.myCur.x / Math.max(document.body.clientWidth, window.innerWidth) * 100,
                y: cursorMess.myCur.y / Math.max(document.body.clientHeight, window.innerHeight) * 100
            });

            cursorMess.ws.send(cockSucker);

            /* can't just set myLastCursorPos = pos because javascript is garbage. some weird ref bullshit */
            cursorMess.myLastCurPos = {
                x: pos.x,
                y: pos.y
            };
        }

    }, 100);

    /* send a ping every 10 seconds to prevent the websocket from shidding and fardding */
    setInterval(() => {
        cursorMess.ws.send('{ "c":"ping" }');
    }, 10000);
};

cursorMess.ws.onmessage = raw => {
    const data = JSON.parse(raw.data);
    const ws = cursorMess.ws;
    if (data == null) return;

    function send(obj) {
        ws.send(JSON.stringify(obj));
    }

    switch (data.c) {
        case 'pong':
        case 'ping':
            return;
        case 'p': updateCursor(data.id, data.x, data.y); break;
        case 'r': removeCursor(data.id); break;
        case 'a': addCursor(data.id); break;
        case '!': break;
        // TODO: ^ this feature ^
    }

    function addCursor(id) {
        let cur = document.createElement('img');
        cur.setAttribute('src', 'https://brosilio.github.io/fuckyou.png');
        cur.setAttribute('style', `position: absolute; opacity: 0; transition: 1s linear;`);
        cursorMess.cursors[id] = cur;
        document.documentElement.appendChild(cur);
    }

    /* set cursor <img> opacity to 0 then eviscerate its DOM element */
    function removeCursor(id) {
        cursorMess.cursors[id].style.opacity = "0";
        setTimeout(() => {
            document.documentElement.removeChild(cursorMess.cursors[id]);
        }, 1000);
    }

    /* update a cursor's position */
    function updateCursor(id, x, y) {
        cursorMess.cursors[id].style.left = `${x}%`;
        cursorMess.cursors[id].style.top = `${y}%`;
        cursorMess.cursors[id].style.opacity = "0.8";
    }
};

cursorMess.ws.onclose = () => {
    console.log('CursorMess lost connection to server.');

    /* fade out & delete all cursors */
    for (const cur in cursorMess.cursors) {
        if (cur != undefined && cur != null) {
            removeCursor(cur);
        }
    }

    /* try reconnecting */
    setTimeout(() => {
        cursorMess.ws = new WebSocket(CURSORMESS_WEBSOCKET_HOST_ENDPOINT);
    }, (1000));
};

// ------- other stuff -------- //

function fnv1a_str(s) {
    let h = 0x811C9DC5;
    let i = s.length;
    while (i--) h = (h ^ s.charCodeAt(i)) * 0x01000193;
    return h;
}