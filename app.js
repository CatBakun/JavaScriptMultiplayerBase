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
var clients = {length: 0};

sio.configure(function (){
	sio.set('log level', 0);
	sio.set('authorization', function (handshakeData, callback) {
	  callback(null, true); // error first callback style
	});
});

sio.sockets.on('connection', function (client) {
	console.log("Someone got connected: ");

	client.UUID = UUID();
	
	clients[client.UUID] = client;
	
	if(clients.length > 0){
		role = 'c'; /** I'm not the fist client, so i'm not the host, I'm a client */
	}else{
		role = 'h'; /** There is no other client in the game, so I'm the host */
	}
	
	clients.length++;
	
	client.emit('onconnected', { 
		player: { 
			UUID: client.userid,
			pos: {
				x: Math.floor(Math.random() * 200),
				y: Math.floor(Math.random() * 200)
			}
		}
	});
	
	client.on("sendInput", function(data){
		console.log('inputSended', data);
		sio.sockets.emit("inputRecivied", data);
	});
})


