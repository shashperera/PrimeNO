# node-bully


### prerequisites
* node.js v6.9.1 or greater installed

### demo  
* npm install
* node demo 5 http or node demo 7 grpc

### demo structure
**./lib/node.js**  *this is the bully algorithm implementation (as a lib)*  
**./wrapper/http.js** *this wrapper lets a node communicate over http (simulating a service using the lib)*  
**./wrapper/grpc.js** *this wrapper lets a node communicate over grpc (simulating a service using the lib)*  
**./demo.js** *this script runs the demo*

Some number of nodes in http services are there and introduced to each other. Now they will elect a new leader.
Then the current leader is killed and initial leader will be re-elected.
Finally that node will gain victory