var lib = require("./lib").lib;
lib.initialise();
System.initialise();
Network.connect(3780, "127.0.0.1", function(Client){
    System.print("Connected to main server");
    Client.write(JSON.stringify({eventID: "initialDataRequest"}));
    Client.on('data', function(data){
        System.print(data.toString());
    });
    Client.on('end', function(data){
        System.warn("Lost connection to server.");
        setTimeout(function(){
            Network.connect(3780, "127.0.0.1", Network.connectionEvent);
        }, 1000);
    });
});
Interface.initialise(Cryptography.generatePort());
System.print(System.command({
    osx: 'open -a "Google\ Chrome" http://localhost:'+Interface.port
}));