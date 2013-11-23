var
	gameport 		= process.env.PORT || 4005,

	io				= require('socket.io'),
	express			= require('express'),
	UUID			= require('node-uuid'),

	verbose			= false,
	http			= require('http'),
	app				= express(),
	server			= http.createServer(app);
	

server.listen(gameport)

app.get( '/', function( req, res ){
	console.log('trying to load %s', __dirname + '/index.html');
	res.sendfile( '/index.html' , { root:__dirname });
});


app.get( '/*' , function( req, res, next ) {

		//This is the current file they have requested
	var file = req.params[0];

		//For debugging, we can track what files are requested.
	if(verbose) console.log('\t :: Express :: file requested : ' + file);

		//Send the requesting client the file.
	res.sendfile( __dirname + '/' + file );

}); //app.get *


var sio = io.listen(server);
var players = {};

sio.configure(function (){
	sio.set('log level', 0);
	sio.set('authorization', function (handshakeData, callback) {
	  callback(null, true); // error first callback style
	});
});

sio.sockets.on('connection', function (client) {
	console.log("Someone got connected: ");
	
	var p = { 
		UUID: UUID(),
		pos: {
			x: Math.floor(Math.random() * 200),
			y: Math.floor(Math.random() * 200)
		}
	}
	
	players[p.UUID] = p;
	
	client.emit('onconnected', { 
		player: p,
		players: players
	});
	
	client.broadcast.emit("addPlayer", p);
	
	client.on("sendInput", function(playerUUID, eventType, eventData){
		console.log('inputSended', playerUUID, eventType, eventData);
		sio.sockets.emit("inputRecivied", playerUUID, eventType, eventData);
	});
})


