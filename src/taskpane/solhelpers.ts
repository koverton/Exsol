import * as solace from './solclient';

var sess = null;


export function connectSolace(params: any, onmsg: any, onevt: any): void {
  var factoryProps = new solace.SolclientFactoryProperties();
  factoryProps.logLevel = solace.LogLevel.DEBUG;
  solace.SolclientFactory.init( factoryProps );

  try {
    sess = solace.SolclientFactory.createSession({
            url: params.host,
            userName: params.user,
            vpnName: params.vpn,
            password: params.pass,
            generateReceiveTimestamps: true,
            reapplySubscriptions: true
          },
          new solace.MessageRxCBInfo(onmsg),
          new solace.SessionEventCBInfo(onevt));
    sess.connect();
  }
  catch(error) {
      console.log( JSON.stringify(error) );
  }
}

export function disconnectSolace(): void {
  try {
      sess.disconnect();
  }
  catch(error) {
      console.log( JSON.stringify(error) );
  }
}

export function subscribeSolace(subscription: string): void {
  try {
    var topic = solace.SolclientFactory.createTopic(subscription);
    sess.subscribe( topic, true, subscription, 1000 );
  }
  catch(error) {
      console.log( JSON.stringify(error) );
  }
}

export function getText(msg: any): string {
  var text = null
  var container = msg.getSdtContainer()
  if ( container != null ) {
    text = container.getValue()
  }
  else {
    text = msg.getBinaryAttachment()
  }
  return text;
}


