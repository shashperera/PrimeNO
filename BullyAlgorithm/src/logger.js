class Logger {
    constructor(nid, node) {
        this.nid = new Date().getUTCMilliseconds();
        this.key = node.key;
        this.host = node.host;

    }

    log(message) {
        //generate a random unique number for Node ID
        const nid = this.nid + (Math.floor(Math.random() * 300));
        console.log(`${nid} : ${this.host.href} -- ${message}`);
        //console.log(`(${this.pid}) ${this.host.href} -- ${message}`);

    }
}

module.exports = Logger;

// 'use strict';

// class Logger {
//   constructor(service) {
//     this.service = service;
//   }

//   send(target, route, time = Date.now()) {
//     // pretend this is actually doing something
//     // more interesting than this...
//     console.log(`${this.service} - ${target} - ${route} - ${time}`);
//   }
// }

// module.exports = Logger;