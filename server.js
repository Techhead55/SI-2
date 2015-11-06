var lib = require("./lib").lib;
lib.initialise();
System.initialise();
Database.initialise("datab.db");
Database.store.on('load', function(){
    System.print("Database has been loaded");
    Statistics.Entries = Database.entries();
    Interface.registerEvent("get", function(Event, Socket){
        Socket.emit("data", {
            ID: "response:"+Event.referer,
            Contents: Database.store.get(Event.Contents)
        });
    });
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
    Interface.registerEvent("set", function(Event, Socket){
        Database.store.set(Event.Contents.key, Event.Contents.doc);
    });
    Interface.registerEvent("remove", function(Event, Socket){
        Database.store.rm(Event.Contents);
    });
    Interface.registerEvent("get", function(Event, Socket){
        Socket.emit("data", {
            ID: "response:"+Event.referer,
            Contents: {
                key: Event.key,
                doc: Database.store.get(Event.key)
            }
        });
    });
    Interface.registerEvent("hash", function(Event, Socket){
        Socket.emit("data", {
            ID: "response:"+Event.referer,
            Contents: Cryptography.generateToken()
        });
    });
});
Network.host(3780, function(Socket){
    System.print("An interface has connected.");
    Statistics.Interfaces += 1;
    Statistics.update();
    Socket.on('data', function(event){
        event = JSON.parse(event.toString());
        Network.event(event, Socket);
    });
    Socket.on('end', function(){
        System.warn("An interface has disconnected.")
        Statistics.Interfaces -= 1;
        Statistics.update();
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
Interface.application.get("/image", function(req, res){
    lib.System.print("Interface served image request for ID "+req.query.ID);
    res.sendFile(__dirname + "/filebase/"+req.query.ID);
});
Interface.coms.on('connection', function(Socket){
    System.print("Coms have been established with the interface.");
    Socket.on('data', function(event){
        Interface.event(event, Socket);
    });
    Socket.on('disconnect', function(){
        System.warn("Coms have been lost.");
    });
    Interface.registerEvent("Console Message Repository", function(Event, Socket){
        Socket.emit("data", {
            ID: "response:"+Event.referer,
            Contents: System.writtenLog
        });
    });
    Interface.registerEvent("Initial Statistics", function(Event, Socket){
        Socket.emit("data", {
            ID: "response:"+Event.referer,
            Contents: {
                Interfaces: Statistics.Interfaces,
                Data_Entries: Statistics.Entries
            }
        });
    });
    Interface.registerEvent("Uptime", function(Event, Socket){
        Socket.emit("data", {
            ID: "response:"+Event.referer,
            Contents: process.uptime()
        });
    });
    Interface.registerEvent("Shutdown", function(Event, Socket){
        System.warn("Shutdown event recieved, server terminatng now.");
        Database.store.close();
        process.kill();
    });
    Interface.registerEvent("Restart", function(Event, Socket){
        System.warn("Restart event recieved, server terminatng now.");
        process.kill();
    });
    System.IMLUE = function(m){
        Socket.emit("data", {
            ID: "Console Message",
            Message: m
        });
    }
    Statistics.update = function(){
        Socket.emit("data", {
        ID: "Statistics Update",
            Contents: {
                Interfaces: Statistics.Interfaces,
                Data_Entries: Statistics.Entries
            }
        });
    };
});
System.print(System.command({
    osx: 'open -a "Google\ Chrome" http://localhost:'+Interface.port+'/'+Interface.securityCode
}));