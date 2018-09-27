define('extensions/adapt-firebase/js/adapt-firebase',['require','coreJS/adapt','../libraries/firebase.js'],function(require) {

    var Adapt = require('coreJS/adapt');
    var fb = require('../libraries/firebase.js');

    // Listen to when the data is all loaded
    Adapt.once('app:dataReady', function() {

        var config = {
            apiKey: "",
            authDomain: "PROJECTID.firebaseapp.com",
            databaseURL: "https://PROJECTID.firebaseio.com",
            projectId: "PROJECTID",
            storageBucket: "PROJECTID.appspot.com",
            messagingSenderId: "12345678910"
        };

        firebase.initializeApp(config);

        Adapt.fb = firebase.database();
        Adapt.email = "email@domain.com";
        Adapt.fullName = makeid();
        Adapt.userLocation = "Somewhere";
        Adapt.userLDAP = "LDAP";
    });

    function makeid() {
        var cookie = getCookie("userid");

        if(cookie) return cookie;

        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 16; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        setCookie("userid", text, 5);

        return text;
    }

    function getCookie(name) {
        match = document.cookie.match(new RegExp(name + '=([^;]+)'));
        if (match) return match[1];
    }

    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        var expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

});