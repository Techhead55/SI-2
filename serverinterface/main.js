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
        setUser: function(ID){
            Interface.makeRequest({
                ID: "get",
                key: ID
            }, function(Event, Socket){
                $("#students_and_staff_info_name")[0].value = Event.Contents.doc.name;
                $("#students_and_staff_info_name")[0].setAttribute("referer", ID);
                $("#students_and_staff_info_name_item_delete")[0].setAttribute("referer", ID);
                $("#students_and_staff_icon")[0].setAttribute("action", "upload?ID="+ID);
                $("#students_and_staff_icon_actual")[0].style.backgroundImage = "url(/image?ID="+ID+")";
                $("#students_and_staff_icon_actual")[0].setAttribute("onchange", "("+function(){
                    $("#students_and_staff_icon")[0].submit();
                }.toString()+")();");
                $("#student_and_teacher_content")[0].style.visibility = "visible";
            })
        },
        setEvent: function(ID){
            Interface.makeRequest({
                ID: "get",
                key: ID
            }, function(GetEvent, GetSocket){
                $("#classes_and_events_info_name")[0].value = GetEvent.Contents.doc.name;
                $("#classes_and_events_info_name")[0].setAttribute("referer", ID);
                $("#classes_and_events_info_roomID")[0].value = GetEvent.Contents.doc.roomID;
                $("#classes_and_events_info_roomID")[0].setAttribute("referer", ID);
                $("#classes_and_events_info_whens")[0].innerHTML = "When: ";
                GetEvent.Contents.doc.time.forEach(function(e, i, a){
                    e = {
                        start: {
                            hour: (e.start.hour+"").length === 1 ? "0"+e.start.hour : e.start.hour+"",
                            minute: (e.start.minute+"").length === 1 ? "0"+e.start.minute : e.start.minute+""
                        },
                        finish: {
                            hour: (e.finish.hour+"").length === 1 ? "0"+e.finish.hour : e.finish.hour+"",
                            minute: (e.finish.minute+"").length === 1 ? "0"+e.finish.minute : e.finish.minute+""
                        }
                    }
                    var start = document.createElement("input"),
                        finish = document.createElement("input"),
                        spacer = document.createElement("span"),
                        ender = document.createElement("span");
                    start.type = "time";
                    finish.type = "time";
                    start.setAttribute("value", e.start.hour+":"+e.start.minute+":00");
                    finish.setAttribute("value", e.finish.hour+":"+e.finish.minute+":00");
                    start.setAttribute("referer", ID+"-"+i+"-start");
                    finish.setAttribute("referer", ID+"-"+i+"-finish");
                    var updateFunc = "("+function(self){
                        Interface.makeRequest({
                            ID: "get",
                            key: self.getAttribute("referer").split("-")[0]
                        }, function(WhenEvent, WhenSocket){
                            WhenEvent.Contents.doc.time[self.getAttribute("referer").split("-")[1]][self.getAttribute("referer").split("-")[2]] = {
                                day: WhenEvent.Contents.doc.time[self.getAttribute("referer").split("-")[1]][self.getAttribute("referer").split("-")[2]].day,
                                hour: parseInt(self.value.split(":")[0]), 
                                minute: parseInt(self.value.split(":")[1])
                            };
                            WhenSocket.emit("data", {
                                ID: "set",
                                Contents: {
                                    key: self.getAttribute("referer").split("-")[0],
                                    doc: WhenEvent.Contents.doc
                                }
                            });
                            (function(){
                                var head = arguments[0]+"_";
                                for (var argument in arguments){
                                    if (argument !== "0") document.getElementById(head+arguments[argument]).innerHTML = "";
                                }
                            })("classes_and_events_cal", "monday", "tuesday", "wednesday", "thursday", "friday");
                            WhenEvent.Contents.doc.time.forEach(function(e, i, a){
                                var calcolum = document.getElementById("classes_and_events_cal_"+e.start.day),
                                    calitem = document.createElement("div");
                                calcolum.innerHTML = "";
                                calitem.setAttribute("class", "calendar_item red");
                                calitem.innerHTML = (e.start.hour>12? e.start.hour-12 : e.start.hour)+":"+e.start.minute+" to "+(e.finish.hour>12? e.finish.hour-12 : e.finish.hour)+":"+e.finish.minute;
                                calitem.style.top = ((((e.start.hour+1)*40)+(e.start.minute*(40/60)))-20)+"px";
                                calitem.style.height = (((((e.finish.hour)*60)+e.finish.minute) - (((e.start.hour)*60)+e.start.minute)) * (40/60))+"px";
                                calitem.style.lineHeight = (((((e.finish.hour)*60)+e.finish.minute) - (((e.start.hour)*60)+e.start.minute)) * (40/60))+"px";
                                $("#eventCalendar_contents")[0].scrollTop = $("#eventCalendar_contents")[0].scrollHeight/3;
                                calcolum.appendChild(calitem);
                            });
                        });
                    }.toString()+")(this)";
                    start.setAttribute("onclick", updateFunc);
                    finish.setAttribute("onclick", updateFunc);
                    spacer.innerHTML = " to ";
                    ender.innerHTML = ", ";
                    $("#classes_and_events_info_whens")[0].appendChild(start);
                    $("#classes_and_events_info_whens")[0].appendChild(spacer);
                    $("#classes_and_events_info_whens")[0].appendChild(finish);
                    $("#classes_and_events_info_whens")[0].appendChild(ender);
                });
                console.log(GetEvent.Contents.doc.time);
                $("#classes_and_events_info_whens")[0].setAttribute("referer", ID);
                $("#classes_and_events_info_whens")[0].innerHTML += '<div class="mini_circle blue" id="classes_and_events_info_whens_plus">+</div>&nbsp;&nbsp;<div class="mini_circle red" id="classes_and_events_info_whens_minus">-</div>';
                $("#classes_and_events_icon")[0].setAttribute("action", "upload?ID="+ID);
                $("#classes_and_events_icon_actual")[0].style.backgroundImage = "url(/image?ID="+ID+")";
                $("#classes_and_events_icon_actual")[0].setAttribute("onchange", "("+function(){
                    $("#classes_and_events_icon")[0].submit();
                }.toString()+")();");
                $("#classes_and_events_info_attendees")[0].innerHTML = "Attendees: ";
                GetEvent.Contents.doc.attendees.forEach(function(e, i, a){
                    Interface.makeRequest({
                        ID: "get",
                        key: e
                    }, function(UserEvent, UserSocket){
                        var user = document.createElement("a");
                        user.innerHTML = UserEvent.Contents.doc.name;
                        user.setAttribute("href", "javascript:("+function(ID){
                            Interface.setUser(ID);
                            Interface.setMenu("users");
                        }.toString()+")('"+UserEvent.Contents.key+"')");
                        $("#classes_and_events_info_attendees")[0].appendChild(user);
                        $("#classes_and_events_info_attendees")[0].innerHTML += ", ";
                    });
                });
                $("#classes_and_events_info_heads")[0].innerHTML = "Head Attendees: ";
                console.log(GetEvent);
                GetEvent.Contents.doc.heads.forEach(function(e, i, a){
                    Interface.makeRequest({
                        ID: "get",
                        key: e
                    }, function(UserEvent, UserSocket){
                        var user = document.createElement("a");
                        user.innerHTML = UserEvent.Contents.doc.name;
                        user.setAttribute("href", "javascript:("+function(ID){
                            Interface.setUser(ID);
                            Interface.setMenu("users");
                        }.toString()+")('"+UserEvent.Contents.key+"')");
                        $("#classes_and_events_info_heads")[0].appendChild(user);
                        $("#classes_and_events_info_heads")[0].innerHTML += ", ";
                    });
                });
                (function(){
                    var head = arguments[0]+"_";
                    for (var argument in arguments){
                        if (argument !== "0") document.getElementById(head+arguments[argument]).innerHTML = "";
                    }
                })("classes_and_events_cal", "monday", "tuesday", "wednesday", "thursday", "friday");
                GetEvent.Contents.doc.time.forEach(function(e, i, a){
                    var calcolum = document.getElementById("classes_and_events_cal_"+e.start.day),
                        calitem = document.createElement("div");
                    calcolum.innerHTML = "";
                    calitem.setAttribute("class", "calendar_item red");
                    calitem.innerHTML = (e.start.hour>12? e.start.hour-12 : e.start.hour)+":"+e.start.minute+" to "+(e.finish.hour>12? e.finish.hour-12 : e.finish.hour)+":"+e.finish.minute;
                    calitem.style.top = ((((e.start.hour+1)*40)+(e.start.minute*(40/60)))-20)+"px";
                    calitem.style.height = (((((e.finish.hour)*60)+e.finish.minute) - (((e.start.hour)*60)+e.start.minute)) * (40/60))+"px";
                    calitem.style.lineHeight = (((((e.finish.hour)*60)+e.finish.minute) - (((e.start.hour)*60)+e.start.minute)) * (40/60))+"px";
                    $("#eventCalendar_contents")[0].scrollTop = $("#eventCalendar_contents")[0].scrollHeight/3;
                    calcolum.appendChild(calitem);
                });
            });
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
        refreshEventsAndClasses: function(){
            Interface.makeRequest({
                ID: "findPairs",
                Contents: "event"
            }, function(Event, Socket){
                for (var event in Event.Contents){
                    console.log(event);
                    var container = document.getElementById(Event.Contents[event].val.type+"List"),
                        element = document.createElement("div");
                    element.setAttribute("id", Event.Contents[event].key);
                    element.setAttribute("class", "menu_sidebar_list_element");
                    element.innerHTML = Event.Contents[event].val.name;
                    element.setAttribute("onclick", "("+function(ID){
                        Interface.setEvent(ID);
                    }.toString()+")('"+Event.Contents[event].key+"');");
                    container.appendChild(element);
                }
            });
        },
        toggleElementList: function(elementIDArray, selectedElementID){
            for (var element in elementIDArray){
                document.getElementById(elementIDArray[element]).style.display = "none";
                document.getElementById(elementIDArray[element]+"_Selector").style.backgroundColor = "#FFF";
            }
            document.getElementById(selectedElementID).style.display = "inherit";
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
                        height: ""+(height/(minimized.length+1))
                    },  {duration: 700, queue: false });
                }
                $(maximised).animate({
                    height: ""+(height/(minimized.length+1))
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
        Interface.setMenu(Interface.getURLParam("menu"));
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
        $("#Server_Console")[0].scrollTop = $("#Server_Console")[0].scrollHeight;
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
    $("#classList_add")[0].onclick = function(){
        Interface.makeRequest({
            ID: "hash"
        }, function(Event, Socket){
            Socket.emit("data", {
                ID: "set", 
                Contents: {
                    key: "event_"+Event.Contents, 
                    doc: {
                        name: "New Class",
                        type: "class",
                        roomID: "",
                        heads: [],
                        attendees: [],
                        time: []
                    }
                }
            });
            var container = document.getElementById("classList"),
                element = document.createElement("div");
            element.setAttribute("id", Event.Contents);
            element.setAttribute("class", "menu_sidebar_list_element");
            element.innerHTML = "New Class";
            element.setAttribute("onclick", "("+function(ID){
                console.log(ID);
                Interface.setEvent(ID);
            }.toString()+")('event_"+Event.Contents+"');");
            container.appendChild(element);
        });
    };
    $("#eventList_add")[0].onclick = function(){
        
    };
    $("#classes_and_events_info_name").change(function(){
        Interface.makeRequest({
            ID: "get",
            key: $("#classes_and_events_info_name")[0].getAttribute("referer")
        }, function(Event, Socket){
            Event.Contents.doc.name = $("#classes_and_events_info_name")[0].value;
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
    Interface.refreshEventsAndClasses();
    setInterval(function(){
        Interface.makeRequest({
            ID: "Uptime"
        }, function(Event, Socket){
            $("#Server_Uptime")[0].innerHTML = Math.round((Event.Contents/60))+"m "+(Event.Contents%60)+"s";
        });
    }, 1000);
    window.onresize = function(){
        document.getElementById("container").style.left =
            (-(window.innerWidth*Interface.getURLParam("state")))+"px";
    };
};