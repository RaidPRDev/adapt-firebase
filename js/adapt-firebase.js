define('extensions/adapt-firebase/js/adapt-firebase',
    ['require','coreJS/adapt',
        'coreJS/libraries/underscore.min.js',
        '../libraries/firebase.js'],
    function(require) {

    var Adapt = require('coreJS/adapt');

    // Listen to when the data is all loaded
    Adapt.on('app:dataReady', onPreFirebaseInitialize);

    function onPostRemove() {
        console.log("onPostRemove()");
    }

    function onAdaptPagePreRender() {
        console.log("onAdaptPagePreRender()");
        console.log("=> firebase:", Adapt.firebase);

        if (Adapt.firebase !== null)
        {
            Adapt.trigger("firebase:signedin", {
                success: true,
                user: Adapt.firebase.user
            });
        }
    }

    function onPreFirebaseInitialize()
    {
        console.log("onPreFirebaseInitialize()");

        // check if FB exists and is enabled
        var firebaseConfig = Adapt.course.get("_firebase");

        if (firebaseConfig) {
            if (!firebaseConfig._isEnabled) {
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
        console.log("onInitializeFirebase()");

        Adapt.firebase = new FirebaseApplication();
        Adapt.firebase.initializeApp();
    }

    /*
    To protect your project from abuse, Firebase limits the number of new email/password and anonymous
    sign-ups that your application can have from the same IP address in a short period of time.
    You can request and schedule temporary changes to this quota from the Firebase console
     */

    let FirebaseApplication = Backbone.View.extend({

        config: {
            apiKey: "",
            authDomain: "",
            databaseURL: "",
            projectId: "",
            storageBucket: "",
            messagingSenderId: ""
        },

        api: null,
        database: null,
        user: null,
        userLocation: "Somewhere",
        LDAP: "LDAP",

        initializeApp: function() {

            this.api = firebase;

            console.log("Firebase.Ext.initializeApp().version:", this.api.SDK_VERSION);

            this.api.initializeApp(this.config);
            this.authorizeAnonymousUser();
        },

        authorizeAnonymousUser: function() {

            this.initializeAnonymousEvents();
            this.setAnonymousAuthPersistence();
        },

        onRemoveAuthStateChanged:undefined,
        onSetAuthPersistenceSuccessEvent:undefined,
        onSetAuthPersistenceErrorEvent:undefined,
        onAnonymousAuthStateChangedEvent:undefined,

        initializeAnonymousEvents: function() {

            this.removeAnonymousEvents();

            if (this.onSetAuthPersistenceSuccessEvent === undefined)
                this.onSetAuthPersistenceSuccessEvent = _.bind(this.onSetAuthPersistenceSuccess, this);

            if (this.onSetAuthPersistenceErrorEvent === undefined)
                this.onSetAuthPersistenceErrorEvent = _.bind(this.onSetAuthPersistenceError, this);

            if (this.onAnonymousAuthStateChangedEvent === undefined)
                this.onAnonymousAuthStateChangedEvent = _.bind(this.onAnonymousAuthStateChanged, this);

        },

        removeAnonymousEvents: function() {

            console.log("Firebase.Ext.resetEvents()");

            this.onSetAuthPersistenceSuccessEvent = undefined;
            this.onSetAuthPersistenceErrorEvent = undefined;
            this.onAnonymousAuthStateChangedEvent = undefined;
        },

        setAnonymousAuthPersistence: function() {

            console.log("Firebase.Ext.setAnonymousAuthPersistence()");

            // SESSION: Existing and future Auth states are now persisted in the current
            // session only. Closing the window would clear any existing state even
            // if a user forgets to sign out.
            this.api.auth().setPersistence(this.api.auth.Auth.Persistence.SESSION)
                .then(this.onSetAuthPersistenceSuccessEvent)
                .catch(this.onSetAuthPersistenceErrorEvent);
        },

        onSetAuthPersistenceSuccess: function() {

            console.log("Firebase.Ext.onSetAuthPersistenceSuccess()");

            return this.api.auth().onAuthStateChanged(this.onAnonymousAuthStateChangedEvent);
        },

        onSetAuthPersistenceError: function(error) {

            console.log("Firebase.Ext.onSetAuthPersistenceError().error:", error);

            Adapt.trigger("firebase:signedin", {
                success:false,
                error: error
            });
        },

        onAnonymousAuthStateChanged: function(user) {

            console.log("Firebase.Ext.onAnonymousAuthStateChanged()");

            if (user) {
                console.log("=> uid:", user.uid, ", isAnonymous:", user.isAnonymous);

                this.initializeUserDatabase(user);

                Adapt.trigger("firebase:signedin", {
                    success: true,
                    user: user
                });

            } else {
                // User is not signed in, sign in anonymously.
                console.error("Firebase.Ext.user is not signed in");
                this.signInAnonymously();
            }
        },

        signInAnonymously: function(onSucess, onError) {

            console.log("Firebase.Ext.signInAnonymously()");

            if (onSucess === undefined) onSucess = _.bind(this.onSignedInAnonymouslySuccess, this);
            if (onError === undefined) onError = _.bind(this.onSignInAnonymouslyError, this);

            this.api.auth().signInAnonymously()
                .then(onSucess)
                .catch(onError);

        },

        onSignedInAnonymouslySuccess: function(userInfo) {

            console.log("Firebase.Ext.onSignedInAnonymouslySuccess()");
            console.log("=> uid:", userInfo.uid, ", isAnonymous:", userInfo.isAnonymous);

            this.initializeUserDatabase(userInfo);
        },

        onSignInAnonymouslyError: function(error) {
            console.log("Firebase.onSignInAnonymouslyError()", error);
            console.log("=> code:", error.code, ", message:", error.message);
        },

        initializeUserDatabase: function(userInfo) {
            console.log("Firebase.Ext.initializeUserDatabase()");

            this.database = this.api.database();
            this.user = userInfo;
            const updateUserToDatabase = this.database.ref('user_anonymous/' + this.user.uid).set({
                uid: this.user.uid,
                date: Date.now()
            });
        }
    });


});