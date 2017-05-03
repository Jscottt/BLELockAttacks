/*global cordova, bluetoothSerial, deviceListScreen, unlockScreen, scrim, statusDiv, deviceList, refreshButton, disconnectButton*/

// Bluetooth Low Energy Lock (c) 2014 Don Coleman

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
        deviceListScreen.hidden = true;                      
        unlockScreen.hidden = true;              
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.forms[0].addEventListener('submit', this.unlock, false);    
        
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        deviceList.ontouchstart = app.connect; // assume not scrolling        
        refreshButton.ontouchstart = app.list;
        disconnectButton.onclick = app.disconnect;

        app.list();
    },
    list: function(e) { 
        deviceList.innerHTML = ""; // clear the list 
        app.showProgressIndicator("Scanning for Bluetooth Devices...");        
        bluetoothSerial.list(app.onDeviceList, function() { alert("Listing Bluetooth Devices Failed"); });        
    },
    connect: function (e) {        
        var device = e.target.dataset.deviceId;
        app.showProgressIndicator("Requesting connection to " + device);
        bluetoothSerial.connect(device, app.onConnect, app.onDisconnect);                                    
    },
    disconnect: function (e) {
        if (e) {
            e.preventDefault();
        }

        app.setStatus("Disconnecting...");
        bluetoothSerial.disconnect(function() {
            app.setStatus("Disconnected");
            setTimeout(app.list, 800);
        });        
    },
    onConnect: function() {        
        app.showUnlockScreen();                
        app.setStatus("Connected");
        bluetoothSerial.subscribe("\n", app.onData);
        
        //Generate key
        
        //Form key command
//        var command = "k" + key + "\n";
//        
//        function success() {
//            
//        }
//        
//        function failure (reason) {
//            alert("Error setting up connection " + reason);
//            app.hideProgressIndicator();
//        }
//        
//        //send key command.
//        bluetoothSerial.write(command, success, failure);
        
    },
    onDisconnect: function(reason) {
        if (!reason) { 
            reason = "Connection Lost"; 
        } 
        app.setStatus(reason);
        
        app.hideProgressIndicator();        
    },
    onData: function(data) {
        app.setStatus(data);
        app.hideProgressIndicator();        
    },
//    generateKey:  function (){
//        
//        for (var key=[],i=0;i<16;++i) {
//            key.push(Math.round(Math.random() * 255));
//        }
//        
//        return key;
//    },
    unlock: function(e) {
        //Get code from textview
        var code = e.target.code.value;
        //Key
        var int8key = new Uint8Array([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]);
        //Convert key to String
        var key = String.fromCharCode.apply(null, int8key);
        //encrypt using key
        var ecode = aesEncrypt(code, key);
        //Form command
        var command = "u" + ecode + "\n";

        e.preventDefault();

        if (code === "") { return; } // don't submit an empty form
        app.showProgressIndicator();      
                    
        function success() {
            e.target.code.value = ""; //  clear the input
        }
        
        function failure (reason) {
            alert("Error sending code " + reason);
            app.hideProgressIndicator();                          
        }
        //Send command
        bluetoothSerial.write(command, success, failure); 
    },    
    onDeviceList: function(devices) {
        var listItem, rssi;

        app.showDeviceListPage();
        
        devices.forEach(function(device) {
            console.log(JSON.stringify(device));
            listItem = document.createElement('li');
            listItem.dataset.deviceId = device.id;
            if (device.rssi) {
                rssi = "RSSI: " + device.rssi + "<br/>";
            } else {
                rssi = "";
            }
            listItem.innerHTML = device.name + "<br/>" + rssi + device.id;
            deviceList.appendChild(listItem);
        });

        if (devices.length === 0) {
            
            if (cordova.platformId === "ios") { // BLE
                app.setStatus("No Bluetooth Peripherals Discovered.");
            } else { // Android
                app.setStatus("Please Pair a Bluetooth Device.");
            }

        } else {
            app.setStatus("Found " + devices.length + " device" + (devices.length === 1 ? "." : "s."));
        }
    },
    showProgressIndicator: function(message) {
        if (!message) { message = "Processing"; }
        scrim.firstElementChild.innerHTML = message;        
        scrim.hidden = false;
        statusDiv.innerHTML = "";        
    },
    hideProgressIndicator: function() {
        scrim.hidden = true;        
    },    
    showUnlockScreen: function() {
        unlockScreen.hidden = false;
        deviceListScreen.hidden = true;
        app.hideProgressIndicator();
        statusDiv.innerHTML = "";
    },
    showDeviceListPage: function() {
        unlockScreen.hidden = true;
        deviceListScreen.hidden = false;
        app.hideProgressIndicator();
        statusDiv.innerHTML = "";
    },
    setStatus: function(message){
        console.log(message);
        statusDiv.innerHTML = message;
    }
    
};
