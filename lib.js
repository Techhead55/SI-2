String.prototype.repeat = function(num){
    return new Array(Math.round(num)+1).join(this);
}
var lib = {},
    fs = require('fs-extra'),
    colour = require('cli-color'),
    readline = require('readline'),
    express = require('express'),
    HTTP = require('http'), 
    os = require('os'),
    socketIO = require("socket.io"),
    jFive = require("johnny-five"),
    net = require("net"),
    CryptoJS = require('./CryptoJS.js'),
    hat = require('hat'),
    dirty = require('dirty'),
    busboy = require('connect-busboy'),
    path = require('path');
require('shelljs/global');
lib.System = {
    hardwareOut: function(){},
    IMLUE: function(m){
        
    },
    writtenLog: [],
    drawBack: function (){
        console.log(colour.bgXterm(15)(" ").repeat(colour.width-1));
        process.stdout.write(colour.move(0, -1));
    },
    print: function(m){
        var stamp = "SI^2 "+lib.System.command({
            osx:  'date "+%I:%M:%S%p" | tr "[:lower:]" "[:upper:]"',
            linux:  'date "+%I:%M:%S%p"'
        })+": ";
        lib.System.writtenLog.push(stamp+"[INFO] "+m);
        lib.System.drawBack();
        console.warn(colour.xterm(40).bgXterm(15)(stamp)+colour.xterm(0).bgXterm(15)(m));
        lib.System.hardwareOut(m);
        lib.System.IMLUE(stamp+"[INFO] "+m);
    },
    warn: function(m){
        var stamp = "SI^2 "+lib.System.command({
            osx:  'date "+%I:%M:%S%p" | tr "[:lower:]" "[:upper:]"'
        })+": ";
        lib.System.writtenLog.push(stamp+"[WARN] "+m);
        lib.System.drawBack();
        console.warn(colour.xterm(202).bgXterm(15)(stamp)+colour.xterm(0).bgXterm(15)(m));
        lib.System.hardwareOut(m);
        lib.System.IMLUE(stamp+"[WARN] "+m);
    },
    error: function(m){
        var stamp = "SI^2 "+lib.System.command({
            osx:  'date "+%I:%M:%S%p" | tr "[:lower:]" "[:upper:]"'
        })+": ";
        lib.System.writtenLog.push(stamp+"[ERROR] "+m);
        lib.System.drawBack();
        console.warn(colour.xterm(9).bgXterm(15)(stamp)+colour.xterm(0).bgXterm(15)(m));
        lib.System.hardwareOut(m);
        lib.System.IMLUE(stamp+"[ERROR] "+m);
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
    }
};
lib.MicroController = {
    jFive: jFive,
    initialise: function(){
        if (System.os() === "windows") lib.MicroController.Board = new jFive.Board({port:"COM3"});
        if (System.os() === "linux" || System.os() === "osx") lib.MicroController.Board = new jFive.Board({});
        lib.MicroController.Board.debug = false;
    }
};
lib.Interface = {
    sockets: [],
    registerRequestHandler: function(reqDir, resDir){
        lib.System.print("Interface request handler registered: "+reqDir+" --> "+resDir);
        lib.Interface.application.get(reqDir, function(req, res){
            lib.System.print("Interface served request: "+reqDir+" --> "+resDir);
            res.sendFile(__dirname + resDir);
        });
    },
    initialise: function(port, securityCode){
        lib.Interface.application = express();
        lib.Interface.server = HTTP.createServer(lib.Interface.application);
        lib.Interface.server.listen(port);
        lib.Interface.application.use(busboy());
        lib.Interface.application.route('/upload').post(function (req, res, next) {
            var fstream;
            req.pipe(req.busboy);
            req.busboy.on('file', function (fieldname, file, filename) {
                lib.System.print("Interface uploading file " + filename+" as "+req.query.ID+".");
                fstream = fs.createWriteStream(__dirname + '/filebase/' + req.query.ID);
                file.pipe(fstream);
                fstream.on('close', function () {    
                    lib.System.print("Upload Finished of " + filename); 
                    res.redirect('back');
                });
            });
        });
        lib.System.print("Interface listening on port "+port+", with the security code "+securityCode);
        lib.Interface.coms = socketIO.listen(lib.Interface.server, {log: false});
        lib.System.print("Interface coms have been initiated.");
        //lib.Interface.coms.origins("localhost:"+port);
        lib.Interface.port = port;
        lib.System.print("Coms are locked to port "+port);
    },
    events: {},
    registerEvent: function(eventID, callback){
        lib.Interface.events[eventID] = callback;
        System.print("Interface coms event registered: "+eventID);
    },
    event: function(event, Socket){
        System.print("Received interface event");
        if (event.ID){
            if (lib.Interface.events[event.ID]){
                lib.Interface.events[event.ID](event, Socket);
                System.print("Interface event identified as "+event.ID);
            } else {
                System.warn("No interface events with the ID "+event.ID+" were found.");
            }
        } else {
            System.warn("Interface event did not identify itself.");
        }
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
        System.print("Network coms event registered: "+eventID);
    },
    event: function(event, Socket){
        System.print("Received server event.");
        if (event.ID){
            if (lib.Network.events[event.ID]){
                lib.Network.events[event.ID](event, Socket);
                System.print("Server event identified as "+event.ID);
            } else {
                System.warn("No server events with the ID "+event.ID+" were found.");
            }
        } else {
            System.warn("Server event did not identify itself.");
        }
    },
    makeRequest: function(request, callback){
        request.referer = Math.floor(Math.random() * 550000) + 100;
        Network.registerEvent("response:"+request.referer, function(Event, Socket){
            callback(Event, Socket);
        });
        Network.emit(request);
    },
    emit: function(contents){
        lib.System.print("Client emited event, with the contents "+contents+" to the server");
        lib.Network.client.write(JSON.stringify(contents));
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
    store: {},
    initialise: function(filePath, callback){
        if (arguments.length>0){
            lib.Database.store = dirty('data.db');
        } else {
            lib.Database.store = dirty();
        }
        lib.Database.set = function(key, val){
            lib.Database.store.set(key, val);
            lib.Statistics.Entries = lib.Database.entries();
        };
        lib.Database.get = function(key){
            lib.Database.store.get(key);
        };
        lib.Database.end = function(){
            lib.Database.store.close();
        };
        lib.Database.forEach = function(callback){
            lib.Database.store.forEach(callback);
        };
        lib.Database.backup = function(){
            
        };
        lib.Database.store.on('error', function(err) {
            System.warn(err);
        });
    },
    findPairs: function(keyType){
        var pairs=[];
        lib.Database.store.forEach(function(key, value){
            if (key.indexOf(keyType)===0) pairs.push({key: key, val: value})
        });
        return pairs;
    },
    find: function (keyValue){
        var pairs=[],
            propName;
        for (i in keyValue){
            propName = i;
            break;
        }
        lib.Database.store.forEach(function(key, value){
            for (point in value){
                if (point===propName && value[point]===keyValue[propName]) 
                    pairs.push({key: key, val: value});
            }
        });
        return pairs;
    },
    entries: function(){
        var entries=0;
        lib.Database.store.forEach(function(){
            entries += 1;
        });
        return entries;
    }
};
lib.Statistics = {
    Interfaces: 0,
    Entries: 0,
    update: function(){}
};
lib.initialise = function(){
    for (i in lib) if (i !== "initialise") GLOBAL[i] = lib[i];
};
exports.lib = lib;
GLOBAL.jFive = jFive;