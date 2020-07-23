var solace = require("solclientjs");

///////// MODIFY THESE TO YOUR ENVIRONMENT /////////
const url = "ws://localhost:8008";
const vpn = "default";
const user= "default";
const pass= "default";
const topicStr = "topic/string";
const nmsgs = 1000;
////////////////////////////////////////////////////



// Initialize factory with the most recent API defaults
var factoryProps = new solace.SolclientFactoryProperties();
factoryProps.profile = solace.SolclientFactoryProfiles.version10;
solace.SolclientFactory.init(factoryProps);

var sprops = new solace.SessionProperties();
sprops.reapplySubscriptions = true;
sprops.userName = user;
sprops.password = pass;
sprops.vpnName = vpn;
sprops.url = url;

const topic = solace.SolclientFactory.createTopic(topicStr);


function randi(max) {
    return Math.floor((Math.random() * max));
}
function randf(maxf) {
    return Math.random()*maxf;
}

function randomTick() {
    const syms = ["AAPL", "GOOG", "AMZN", "FB", "NFLX", "MSFT"];
    const basepx = [386.9, 1566.84, 3097.0, 241.11, 486.50, 209.37];
    const i = randi(syms.length);
    const delta = randf(0.05);
    const spread= 0.002;
    return {
        "sym" : syms[i],
        "bidpx": basepx[i]*delta,
        "bidsz": 100 + randi(100),
        "askpx": basepx[i]*delta + (basepx[i]*spread),
        "asksz": 100 + randi(100),
        "lastpx":0,
        "lastsz":0
    }
}

function sendMessage(curr, total) {
    var message = solace.SolclientFactory.createMessage();
    message.setDestination(topic);
    const tick = randomTick();
    // TODO: SET THE PAYLOAD
    message.setBinaryAttachment( JSON.stringify(tick) );
    session.send(message);
    console.log("Message " + curr + " of " + total + " sent.");
}

var session = solace.SolclientFactory.createSession(sprops,
    new solace.MessageRxCBInfo(function (s, m) { console.log("RECV");}, this),
    new solace.SessionEventCBInfo(function (session, event) {
        console.log(event.toString());
        if (event.sessionEventCode === solace.SessionEventCode.UP_NOTICE) {
            // Set a time interval for sending messages so they don't arrive all at once
            var baseTime = 1000;
            for (var i = 1; i <= nmsgs; i++) {
                setTimeout(sendMessage, baseTime * i, i, nmsgs);
            }
            // Disconnect from appliance after messages have been sent
            setTimeout(function () {
                session.dispose();
            }, baseTime * (nmsgs + 1));
        }
    }, this));
    
session.connect();
