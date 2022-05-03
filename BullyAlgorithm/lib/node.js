 'use strict';

 const EventEmitter = require('events');
 exports = module.exports = function nodeFactory(id, relativeElectionResponseTimeout) {
     const node = {
         events: new EventEmitter(),
         flags: {
             anyBiggerNodesAlive: false,
         },
         currentLeader: null,
         id: id,
         addPeers: (peers) => {
             node.peers = peers;
             node._sendElectionMessage();
         },
         removePeer: (peer) => {
             const peerToRemoveIndex = node.peers.indexOf(parseInt(peer));
             node.peers.splice(peerToRemoveIndex, 1);
             node._sendElectionMessage();
         },
         _sendElectionMessage: () => {
             node.flags.anyBiggerNodesAlive = false;
             let peersWithHigherIds = node.peers.filter((pId) => {
                 return pId > node.id;
             });
             peersWithHigherIds.forEach((peerId) => {
                 node.events.emit('ELECTION', {
                     to: peerId,
                     from: node.id
                 });
             });
             setTimeout(() => {
                 if (node.flags.anyBiggerNodesAlive === false) {
                     console.log(`I am the master!`.toUpperCase());
                     node.currentLeader = node.id;
                     node.peers.forEach((p) => {
                         node.events.emit('COORDINATOR', {
                             to: p,
                             from: node.id
                         });
                     });
                 }
             }, relativeElectionResponseTimeout * node.peers.length);
         },
         inbox: (message, args) => {
             switch (message) {
                 case 'ELECTION':
                     node.events.emit('ANSWER', {
                         to: parseInt(args.sender),
                         from: parseInt(node.id),
                         message: 'I AM ONLINE'
                     });
                     break;
                 case 'ANSWER':
                     node.flags.anyBiggerNodesAlive = true;
                     break;
                 case 'COORDINATOR':
                     if (args.sender < node.id) {
                         if (node.id == node.currentLeader) {
                             console.log(`hey ${args.sender}, my nodes are loyal to me!`.toUpperCase());
                         } else {
                             console.log(`Oops ${args.sender}, Starting a new election`.toUpperCase());
                         }
                         node._sendElectionMessage();
                     } else {
                         node.currentLeader = parseInt(args.sender);
                         node.flags.anyBiggerNodesAlive = true;
                         console.log(`New master is ${args.sender}!`.toUpperCase());
                     }
                     break;
                 default:
                     break;
             }
         }
     };

     return node;
 };
