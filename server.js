var lib = require("./lib").lib;
lib.initialise();
System.initialise();
Network.registerEvent("dataRequest", function (event, Socket){
    Socket.write("HELLO PEOPLE");
});
Network.host(3780, function(Socket){
    System.print("An interface has connected.");
    Network.sockets.push(Socket);
    Socket.on('data', function(event){
        event = JSON.parse(event.toString());
        Network.event(event, Socket);
    });
    Socket.on('end', function(){
        System.warn("An interface has disconnected.")
        Network.sockets.remove(Network.sockets.indexOf(Socket));
    });
});
Interface.port = Cryptography.generatePort();
Interface.initialise(Interface.port);
Interface.registerRequestHandler("/", "/serverinterface/index.html");
Interface.registerRequestHandler("/stylesheet", "/serverinterface/main.css");
Interface.registerRequestHandler("/script", "/serverinterface/main.js");
Interface.registerRequestHandler("/jquery", "/serverinterface/jquery.js");
Interface.registerRequestHandler("/ssiilogo", "/serverinterface/ssiilogo.png");
Interface.registerRequestHandler("/ccclogo", "/serverinterface/ccclogo.png");
Interface.registerRequestHandler("/CryptoJS", "/CryptoJS.js");
Interface.coms.on('connection', function(com){
    System.print("Coms have been established with the interface.");
    com.on('disconnect', function(){
        System.warn("Coms have been lost.");
    });
});
System.print(System.command({
    osx: 'open -a "Google\ Chrome" http://localhost:'+Interface.port
}));