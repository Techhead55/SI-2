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
    BWLog: [],
    drawBack: function (){
        console.log(colour.bgXterm(15)(" ").repeat(colour.width-1));
        process.stdout.write(colour.move(0, -1));
    },
    print: function(m){
        lib.System.drawBack();
        var fm = colour.xterm(40).bgXterm(15)("SI^2 "+lib.System.command({
            osx:  'date "+%I:%M:%S%p" | tr "[:lower:]" "[:upper:]"'
        })+": ")+colour.xterm(0).bgXterm(15)(m);
        console.log(fm);
        lib.System.BWLog.push(fm);
        lib.System.hardwareOut(m);
    },
    warn: function(m){
        lib.System.drawBack();
        console.warn(colour.xterm(202).bgXterm(15)("SI^2 "+lib.System.command({
            osx:  'date "+%I:%M:%S%p" | tr "[:lower:]" "[:upper:]"'
        })+": ")+colour.xterm(0).bgXterm(15)(m));
        lib.System.hardwareOut(m);
    },
    error: function(m){
        lib.System.drawBack();
        console.error(colour.xterm(9).bgXterm(15)("SI^2 "+lib.System.command({
            osx:  'date "+%I:%M:%S%p" | tr "[:lower:]" "[:upper:]"'
        })+": ")+colour.xterm(0).bgXterm(15)(m));
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
        return exec(commands[lib.System.os()], {silent:true}).output.replace("\n", "");
    },
    printHeader: function(){
        lib.System.drawBack();
        console.log(colour.xterm(39).bgXterm(15)(" ".repeat((colour.width/2)-(("SI^2 running on "+System.os()).length/2))+("SI^2 running on "+System.os())));
    },
    initialise: function(){
        lib.System.clear();
        process.stdout.write(colour.moveTo(0, 0));
        lib.System.printHeader()
        // Array Remove - By John Resig (MIT Licensed)
        Array.prototype.remove = function(from, to) {
            var rest = this.slice((to || from) + 1 || this.length);
            this.length = from < 0 ? this.length + from : from;
            return this.push.apply(this, rest);
        };
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
            res.sendFile(__dirname + resDir);
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
    connect: function(port, host, callback){
        lib.Network.client = net.connect(port, host, function(){
            lib.System.print("Server connection established.");
            lib.Network.connectionEvent = callback;
            callback(lib.Network.client);
        });
    },
    host: function(port, callback){
        lib.Network.sockets = [];
        lib.Network.server = net.createServer(callback);
        lib.Network.server.listen(port, function(){
            var Address = lib.Network.server.address();
            lib.System.print("Server is running on port "+Address.port+" at "+Address.ip);
        });
    },
    events: {},
    registerEvent: function(eventID, callback){
        Network.events[eventID] = callback;
    },
    event: function(event, Socket){
        if (event.ID){
            if (Network.events[event.ID]){
                Network.events[event.ID](event, Socket);
            } else {
                System.warn("No events with the ID "+event.ID+" were found.");
            }
        } else {
            System.warn("Event did not identify itself.");
        }
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
    key: "d045e7340fba903f3905d5671530a1ad",
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