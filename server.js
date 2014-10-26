var lib = require("./lib").lib;
lib.initialise();
System.initialise();
Database.initialise("datab.db");
Database.store.on('load', function(){
    System.print("Database has been loaded");
    Interface.registerEvent("find", function(Event, Socket){
        Socket.emit("data", {
            ID: "response:"+Event.referer,
            Contents: Database.find(Event.Contents)
        });
    });
    Interface.registerEvent("findPairs", function(Event, Socket){
        Socket.emit("data", {
            ID: "response:"+Event.referer,
            Contents: Database.findPairs(Event.Contents)
        });
    });
});
Network.host(3780, function(Socket){
    System.print("An interface has connected.");
    Socket.on('data', function(event){
        event = JSON.parse(event.toString());
        Network.event(event, Socket);
    });
    Socket.on('end', function(){
        System.warn("An interface has disconnected.")
    });
    Network.registerEvent("find", function(Event, Socket){
        Socket.write(JSON.stringify({
            ID: "response:"+Event.referer,
            Contents: Database.find(Event.Contents)
        }));
    });
    Network.registerEvent("findPairs", function(Event, Socket){
        Socket.write(JSON.stringify({
            ID: "response:"+Event.referer,
            Contents: Database.findPairs(Event.Contents)
        }));
    });
    Network.registerEvent("time", function(Event, Socket){
        Socket.write(JSON.stringify({
            ID: "response:"+Event.referer,
            Contents: {
                Half: System.command({
                    osx:  'date "+%p" | tr "[:lower:]" "[:upper:]"'
                }),
                Hour: parseInt(System.command({
                    osx:  'date "+%I"'
                })),
                Minute: parseInt(System.command({
                    osx:  'date "+%M"'
                }))
            }
        }));
    });
});
//SERIALISE DATA SO NO SAME MESSAGE CAN BE SENT TWICE, AND ENCRYPT WITH KEY
Interface.port = Cryptography.generatePort();
Interface.securityCode = Cryptography.generateToken();
Interface.initialise(Interface.port, Interface.securityCode);
Interface.registerRequestHandler("/"+Interface.securityCode, "/serverinterface/index.html");
Interface.registerRequestHandler("/"+Interface.securityCode+"stylesheet", "/serverinterface/main.css");
Interface.registerRequestHandler("/"+Interface.securityCode+"script", "/serverinterface/main.js");
Interface.registerRequestHandler("/"+Interface.securityCode+"jquery", "/serverinterface/jquery.js");
Interface.registerRequestHandler("/ssiilogo", "/serverinterface/ssiilogo.png");
Interface.registerRequestHandler("/ccclogo", "/serverinterface/ccclogo.png");
Interface.registerRequestHandler("/"+Interface.securityCode+"CryptoJS", "/CryptoJS.js");
Interface.registerRequestHandler("/raleway", "/serverinterface/raleway.ttf");
Interface.coms.on('connection', function(Socket){
    System.print("Coms have been established with the interface.");
    Socket.on('data', function(event){
        Interface.event(event, Socket);
    });
    Socket.on('disconnect', function(){
        System.warn("Coms have been lost.");
    });
    System.IMLUE = function(m){
        Socket.emit("data", {
            ID: "Console Message",
            Message: m
        });
    }
});
System.print(System.command({
    osx: 'open -a "Google\ Chrome" http://localhost:'+Interface.port+'/'+Interface.securityCode
}));