const WS_PORT = 8443; //make sure this matches the port for the webscokets server

var localUuid;
var localDisplayName;
var localStream;
var serverConnection;
var peerConnections = {}; // key is uuid, values are peer connection object and user defined display name string
var connectedUsers=[];
var creatorId;
var reoteVideoCount=1;

//Variables



//variables
var peerConnectionConfig = {
  'iceServers': [
   // { 'urls': 'stun:stun.stunprotocol.org:3478' },
   {
    url: 'turn:numb.viagenie.ca',
	 credential: 'muazkh',
	 username: 'webrtc@live.com'
},
    { 'urls': 'stun:stun.l.google.com:19302' },
  ]
};
function createPage()
{
  
  var loginBtn = document.querySelector('#loginBtn'); 
  var JoinButton = document.querySelector('#JoinButton'); 
  var startmeeting = document.querySelector('#startmeeting'); 
  var startmeeting1 = document.querySelector('#startmeeting1'); 
  var  joinMeeting= document.querySelector('#joinMeeting'); 
  var hangUpBtn = document.querySelector('#hangUpBtn');
  var createMeetingPage=document.querySelector('#createMeetingPage'); 
  var joinPage=document.querySelector('#joinPage'); 
  var videos=document.querySelector('#videos'); 
  var muteMyself=document.querySelector('#muteMyself');
  var pauseMyVideo = document.querySelector("#pauseMyVideo");
  var joiningId=document.querySelector("#joiningId");


  var adminArray=[];
  var i;
  console.log("This is the start voidep button ",startmeeting1)
//newly added code
  loginPage.style.display = "block";
  createMeetingPage.style.display = "none";
    joinPage.style.display = "none";
  //videos.style.display="none";
    loginBtn.addEventListener("click", function () { 
    creatorId=Math.floor(Math.random() * 10000000) + 1;
      
    console.log("This is the radome id created",creatorId);
    document.getElementById("demo1").innerHTML = creatorId;

  //adding new code 
  loginPage.style.display = "none";
  createMeetingPage.style.display = "block";
  joinPage.style.display = "none";


  //adding new code
    
  });

  //Mute Functionality
  muteMyself.addEventListener('click', function(){
    console.log("muting/unmuting myself");
    localStream.getTracks().forEach((t) => {
  
      if (t.kind === 'audio')
      {  
        console.log("The value of T.Enabled is at end ",t.enabled);
        console.log('Came Into T block');
      if( t.enabled)
      {
        console.log("Came into if ")
        muteMyself.innerHTML = "Unmute" 
      }
      else {
        console.log("Came into else ")
        muteMyself.innerHTML = "Mute Myself" 
        }
        t.enabled = !t.enabled;
        console.log("The value of T.Enabled is at end ",t.enabled);
      }
  })
  
  });
  
  //video pausing 
    pauseMyVideo.addEventListener('click', function(){
      console.log("muting/unmuting myself");
      localStream.getTracks().forEach((t) => {
    
        if (t.kind === 'video')
        {  
          console.log("The value of T.Enabled is at end ",t.enabled);
          console.log('Came Into T block');
        if( t.enabled)
        {
          console.log("Came into if ")
          pauseMyVideo.innerHTML = "Start Video"; 
        }
        else {
          console.log("Came into else ")
          pauseMyVideo.innerHTML = "Pause Video";
          }
          t.enabled = !t.enabled;
          console.log("The value of T.Enabled is at end ",t.enabled);
        }
    })
    
    });
    
    //Code For Screen Share
//hang up 
hangUpBtn.addEventListener("click", function () { 
  console.log("Hitted HangupButton");
  window.open('your current page URL', '_self', '');
  window.close();

});

  startmeeting1.addEventListener("click", function () { 
  
    //Newly added code
    console.log("Came into start viodeo button");
 
     loginPage.style.display = "none";
     //Newly Added Code
     joinPage.style.display = "none";
     createMeetingPage.style.display = "none"
     //code to removi div
      // Removes an element from the document
      var element1 = document.getElementById("loginPage");
      var element2 = document.getElementById("createMeetingPage");
      var element3 = document.getElementById("joinPage");
      element1.remove()
      element2.remove();
  
      element3.remove();
     start(creatorId,"StartMeeting");
 
   });

   joinMeeting.addEventListener("click", function () { 
   
    loginPage.style.display = "none";
    //Newly added code
    createMeetingPage.style.display = "none";
    joinPage.style.display = "block";
  });
  JoinButton.addEventListener("click", function () { 
    var x = document.getElementById("usernameInput").value;
    console.log("This is the value of join id",x);
    //creatorId=x;
    loginPage.style.display = "none";

    //Newly added code
    createMeetingPage.style.display = "none";
    joinPage.style.display = "none";
    //Newly added code

    //code to remove elements
    var element1 = document.getElementById("loginPage");
    var element2 = document.getElementById("createMeetingPage");
    var element3 = document.getElementById("joinPage");
    element1.remove()
    element2.remove();

    element3.remove();
    start(x,"JoinButton");
  });

}
function start(creatorId1,fromWhere) {
  //Code Variable For Muting 
  document.getElementById("joiningId").innerHTML = "Meeting id"+"\n"+
  creatorId1;

 console.log("This is the value of creatorId1 from strt function",creatorId1);
 console.log("It came from ",fromWhere);

  localUuid = createUUID();

  var urlParams = new URLSearchParams(window.location.search);
  localDisplayName = urlParams.get('displayName') || prompt('Enter your name', '');


  document.getElementById('localVideoContainer').appendChild(makeLabel(localDisplayName));
 //code to redirect to videos page
 //
  // specify no audio for user media
  var constraints = {
    video: {
      width: {max: 320},
      height: {max: 240},
      frameRate: {max: 30},
    },
    audio:true
  };

  // set up local video stream
  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia(constraints)
      .then(stream => {
        localStream = stream;
        document.getElementById('localVideo').srcObject = stream;
      }).catch(errorHandler)
      // set up websocket and message all existing clients
      .then(() => {
        console.log("This the window.location.hostname ",window.location.hostname);
        serverConnection = new WebSocket('wss://' + window.location.hostname + ':' + WS_PORT+'/'+creatorId1);
        //serverConnection = new WebSocket('wss://' + '192.168.0.3'+ ':' + WS_PORT);

        serverConnection.onmessage = gotMessageFromServer;
        if(fromWhere=='StartMeeting'){

        serverConnection.onopen = event => {
          serverConnection.send(JSON.stringify({ 'displayName': localDisplayName, 'uuid': localUuid, 'dest': 'all' ,'joinid':creatorId1,"admin":'admin'}));
        }
      }
      else
      {
          serverConnection.onopen = event => {
          serverConnection.send(JSON.stringify({ 'displayName': localDisplayName, 'uuid': localUuid, 'dest': 'all' ,'joinid':creatorId1,"admin":'no'}));
        }
      }
      }).catch(errorHandler);
   
  } else {
    alert('Your browser does not support getUserMedia API');
  }
}

function gotMessageFromServer(message) {

  var signal = JSON.parse(message.data);
  console.log("Message from server is ",signal);
  var peerUuid = signal.uuid;
  var creatorId1=signal.joinid;
  var adminid=signal.adminid;

  console.log("This is the createId1 from got message from server function",creatorId1);
  console.log("This is the admin id  ",adminid);

  // Ignore messages that are not for us or from ourselves
  if (peerUuid == localUuid || (signal.dest != localUuid && signal.dest != 'all'))
  { 

    console.log("Came in first ever if statement");
    return;
  }

  if (signal.displayName && signal.dest == 'all') {
    console.log("Came in second if statemenr ever if statement",signal.displayName);

    // set up peer connection object for a newcomer peer
    setUpPeer(peerUuid, signal.displayName);
    serverConnection.send(JSON.stringify({ 'displayName': localDisplayName, 'uuid': localUuid, 'dest': peerUuid,'joinid':creatorId1,'admin':'no' }));

  } else if (signal.displayName && signal.dest == localUuid) {
    // initiate call if we are the newcomer peer
    console.log("Came into call initiator if statemtnt",signal.displayName,"locaal UUID is ",localUuid);
    if(signal.joinid==adminid){
    setUpPeer(peerUuid, signal.displayName, true);
    }

  } else if (signal.sdp) {
    peerConnections[peerUuid].pc.setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(function () {
      // Only create answers in response to offers
      if (signal.sdp.type == 'offer') {
        peerConnections[peerUuid].pc.createAnswer().then(description => createdDescription(description, peerUuid)).catch(errorHandler);
      }
    }).catch(errorHandler);

  } else if (signal.ice) {
    peerConnections[peerUuid].pc.addIceCandidate(new RTCIceCandidate(signal.ice)).catch(errorHandler);
  }
}

function setUpPeer(peerUuid, displayName, initCall = false) {
  peerConnections[peerUuid] = { 'displayName': displayName, 'pc': new RTCPeerConnection(peerConnectionConfig) };

  
  //Code For Muting 
  peerConnections[peerUuid].pc.onicecandidate = event => gotIceCandidate(event, peerUuid);
  peerConnections[peerUuid].pc.onaddstream = event => gotRemoteStream(event, peerUuid);
  peerConnections[peerUuid].pc.ontrack = event => gotRemoteStream1(event, peerUuid);

  peerConnections[peerUuid].pc.oniceconnectionstatechange = event => checkPeerDisconnect(event, peerUuid);
  peerConnections[peerUuid].pc.addStream(localStream);
  if (initCall) {
    peerConnections[peerUuid].pc.createOffer().then(description => createdDescription(description, peerUuid)).catch(errorHandler);
  }
}

function gotIceCandidate(event, peerUuid) {
  if (event.candidate != null) {
    serverConnection.send(JSON.stringify({ 'ice': event.candidate, 'uuid': localUuid, 'dest': peerUuid }));
  }
}

function createdDescription(description, peerUuid) {
  console.log(`got description, peer ${peerUuid}`);
  peerConnections[peerUuid].pc.setLocalDescription(description).then(function () {
    serverConnection.send(JSON.stringify({ 'sdp': peerConnections[peerUuid].pc.localDescription, 'uuid': localUuid, 'dest': peerUuid }));
  }).catch(errorHandler);
}

function gotRemoteStream(event, peerUuid) {
  
  console.log(`got remote stream, peer ${peerUuid}`);
  //assign stream to new HTML video element
  var vidElement = document.createElement('video');
  vidElement.setAttribute('autoplay', '');
  vidElement.setAttribute('muted', '');
  //vidElement.srcObject = event.streams[0];
  vidElement.srcObject = event.stream;


  var vidContainer = document.createElement('div');
  vidContainer.setAttribute('id', 'remoteVideo_' + peerUuid);
  vidContainer.setAttribute('class', 'videoContainer');
  vidContainer.appendChild(vidElement);
  vidContainer.appendChild(makeLabel(peerConnections[peerUuid].displayName));

  document.getElementById('videos').appendChild(vidContainer);

  updateLayout();
}
//Function To Add Steaam 
function gotRemoteStream1(event, peerUuid) {
  
  console.log(`got remote streaddddddddddddddddddddddddddddddddddddm, peer ${peerUuid}`);
  //assign stream to new HTML video element

}
function checkPeerDisconnect(event, peerUuid) {
  var state = peerConnections[peerUuid].pc.iceConnectionState;
  console.log(`connection with peer ${peerUuid} ${state}`);
  if (state === "failed" || state === "closed" || state === "disconnected") {
    delete peerConnections[peerUuid];
    document.getElementById('videos').removeChild(document.getElementById('remoteVideo_' + peerUuid));
    updateLayout();
  }
}

function updateLayout() {
  // update CSS grid based on number of diplayed videos
  var rowHeight = '98vh';
  var colWidth = '98vw';
  var rowOrCol='row';
  var gridtemplate='auto'
  var mobRowHeight= '50vh';
  var mobColWidth='100%';
  var numVideos = Object.keys(peerConnections).length + 1; // add one to include local video
  if (numVideos > 1 && numVideos <= 2) { // 2x2 grid
    rowHeight = '48vh';
    colWidth = '48vw';
    rowOrCol='row';
    gridtemplate='auto'
    mobRowHeight= '50vh';
    mobColWidth='100%'
  }

  else if (numVideos > 2 && numVideos <= 4) { // 2x2 grid
    rowHeight = '48vh';
    colWidth = '48vw';
    rowOrCol='row';
    gridtemplate='repeat(auto-fit, minmax(var(--colWidth), 1fr))'
   // mobRowHeight= '50vh';
   // mobColWidth='100%'
    mobRowHeight= '48vh';
    mobColWidth='48vw'


  } else if (numVideos > 4) { // 3x3 grid
    rowHeight = '32vh';
    colWidth = '32vw';
    rowOrCol='row';
    gridtemplate='repeat(auto-fit, minmax(var(--colWidth), 1fr))'
    mobRowHeight= '50vh';
    mobColWidth='100%'
  }

  document.documentElement.style.setProperty(`--rowHeight`, rowHeight);
  document.documentElement.style.setProperty(`--colWidth`, colWidth);
  document.documentElement.style.setProperty(`--rowOrCol`, rowOrCol);
  document.documentElement.style.setProperty(`--gridtemplate`, gridtemplate);
  document.documentElement.style.setProperty(`--mobRowHeight`, mobRowHeight);
  document.documentElement.style.setProperty(`--mobColWidth`, mobColWidth);

}

function makeLabel(label) {
  var vidLabel = document.createElement('div');
  vidLabel.appendChild(document.createTextNode(label));
  vidLabel.setAttribute('class', 'videoLabel');
  return vidLabel;
}

function errorHandler(error) {
  console.log(error);
}

// Taken from http://stackoverflow.com/a/105074/515584
// Strictly speaking, it's not a real UUID, but it gets the job done here
function createUUID() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }

  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}
