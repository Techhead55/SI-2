var lib = require("./lib").lib;
lib.initialise();
System.initialise();
Network.host(3780);
Interface.initialise(Cryptography.generatePort());
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
    osx: '/open -a "/Applications/Google Chrome.app" "http://google.com/"'
}));