import fs from 'fs';

import express from 'express';
import expressws from 'express-ws';
import WebSocket from 'ws';
import msgpack from 'msgpack-lite';

interface MiiiClient {
    id: number,
    ws: WebSocket,
	ping: any
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
const clients: MiiiClient[] = [];

function broadcast(data, exclude) {

    stats.broadcast++;

    clients.forEach(x => {
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

        try {
            if ((x.ws.readyState === WebSocket.OPEN)) {
                stats.sent++;
                x.ws.send(data);
            }
        }
        catch (e) { }
    });

}

app.ws("/cursormess", (ws, req) => {

    const client: MiiiClient = {
        id: accu++,
        ws,
        ping: null
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

    clients.push(client);
    console.log(`${client.id}: open from ${req.ip}`);

    ws.on('close', () => {
        clients.splice(clients.indexOf(client), 1);
        console.log(`${client.id}: closed`);
    });

    ws.on('message', msg => {

        stats.recv++;
        console.log(msg);
        try {
			// broadcast incoming data
            broadcast(msg, client);
        }
        catch (e) {
            console.error(`${client.id}: exception while processing message`);
            console.error(e);
        }

    });

});

app.listen('6969');
