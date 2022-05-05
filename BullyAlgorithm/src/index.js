const express = require('express');
const axios = require('axios');
const Logger = require('./logger');

let leaderNode = null;
let isAwaitingNewCoordinator = false;

(async () => {
    const app = express();
    const nodes = getNodes(process.argv);
    const thisNode = nodes[0];

    // const httpProxy = require('http-proxy');
    // const apiProxy = httpProxy.createProxyServer();

    const logger = new Logger(process.nid, thisNode);

    registerEndpoints(app, nodes, logger);
    setInterval(() => pingCoordinator(nodes, logger), 5000);

    app.listen(thisNode.host.port, () => logger.log('Up and listening'));
    startElection(nodes, logger);
})();

function getNodes(args) {
    let nodes = args.slice(2).map(x => {
        let tokens = x.split(':');
        return {
            key: parseInt(tokens[0]),
            host: new URL(tokens.slice(1).join(':'))
        };
    });

    return nodes;
}

function registerEndpoints(app, nodes, logger) {
    app.get('/alive', (req, res) => res.sendStatus(200)); //

    app.get('/election', (req, res) => {
        res.sendStatus(200);
        startElection(nodes, logger);
    });

    app.get('/victory', (req, res) => {
        isAwaitingNewCoordinator = false; //Register a node service
        leaderNode = nodes.filter(x => x.key == req.query.key)[0];
        res.sendStatus(200);
        logger.log(`Set ${leaderNode.host.href} as the new leader`);
    });
}

//Ping and check the coordinator status
async function pingCoordinator(nodes, logger) {
    try {
        let url = new URL('/alive', leaderNode.host);
        await axios.get(url.href); //if available continue
        logger.log(`Coordinator node ${leaderNode.host.href} is up`);
    } catch (error) {
        logger.log(`Coordinator node ${leaderNode.host.href} is down!`); //if not re-elect
        startElection(nodes, logger);
    }
}

async function startElection(nodes, logger) {
    logger.log('Starting election...');

    isAwaitingNewCoordinator = true;
    let thisNode = nodes[0];
    let candidates = nodes.slice().sort((a, b) => b.key - a.key); // candidate selected by descending order, by key

    for (candidate of candidates) {
        if (candidate.key === thisNode.key) {
            logger.log('Declaring self as new leader');

            await Promise.all(
                nodes.map(x => {
                    let url = new URL('/victory', x.host);
                    return axios.get(url.href, { params: { key: thisNode.key } });
                })
            ).catch(() => { });

            break;
        } else {

            try {
                // send election message to candidate
                let url = new URL('/election', candidate.host);
                await axios.get(url.href);

                // if a response is received, wait for subsequent victory message (but start over if it never comes)
                setTimeout(() => {
                    if (isAwaitingNewCoordinator) {
                        startElection();
                    }
                }, 10000);

                break;
            } catch (error) {
                console.log("Error", error)
            }

        }
    }
}