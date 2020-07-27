import express from 'express';
import expressws from 'express-ws';
import WebSocket from 'ws';

const MAX_CURSORS_PER_CLIENT = 16;
const CLIENT_IDLE_TIMEOUT_SECONDS = 64;

interface Asshole {
    id: number,
    ws: WebSocket,
    ping: any,
    cursorCount: number,
    lastUpdate: number,
    urlHash: string
}

console.debug('cursormess');

var stats = {
    bytes_snd: 0,
    bytes_rcv: 0,
    most_assholes: 0,
    broadcast: 0,
    sent: 0,
    recv: 0
};

const app = expressws(express()).app;

var accu = 0;
const rooms = {};

function broadcast(room, data, exclude) {
    stats.broadcast++;

    rooms[room].forEach(x => {
        // skip over the excluded client
        if (exclude != null && exclude != undefined) {
            if (Array.isArray(exclude)) {
                if (exclude.includes(x)) {
                    return;
                }
            } else {
                if (x == exclude) {
                    return;
                }
            }
        }

        // don't bother sending data to idle clients, they might not even be looking at their screen
        if (data.c == 'p' && ((Date.now() - x.lastUpdate) / 1000) > CLIENT_IDLE_TIMEOUT_SECONDS) {
            return;
        }

        // decrement their cursor count so new ones can be sent to them later
        if (data.c == 'r') {
            x.cursorCount--;
        }

        try {
            if ((x.ws.readyState === WebSocket.OPEN)) {
                stats.sent++;
                x.ws.send(JSON.stringify(data));
            }
        }
        catch (e) { }
    });

}

function broadacastNewCursor(room, client) {
    let msg = {
        c: 'a',
        id: client.id
    };

    broadcast(room, msg, client);
}

function addToRoom(client) {
    const room = client.urlHash;
    if (rooms[room] == undefined) {
        rooms[room] = [];
    }
    
    rooms[room].push(client);
    broadacastNewCursor(room, client);

    console.log("someone joined room" + room);
}

app.ws("/cursormess", (ws, req) => {

    const client: Asshole = {
        id: accu++,
        ws,
        ping: null,
        cursorCount: 0,
        lastUpdate: Date.now(),
        urlHash: null
    };

    function send(data) {
        try {
            if (client.ws.readyState === WebSocket.OPEN) {
                stats.sent++;
                client.ws.send(data);
            }
        }
        catch (e) { }
    }

    console.log(`${client.id}: open from ${req.ip}`);

    // tell the new client about all the other clients

    ws.on('close', () => {
        rooms[client.urlHash].splice(rooms[client.urlHash].indexOf(client), 1);
        if(rooms[client.urlHash].length == 0) {
            console.log("nobody left in room " + client.urlHash);
            rooms[client.urlHash] = undefined;
            return; // dont need to send updates to the room cause its gone
        }
        console.log(`${client.id}: closed`);
        let msg = {
            c: 'r',
            id: client.id
        }
        broadcast(client.urlHash, msg, client);
    });

    ws.on('message', raw => {
        stats.recv++;

        try {
            client.lastUpdate = Date.now();
            // broadcast incoming data
            // TODO: currently, this will send *any* incoming data to all the clients. rework to only send the valid params to avoid exploits
            const data = JSON.parse(raw as string);
            let msg = {
                ...data,
                id: client.id
            };
            // is join message, contains url of client.
            if (msg.c == 'j') {
                client.urlHash = msg.urlHash;
                addToRoom(client);
                for (let i = 0; i < rooms[client.urlHash].length; i++) {
                    const c = rooms[client.urlHash][i];
                    if (c.id == client.id)
                        continue;

                    let msg = {
                        c: 'a',
                        id: c.id
                    };

                    send(JSON.stringify(msg));
                    client.cursorCount++;

                    if (client.cursorCount >= MAX_CURSORS_PER_CLIENT)
                        break;
                }
            } else {
                broadcast(client.urlHash, msg, client);
            }
        }
        catch (e) {
            console.error(`${client.id}: exception while processing message`);
            console.error(e);
        }

    });

});

app.listen('6969');
