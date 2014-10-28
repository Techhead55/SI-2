var lib = require("./lib").lib;
lib.initialise();
System.initialise();
MicroController.initialise();
MicroController.Board.on("ready", function(){
    System.print("The Micro Controller is ready.");
    MicroController.LCD = new MicroController.jFive.LCD({
        pins: [12,11,5,4,3,2],
    });
    MicroController.TMPSensor = new MicroController.jFive.Sensor("A0");
    MicroController.TMPSensor.on("data", function() {
        MicroController.TMPSensor.CelsiusTemp = ((this.value * 0.004882814) - 0.5) * 100;   
    });
    MicroController.LCD.on("ready", function(){
        System.print("The LCD is ready.");
        System.hardwareOut = function(m){
            m = m.length+6 > 16 ? 
                ["SI^2: "+m.substring(0, 11), m.substring(10, m.length)] :
                ["SI^2: "+m];
            lib.MicroController.LCD.clear().cursor(0, 0).print(m[0]);
            lib.MicroController.LCD.cursor(1, 0).print(m[1]);
        };
        Network.connect(3780, "127.0.0.1", function(Client){
            System.print("Connected to main server");
            Client.on('data', function(data){
                data = JSON.parse(data.toString());
                Network.event(data);
            });
            Client.on('end', function(data){
                System.warn("Lost connection to server.");
                setTimeout(function(){
                    Network.connect(3780, "127.0.0.1", Network.connectionEvent);
                }, 1000);
            });
            /*Network.makeRequest({
                ID: "findPairs",
                Contents: "event"
            }, function(Event, Socket){
                console.log(Event, typeof Event);
            });*/
        });
        Interface.port = Cryptography.generatePort();
        Interface.securityCode = Cryptography.generateToken();
        Interface.initialise(Interface.port, Interface.securityCode);
        Interface.registerRequestHandler("/", "/clientinterface/index.html");
        Interface.registerRequestHandler("/stylesheet", "/clientinterface/main.css");
        Interface.registerRequestHandler("/script", "/clientinterface/main.js");
        Interface.registerRequestHandler("/jquery", "/clientinterface/jquery.js");
        Interface.registerRequestHandler("/logo", "/clientinterface/logo.png");
        Interface.registerRequestHandler("/opensans", "/clientinterface/opensans.woff2");
        Interface.registerEvent("time", function(Event, Socket){
            Network.makeRequest({
                ID: "time"
            }, function(NetEvent, NetSocket){
                Socket.emit("data", {
                    ID: "response:"+Event.referer,
                    Contents: NetEvent.Contents
                });
            });
        });
        Interface.registerEvent("temp", function(Event, Socket){
            Socket.emit("data", {
                ID: "response:"+Event.referer,
                Contents: MicroController.TMPSensor.CelsiusTemp
            });
        });
        Interface.coms.on('connection', function(Socket){
            System.print("Coms have been established with html interface.");
            Socket.on('disconnect', function(){
                System.warn("Coms have been lost.");
            });
            Socket.on('data', function(event){
                Interface.event(event, Socket);
            });
        });
        System.print(System.command({
            osx: 'open -a "Google\ Chrome" http://localhost:'+Interface.port,
            linux: '/usr/bin/chromium --incognito --kosk http://localhost:'+Interface.port
        }));
    });
});