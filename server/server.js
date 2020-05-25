const HTTPS_PORT = 8443; //default port for https is 443
const HTTP_PORT = 8001; //default port for http is 80

const fs = require('fs');
const http = require('http');
const https = require('https');
const WebSocket = require('ws');
// based on examples at https://www.npmjs.com/package/ws 
const WebSocketServer = WebSocket.Server;

// Yes, TLS is required
const serverConfig = {
  //key: fs.readFileSync('key.pem'),
  //cert: fs.readFileSync('cert.pem'),
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert'),
};

// ----------------------------------------------------------------------------------------

// Create a server for the client html page
const handleRequest = function (request, response) {
  // Render the single client html file for any request the HTTP server receives
  console.log('request received: ' + request.url);

 if (request.url === '/webrtc.js') {
    response.writeHead(200, { 'Content-Type': 'application/javascript' });
    response.end(fs.readFileSync('client/webrtc.js'));
  } else if (request.url === '/style.css') {
    response.writeHead(200, { 'Content-Type': 'text/css' });
    response.end(fs.readFileSync('client/style.css'));
  } else {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end(fs.readFileSync('client/index.html'));
  }
};

//const httpsServer = https.createServer(serverConfig, handleRequest);
const httpsServer = https.createServer(handleRequest);

httpsServer.listen(process.env.PORT ||HTTPS_PORT);
/*httpsServer.listen(HTTPS_PORT,'127.0.0.1',function(){
  httpsServer.close(function(){
    httpsServer.listen(HTTPS_PORT,'192.168.43.135')
  })
 });*/


//console.log("This is the httpserver from server",httpsServer);

// ----------------------------------------------------------------------------------------

// Create a server for handling websocket calls
//const wss = new WebSocketServer({ 192.168.0.3: httpsServer });
var creatorIdFromAdmin;
var dataFromAdmin;
const wss = new WebSocketServer({ server: httpsServer });
webSockets = {} // userID: webSocket
var id=0;
var checkForEveryAdmin=0;
var checkForFirstJoinee=0;
var joinidref;
var countForIdArray=[];
countForIdArray.fill(0, 0);
var firstever=0
wss.on('connection', function (ws,req) {
  
  console.log("This is the url",req.url); 
  var temp=req.url;
  var Joiner=temp.substring(1, 8);
  if(firstever==0)
  {
    countForIdArray[Joiner]=1;
    ws.id=countForIdArray[Joiner]+""+Joiner;
    webSockets[ws.id] = ws
    firstever++;
  }
  else 
  {
    countForIdArray[Joiner]++;
    console.log("This is the value of ",countForIdArray[Joiner]);
    var a=countForIdArray[Joiner];
    console.log("This is the value of a ",a);

    if(Number.isNaN(a))
    {
      console.log("came into if statement of NaN")
      countForIdArray[Joiner]=1;

    }
    ws.id=countForIdArray[Joiner]+""+Joiner;
    webSockets[ws.id] = ws
  }
  


  console.log("This is the substring",Joiner);
  
  console.log("This is ws.id",ws.id);
  ws.on('message', function (message) {


    // Broadcast any received message to all clients
    console.log('received: %s', message);
    creatorIdFromAdmin=JSON.parse(message);

    if(creatorIdFromAdmin.admin=='admin'){
      joinidref=creatorIdFromAdmin.joinid;

    dataFromAdmin=creatorIdFromAdmin.joinid;
    var messageCreate=JSON.stringify({
        "displayName": creatorIdFromAdmin.displayName,
        "uuid": creatorIdFromAdmin.uuid,
        "dest": creatorIdFromAdmin.dest,
        "joinid": creatorIdFromAdmin.joinid,
        "admin": creatorIdFromAdmin.admin,
    });

    message=messageCreate;

    }
    else if(creatorIdFromAdmin.admin=="no")
    { 
      ///
      joinidref=creatorIdFromAdmin.joinid;

      console.log("Came into else part of no admin");
     
    var messageCreate=JSON.stringify({
      "displayName": creatorIdFromAdmin.displayName,
      "uuid": creatorIdFromAdmin.uuid,
      "dest": creatorIdFromAdmin.dest,
      "joinid": creatorIdFromAdmin.joinid,
      "admin": creatorIdFromAdmin.admin,
      "adminid":dataFromAdmin
  });
  console.log("Message Created");

     message=messageCreate;
     console.log("Message Created twice");
    }

    for (var i=1; i<= countForIdArray[joinidref]; i++)
    {
      console.log("Value of i",i,"id value",countForIdArray[Joiner])
      if (webSockets[i+""+joinidref].readyState === WebSocket.OPEN)
            webSockets[i+""+joinidref].send(message);
    }
    //wss.broadcast(message);
  });

  ws.on('error', () => ws.terminate());
});


console.log('Server running.'
);

// ----------------------------------------------------------------------------------------

// Separate server to redirect from http to https
/*
http.createServer(function (req, res) {
    console.log(req.headers['host']+req.url);
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen(process.env.PORT||HTTP_PORT); */