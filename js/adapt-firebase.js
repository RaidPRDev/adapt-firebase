define('extensions/adapt-sr-firebase/js/adapt-sr-firebase',
    ['require','coreJS/adapt',
        '../libraries/firebase.js'],
    function(require) {

    var Adapt = require('coreJS/adapt');
    var fb = require('../libraries/firebase.js');

    // Listen to when the data is all loaded
    Adapt.once('app:dataReady', onPreFirebaseInitialize);

    function onPreFirebaseInitialize()
    {
        // check if FB exists and is enabled
        var firebase = Adapt.course.get("_firebase");

        if (firebase) {
            if (!firebase._isEnabled) {
                console.log("Firebase Disabled");
                return;
            }

            onInitializeFirebase();
        } else {
            onFirebaseStartupError('Firebase Extension not found. Please add "_firebase._isEnabled" to course.json"');
        }
    }

    function onFirebaseStartupError(msg)
    {
        try {
            throw new Error(msg);
        } catch(e) {
            console.error(e.name, e.message);
        }
    }

    function onInitializeFirebase()
    {
        console.log("Firebase.onInitializeFirebase()");

        var config = {
            apiKey: "AIzaSyCBkLa_WqQcanOEcm8YK3CgkYZbqWE463s",
            authDomain: "project-f759d.firebaseapp.com",
            databaseURL: "https://project-f759d.firebaseio.com",
            projectId: "project-f759d",
            storageBucket: "project-f759d.appspot.com",
            messagingSenderId: "92076851953"
        };

        firebase.initializeApp(config);

        firebase.auth().signInAnonymously().catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;

            console.log("errorCode:", errorCode);
            console.log("errorMessage:", errorMessage);

            // ...
        });

        firebase.auth().onAuthStateChanged(function(user) {

            console.log("onAuthStateChanged.user:", user);

            if (user) {
                // User is signed in.
                Adapt.fbIsAnonymous = user.isAnonymous;
                Adapt.fbUID = user.uid;

                // var userRef = firebase.child(firebase.users);
                //var useridRef = userRef.child(firebase.userid);

                console.log("onAuthStateChanged.isAnonymous:", Adapt.fbIsAnonymous);
                console.log("onAuthStateChanged.uid:", Adapt.fbUID);
                //console.log("onAuthStateChanged.userRef:", userRef);
                //console.log("onAuthStateChanged.useridRef:", useridRef);

                /*useridRef.set({
                    locations: "",
                    theme: "",
                    colorScheme: "",
                    food: ""
                });*/

            } else {
                // User is signed out.
                // ...
                console.log("onAuthStateChanged.User is signed out.");
            }
            // ...
        });

        Adapt.fb = firebase.database();
        Adapt.email = "email@domain.com";
        Adapt.fullName = makeFirebaseUniqueId();
        Adapt.userLocation = "Somewhere";
        Adapt.userLDAP = "LDAP";

    }

    function makeFirebaseUniqueId()
    {
        var cookie = getFirebaseCookie("userid");

        console.log("FIREBASE.makeid().cookie:", cookie);

        if(cookie) return cookie;

        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 16; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        setFirebaseCookie("userid", text, 5);

        return text;
    }

    function getFirebaseCookie(name) {
        console.log("FIREBASE.makeid().getCookie:", name);
        match = document.cookie.match(new RegExp(name + '=([^;]+)'));
        if (match) return match[1];
    }

    function setFirebaseCookie(cname, cvalue, exdays) {
        console.log("FIREBASE.makeid().setCookie:", cname, ' ', cvalue, ' ', exdays);
        var d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        var expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

});