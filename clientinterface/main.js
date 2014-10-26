window.onload = function(){
    window.Interface = {
        coms: io.connect(),
        URLParams: {
            state: 0
        },
        states: {
            general: $("#container_general")[0],
            alert: $("#container_special")[0]
        },
        getURLParam: function getParam(key){
            var val = window.location.search.split(/[&?]+/).slice(1).filter(function(v, i, o){
                if (v.split("=")[0]===key) return v;
            }, this)[0];
            return val ? val.split("=")[1] : null;
        },
        setURLParam: function(key, value){
            Interface.URLParams[key] = value;
            history.pushState(null, null, "?"+(function(){
                var list = [];
                for (URLKey in Interface.URLParams){
                    list.push(URLKey+"="+Interface.URLParams[URLKey]);
                }
                return list.join("&");
            })());
        },
        setState: function(statePosit){
            $("#container").animate({
                left: ""+(-(window.innerWidth*statePosit))
            }, 1000 );
            Interface.setURLParam("state", statePosit)
        },
        events: {},
        registerEvent: function(eventID, callback){
            Interface.events[eventID] = callback;
        },
        event: function(event, Socket){
            console.log("Interface has recieved an event");
            if (event.ID){
                if (Interface.events[event.ID]){
                    Interface.events[event.ID](event, Socket);
                } else {
                    console.log("No server interface events with the ID "+event.ID+" were found.");
                }
            } else {
                console.log("The server interface event did not identify itself.");
            }
        },
        makeRequest: function(request, callback){
            request.referer = Math.floor(Math.random() * 550000) + 100;
            Interface.registerEvent("response:"+request.referer, function(Event, Socket){
                callback(Event, Socket);
            });
            Interface.coms.emit("data", request);
        }
    };
    if (Interface.getURLParam("state")!==null){
        Interface.setState(Interface.getURLParam("state"));
    } else {
        Interface.setState(Interface.URLParams.state)
    }
    Interface.coms.on('data', function(data){
        Interface.event(data, Interface.coms)
    });
    Interface.makeRequest({
        ID: "time"
    }, function(EventTime, SocketTime){
        Interface.makeRequest({
            ID: "temp"
        }, function(EventTemp, SocketTemp){
            document.getElementById("container_general_timeAndTemp").innerHTML = 
                EventTime.Contents.Hour+":"+EventTime.Contents.Minute+EventTime.Contents.Half+" "+EventTemp.Contents.toFixed(1)+"°";
        });
    });
    setInterval(function(){
        Interface.makeRequest({
            ID: "time"
        }, function(EventTime, SocketTime){
            Interface.makeRequest({
                ID: "temp"
            }, function(EventTemp, SocketTemp){
                document.getElementById("container_general_timeAndTemp").innerHTML = 
                    EventTime.Contents.Hour+":"+EventTime.Contents.Minute+EventTime.Contents.Half+" "+EventTemp.Contents.toFixed(1)+"°";
            });
        });
    }, 60000);
    window.onresize = function(){
        document.getElementById("container").style.left =
            (-(window.innerWidth*Interface.URLParams.state))+"px";
    };
};