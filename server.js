var lib = require("./lib").lib;
lib.initialise();
System.initialise();
Interface.initialise(3780);
Interface.registerRequestHandler("/", "/serverinterface/index.html");
Interface.registerRequestHandler("/stylesheet", "/serverinterface/main.css");
Interface.registerRequestHandler("/script", "/serverinterface/main.js");
Interface.registerRequestHandler("/jquery", "/serverinterface/jquery.js");
Interface.registerRequestHandler("/ssiilogo", "/serverinterface/ssiilogo.png");
Interface.registerRequestHandler("/ccclogo", "/serverinterface/ccclogo.png");
Interface.coms.on('connection', function(coms){
    System.print("Coms have been established with the interface.");
    coms.on('disconnect', function(){
        System.warn("Coms have been lost.");
    });
});