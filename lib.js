String.prototype.repeat = function(num){
    return new Array(Math.round(num)+1).join(this);
}
var lib = {},
    fs = require("fs"),
    colour = require('cli-color'),
    readline = require('readline'),
    express = require('express'),
    HTTP = require('http'), 
    os = require('os'),
    socketIO = require("socket.io"),
    jFive = require("johnny-five"),
    net = require("net"),
    CryptoJS = require('./CryptoJS.js'),
    hat = require('hat');
require('shelljs/global');
lib.System = {
    hardwareOut: function(){},
    drawBack: function (){
        console.log(colour.bgXterm(15)(" ").repeat(colour.width-1));
        process.stdout.write(colour.move(0, -1));
    },
    print: function(m){
        lib.System.drawBack();
        console.log(colour.xterm(40).bgXterm(15)("SI^2: ")+colour.xterm(0).bgXterm(15)(m));
        lib.System.hardwareOut(m);
    },
    warn: function(m){
        lib.System.drawBack();
        console.warn(colour.xterm(202).bgXterm(15)("SI^2: ")+colour.xterm(0).bgXterm(15)(m));
        lib.System.hardwareOut(m);
    },
    error: function(m){
        lib.System.drawBack();
        console.error(colour.xterm(9).bgXterm(15)("SI^2: ")+colour.xterm(0).bgXterm(15)(m));
        lib.System.hardwareOut(m);
    },
    clear: function(){
        console.log(colour.reset);
    },
    read: function(){
        
    },
    write: function(){
        
    },
    os: function(){
        return process.platform.replace("win32", "Windows").replace("win64", "Windows").replace("win86", "Windows").replace("darwin", "OSX").toLowerCase();
    },
    command: function(commands){
        return exec(commands[lib.System.os()], {silent:true}).output;
    },
    printHeader: function(){
        lib.System.drawBack();
        console.log(colour.xterm(39).bgXterm(15)(" ".repeat((colour.width/2)-(("SI^2 running on "+System.os()).length/2))+("SI^2 running on "+System.os())));
    },
    initialise: function(){
        lib.System.clear();
        process.stdout.write(colour.moveTo(0, 0));
        lib.System.printHeader()
    }
};
lib.MicroController = {
    jFive: jFive,
    initialise: function(){
        if (System.os() === "windows") lib.MicroController.Board = new jFive.Board({port:"COM3"});
        if (System.os() === "linux") lib.MicroController.Board = new jFive.Board({});
        lib.MicroController.Board.debug = false;
    }
};
lib.Interface = {
    registerRequestHandler: function(reqDir, resDir){
        lib.System.print("Interface request handler registered: "+reqDir+" --> "+resDir);
        lib.Interface.application.get(reqDir, function(req, res){
            lib.System.print("Interface served request: "+reqDir+" --> "+resDir);
            res.sendfile(__dirname + resDir);
        });
    },
    initialise: function(port){
        lib.Interface.application = express();
        lib.Interface.server = HTTP.createServer(lib.Interface.application);
        lib.Interface.server.listen(port);
        lib.System.print("Interface listening on port "+port);
        lib.Interface.coms = socketIO.listen(lib.Interface.server, {log: false});
        lib.System.print("Interface coms have been initiated.");
        lib.Interface.coms.origins("localhost:"+port);
        lib.System.print("Coms are locked to port "+port);
    },
    open: function(){
        
    }
};
lib.Network = {
    connect: function(port){
        lib.Network.client = net.connect({port: port}, function(){
            lib.System.print("Server connection established.");
        });
    },
    host: function(port){
        lib.Network.server = net.createServer(function(socket){
            lib.System.print("Server initialised.");
        });
        lib.Network.server.listen(port, function(){
            lib.System.print("Server listening on port "+port);
        });
    },
    on: function(key, callback){
        lib.System.print("Server event listener registered.");
        lib.Network.client.on(key, callback);
    },
    emit: function(key, contents){
        lib.System.print("Server emited "+key+" event, with the contents "+contents);
        lib.Network.client.emit(key,callback);
    },
    disconnect: function(){
        lib.Network.client.end();
    }
};
lib.Cryptography = {
    AES: CryptoJS.AES, 
    generateToken: function(){
        return hat();
    },
    generatePort: function(){
        return Math.floor(Math.random() * 55000) + 1000;
    }
};
lib.Database = {
    initialise: function(){
        
    }
};
lib.initialise = function(){
    for (i in lib) if (i !== "initialise") GLOBAL[i] = lib[i];
};
exports.lib = lib;
GLOBAL.jFive = jFive;