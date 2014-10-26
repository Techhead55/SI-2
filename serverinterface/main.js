window.onload = function(){
    window.Interface = {
        coms: io.connect(),
        URLParams: {
            state: 0
        },
        states: {
            splash: $("#container_splash")[0],
            menu: $("#container_menu")[0],
            menu_elements: $("#container_menu_elements")[0]
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
        setMenu: function(menuPosit){
            $("#container_menu_elements").animate({
                top: ""+(-(window.innerHeight*menuPosit))
            }, 1 );
            window.onresize = function(){
                document.getElementById("container").style.left =
                    (-(window.innerWidth*Interface.URLParams.state))+"px";
                document.getElementById("container_menu_elements").style.top =
                    (-(window.innerHeight*menuPosit))+"px";
            };
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
        },
        refreshStudentsAndStaff: function(){
            Interface.makeRequest({
                ID: "findPairs",
                Contents: "user"
            }, function(Event, Socket){
                for (user in Event.Contents){
                    var container = document.getElementById(Event.Contents[user].val.type+"List"),
                        element = document.createElement("div");
                    element.setAttribute("id", Event.Contents[user].key);
                    element.setAttribute("class", "menu_sidebar_list_element");
                    element.innerHTML = Event.Contents[user].val.name;
                    container.appendChild(element);
                }
            });
        },
        toggleElementList: function(elementIDArray, selectedElementID){
            for (var element in elementIDArray){
                document.getElementById(elementIDArray[element]).style.visibility = "hidden";
                document.getElementById(elementIDArray[element]+"_Selector").style.backgroundColor = "#FFF";
            }
            document.getElementById(selectedElementID).style.visibility = "visible";
            document.getElementById(selectedElementID+"_Selector").style.backgroundColor = "#e3e3e3";
        }
    };
    if (Interface.getURLParam("state")!==null){
        Interface.setState(Interface.getURLParam("state"));
    } else {
        Interface.setState(Interface.URLParams.state)
    }
    Interface.states.splash.onclick = function(){
        Interface.setState(1);
    };
    Interface.coms.on('disconnect', function(){
        window.open('','_self',''); 
        window.close();
    });
    Interface.coms.on('data', function(data){
        Interface.event(data, Interface.coms)
    });
    Interface.registerEvent("Console Message", function(Event, Socket){
        $("#Server_Console").append("<div class='menu_contents_lineElement'>"+Event.Message+"</div>");
    });
    Interface.toggleElementList(['Server_Console', 'Database_Manager'], 'Mission_Control');
    Interface.refreshStudentsAndStaff();
    window.onresize = function(){
        document.getElementById("container").style.left =
            (-(window.innerWidth*Interface.URLParams.state))+"px";
    };
};