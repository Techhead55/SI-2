window.onload = function(){
    window.Interface = {
        coms: io.connect(),
        URLParams: {
            state: 0
        },
        states: {
            splash: $("#container_splash"),
            menu: $("#container_menu"),
            menu_elements: $("#container_menu_elements")
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
        }
    };
    if (Interface.getURLParam("state")!==null){
        Interface.setState(Interface.getURLParam("state"));
    } else {
        Interface.setState(Interface.URLParams.state)
    }
    Interface.states.splash.onclick = function(){
        Interface.setState(1);
        console.log("check");
    };
};