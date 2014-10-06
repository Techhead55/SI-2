var lib = require("./lib").lib;
lib.initialise();
System.initialise();
MicroController.initialise();
MicroController.Board.on("ready", function(){
    System.print("The Micro Controller is ready.");
    MicroController.LCD = new MicroController.jFive.LCD({
        pins: [12,11,5,4,3,2],
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
        Interface.initialise(3780);
        // Change to config file
        Interface.registerRequestHandler("/", "/clientinterface/index.html");
        Interface.registerRequestHandler("/stylesheet", "/clientinterface/main.css");
        Interface.registerRequestHandler("/script", "/clientinterface/main.js");
        Interface.registerRequestHandler("/jquery", "/clientinterface/jquery.js");
        Interface.registerRequestHandler("/logo", "/clientinterface/logo.png");
        Interface.coms.on('connection', function(coms){
            System.print("Coms have been established with html interface.");
            coms.on('disconnect', function(){
                System.warn("Coms have been lost.");
            });
        });
    });
});