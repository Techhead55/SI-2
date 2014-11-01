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
        getAllURLParam: function (){
            return window.location.search.split(/[&?]+/).slice(1);
        },
        getURLParam: function (key){
            var val = window.location.search.split(/[&?]+/).slice(1).filter(function(v, i, o){
                if (v.split("=")[0]===key) return v;
            }, this)[0];
            return val ? val.split("=")[1] : null;
        },
        setURLParam: function(key, value){
            var list = Interface.getAllURLParam().filter(function(v, i, o){
                return v.split("=")[0]===key ? false : true;
            });
            list.push(key+"="+value);
            history.pushState(null, null, "?"+list.join("&"));
        },
        setState: function(statePosit){
            $("#container").animate({
                left: ""+(-(window.innerWidth*statePosit))
            }, 1000 );
            Interface.setURLParam("state", statePosit)
        },
        setMenu: function(selectedElementID){
            console.log(selectedElementID);
            var elementIDArray = [
                'container_menu_users', 
                'container_menu_events', 
                'container_menu_interfaces', 
                'container_menu_facilities', 
                'container_menu_server'
            ];
            for (var element in elementIDArray){
                document.getElementById(elementIDArray[element]).style.visibility = "hidden";
            }
            console.log(selectedElementID);
            document.getElementById('container_menu_'+selectedElementID).style.visibility = "visible";
            Interface.setURLParam("menu", selectedElementID);
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
            document.getElementById("studentList").innerHTML = "";
            document.getElementById("teacherList").innerHTML = "";
            document.getElementById("groupList").innerHTML = "";
            Interface.makeRequest({
                ID: "findPairs",
                Contents: "user"
            }, function(Event, Socket){
                for (var user in Event.Contents){
                    var container = document.getElementById(Event.Contents[user].val.type+"List"),
                        element = document.createElement("div");
                    element.setAttribute("id", Event.Contents[user].key);
                    element.setAttribute("class", "menu_sidebar_list_element");
                    element.innerHTML = Event.Contents[user].val.name;
                    element.setAttribute("onclick", "("+function(ID){
                        Interface.makeRequest({
                            ID: "get",
                            key: ID
                        }, function(GetEvent, GetSocket){
                            console.log(GetEvent, ID);
                            $("#students_and_staff_info_name")[0].value = GetEvent.Contents.doc.name;
                            $("#students_and_staff_info_name")[0].setAttribute("referer", ID);
                            $("#students_and_staff_info_name_item_delete")[0].setAttribute("referer", ID);
                            $("#students_and_staff_icon")[0].setAttribute("action", "upload?ID="+ID);
                            $("#students_and_staff_icon_actual")[0].style.backgroundImage = "url(/image?ID="+ID+")";
                            $("#students_and_staff_icon_actual")[0].setAttribute("onchange", "("+function(){
                                $("#students_and_staff_icon")[0].submit();
                            }.toString()+")();");
                            $("#student_and_teacher_content")[0].style.visibility = "visible";
                        });
                    }.toString()+")('"+Event.Contents[user].key+"');");
                    container.appendChild(element);
                }
            });
            Interface.makeRequest({
                ID: "findPairs",
                Contents: "group"
            }, function(Event, Socket){
                for (var group in Event.Contents){
                    var container = document.getElementById("groupList"),
                        element = document.createElement("div");
                    element.setAttribute("id", Event.Contents[group].key);
                    element.setAttribute("class", "menu_sidebar_list_element");
                    element.innerHTML = Event.Contents[group].val.name;
                    element.setAttribute("onclick", "("+function(ID){
                        Interface.makeRequest({
                            ID: "get",
                            key: ID
                        }, function(GetEvent, GetSocket){
                            console.log(GetEvent, ID);
                            $("#students_and_staff_info_name")[0].value = GetEvent.Contents.doc.name;
                            $("#students_and_staff_info_name")[0].setAttribute("referer", ID);
                            $("#students_and_staff_info_name_item_delete")[0].setAttribute("referer", ID);
                            $("#students_and_staff_icon")[0].setAttribute("action", "upload?ID="+ID);
                            $("#students_and_staff_icon_actual")[0].style.backgroundImage = "url(/image?ID="+ID+")";
                            $("#students_and_staff_icon_actual")[0].setAttribute("onchange", "("+function(){
                                $("#students_and_staff_icon")[0].submit();
                            }.toString()+")();");
                            $("#student_and_teacher_content")[0].style.visibility = "visible";
                        });
                    }.toString()+")('"+Event.Contents[group].key+"');");
                    container.appendChild(element);
                }
            });
        },
        toggleElementList: function(elementIDArray, selectedElementID){
            for (var element in elementIDArray){
                document.getElementById(elementIDArray[element]).style.opacity = "0";
                document.getElementById(elementIDArray[element]+"_Selector").style.backgroundColor = "#FFF";
            }
            document.getElementById(selectedElementID).style.opacity = "1";
            document.getElementById(selectedElementID+"_Selector").style.backgroundColor = "#e3e3e3";
        },
        mixElementWidth: function(height, headerHeight, minimized, maximised){
            for (var element in minimized){
                height -= headerHeight;
            }
            if ($(maximised).height()===height){
                for (var element in minimized){
                    height += headerHeight;
                }
                for (var element in minimized){
                    $(minimized[element]).animate({
                        height: ""+(height/3)
                    },  {duration: 700, queue: false });
                }
                $(maximised).animate({
                    height: ""+(height/3)
                }, {duration: 700, queue: false });
            } else {
                for (var element in minimized){
                    $(minimized[element]).animate({
                        height: ""+headerHeight
                    },  {duration: 700, queue: false });
                }
                $(maximised).animate({
                    height: ""+height
                }, {duration: 700, queue: false });
            }
            window.onresize = function(){
                for (var element in minimized){
                    $(minimized[element]).animate({
                        height: ""+headerHeight
                    },  {duration: 700, queue: false });
                }
                $(maximised).animate({
                    height: ""+height
                }, {duration: 700, queue: false });
            };
        }
    };
    if (Interface.getURLParam("state")!==null){
        Interface.setState(Interface.getURLParam("state"));
    }
    if (Interface.getURLParam("menu")!==null){
        Interface.setMenu([
            'container_menu_users', 
            'container_menu_events', 
            'container_menu_interfaces', 
            'container_menu_facilities', 
            'container_menu_server'
        ], 'container_menu_'+Interface.getURLParam("menu"));
    }
    Interface.states.splash.onclick = function(){
        Interface.setState(1);
    };
    Interface.coms.on('connect', function(){
        console.log("Connected to host.")
        $(".menu_header_status").text("CONNECTED").css("color", function(index){
            return "#BDF271";
        });
    });
    Interface.coms.on('disconnect', function(){
        window.open('','_self',''); 
        window.close();
        $(".menu_header_status").text("NOT CONNECTED").css("color", function(index){
            return "#E74C3C";
        });
    });
    Interface.coms.on('data', function(data){
        Interface.event(data, Interface.coms)
    });
    Interface.makeRequest({
        ID: "Console Message Repository",
        Contents: "user"
    }, function(Event, Socket){
        for (var message in Event.Contents){
            $("#Server_Console").append("<div class='menu_contents_lineElement'>"+Event.Contents[message]+"</div>");
        }
    });
    Interface.makeRequest({
        ID: "Initial Statistics",
        Contents: "user"
    }, function(Event, Socket){
        $("#Connected_Interfaces")[0].innerHTML = Event.Contents.Interfaces;
        $("#Data_Entries")[0].innerHTML = Event.Contents.Data_Entries;
    });
    Interface.registerEvent("Console Message", function(Event, Socket){
        $("#Server_Console").append("<div class='menu_contents_lineElement'>"+Event.Message+"</div>");
    });
    Interface.registerEvent("Statistics Update", function(Event, Socket){
        $("#Connected_Interfaces")[0].innerHTML = Event.Contents.Interfaces;
        $("#Data_Entries")[0].innerHTML = Event.Contents.Data_Entries;
    });
    $("#studentList_add")[0].onclick = function(){
        Interface.makeRequest({
            ID: "hash"
        }, function(Event, Socket){
            Socket.emit("data", {
                ID: "set", 
                Contents: {
                    key: "user_"+Event.Contents, 
                    doc: {
                        name: "New Student", 
                        type: "student"
                    }
                }
            });
            var container = document.getElementById("studentList"),
                element = document.createElement("div");
            element.setAttribute("id", "user_"+Event.Contents);
            element.setAttribute("class", "menu_sidebar_list_element");
            element.innerHTML = "New Student";
            element.setAttribute("onclick", "("+function(ID){
                Interface.makeRequest({
                    ID: "get",
                    key: ID
                }, function(GetEvent, GetSocket){
                    console.log(GetEvent, ID);
                    $("#students_and_staff_info_name")[0].value = GetEvent.Contents.doc.name;
                    $("#students_and_staff_info_name")[0].setAttribute("referer", ID);
                    $("#students_and_staff_info_name_item_delete")[0].setAttribute("referer", ID);
                    $("#students_and_staff_icon")[0].setAttribute("action", "upload?ID="+ID);
                    $("#students_and_staff_icon_actual")[0].style.backgroundImage = "url(/image?ID="+ID+")";
                    $("#students_and_staff_icon_actual")[0].setAttribute("onchange", "("+function(){
                        $("#students_and_staff_icon")[0].submit();
                    }.toString()+")();");
                    $("#student_and_teacher_content")[0].style.visibility = "visible";
                });
            }.toString()+")('user_"+Event.Contents+"');");
            container.appendChild(element);
            container.scrollTop = container.scrollHeight;
        });
    };
    $("#teacherList_add")[0].onclick = function(){
        Interface.makeRequest({
            ID: "hash"
        }, function(Event, Socket){
            Socket.emit("data", {
                ID: "set", 
                Contents: {
                    key: "user_"+Event.Contents, 
                    doc: {
                        name: "New Teacher", 
                        type: "teacher"
                    }
                }
            });
            var container = document.getElementById("teacherList"),
                element = document.createElement("div");
            element.setAttribute("id", "user_"+Event.Contents);
            element.setAttribute("class", "menu_sidebar_list_element");
            element.innerHTML = "New Teacher";
            element.setAttribute("onclick", "("+function(ID){
                Interface.makeRequest({
                    ID: "get",
                    key: ID
                }, function(GetEvent, GetSocket){
                    console.log(GetEvent, ID);
                    $("#students_and_staff_info_name")[0].value = GetEvent.Contents.doc.name;
                    $("#students_and_staff_info_name")[0].setAttribute("referer", ID);
                    $("#students_and_staff_info_name_item_delete")[0].setAttribute("referer", ID);
                    $("#students_and_staff_icon")[0].setAttribute("action", "upload?ID="+ID);
                    $("#students_and_staff_icon_actual")[0].style.backgroundImage = "url(/image?ID="+ID+")";
                    $("#students_and_staff_icon_actual")[0].setAttribute("onchange", "("+function(){
                        $("#students_and_staff_icon")[0].submit();
                    }.toString()+")();");
                    $("#student_and_teacher_content")[0].style.visibility = "visible";
                });
            }.toString()+")('user_"+Event.Contents+"');");
            container.appendChild(element);
            container.scrollTop = container.scrollHeight;
        });
    };
    $("#groupList_add")[0].onclick = function(){
        Interface.makeRequest({
            ID: "hash"
        }, function(Event, Socket){
            Socket.emit("data", {
                ID: "set", 
                Contents: {
                    key: "group_"+Event.Contents, 
                    doc: {
                        name: "New Group"
                    }
                }
            });
            var container = document.getElementById("groupList"),
                element = document.createElement("div");
            element.setAttribute("id", "group_"+Event.Contents);
            element.setAttribute("class", "menu_sidebar_list_element");
            element.innerHTML = "New Group";
            element.setAttribute("onclick", "("+function(ID){
                Interface.makeRequest({
                    ID: "get",
                    key: ID
                }, function(GetEvent, GetSocket){
                    console.log(GetEvent, ID);
                    $("#students_and_staff_info_name")[0].value = GetEvent.Contents.doc.name;
                    $("#students_and_staff_info_name")[0].setAttribute("referer", ID);
                    $("#students_and_staff_info_name_item_delete")[0].setAttribute("referer", ID);
                    $("#students_and_staff_icon")[0].setAttribute("action", "upload?ID="+ID);
                    $("#students_and_staff_icon_actual")[0].style.backgroundImage = "url(/image?ID="+ID+")";
                    $("#students_and_staff_icon_actual")[0].setAttribute("onchange", "("+function(){
                        $("#students_and_staff_icon")[0].submit();
                    }.toString()+")();");
                    $("#student_and_teacher_content")[0].style.visibility = "visible";
                });
            }.toString()+")('group_"+Event.Contents+"');");
            container.appendChild(element);
            container.scrollTop = container.scrollHeight;
        });
    };
    $("#students_and_staff_info_name").change(function(){
        Interface.makeRequest({
            ID: "get",
            key: $("#students_and_staff_info_name")[0].getAttribute("referer")
        }, function(Event, Socket){
            Event.Contents.doc.name = $("#students_and_staff_info_name")[0].value;
            document.getElementById(Event.Contents.key).innerHTML = Event.Contents.doc.name;
            Socket.emit("data", {
                ID: "set", 
                Contents: {
                    key: Event.Contents.key, 
                    doc: Event.Contents.doc
                }
            });
        });
    });
    $("#students_and_staff_info_name_item_delete").click(function(){
        Interface.coms.emit("data", {
            ID: "remove",
            Contents: $("#students_and_staff_info_name_item_delete")[0].getAttribute("referer")
        });
        $("#"+$("#students_and_staff_info_name_item_delete")[0].getAttribute("referer")).parentNode.removeChild(
            $("#"+$("#students_and_staff_info_name_item_delete")[0].getAttribute("referer"))
        );
    });
    $("#Server_Shutdown").click(function(){
        Interface.coms.emit("data", {
            ID: "Shutdown"
        });
        window.close();
        Interface.setState(0);
    });
    $("#Server_Restart")[0].onclick = function(){
        Interface.coms.emit("data", {
            ID: "Restart"
        });
        window.close();
        Interface.setState(0);
    };
    Interface.toggleElementList(['Server_Console', 'Database_Manager'], 'Mission_Control');
    Interface.refreshStudentsAndStaff();
    window.onresize = function(){
        document.getElementById("container").style.left =
            (-(window.innerWidth*Interface.URLParams.state))+"px";
    };
};