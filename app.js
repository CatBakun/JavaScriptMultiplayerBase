var
	gameport 		= process.env.PORT || 4005,

	io				= require('socket.io'),
	express			= require('express'),
	UUID			= require('node-uuid'),

	verbose			= false,
	http			= require('http'),
	app				= express(),
	server			= http.createServer(app);
	
	require('./game.js');

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

var game = new Game();

sio.configure(function (){
	sio.set('log level', 0);
	sio.set('authorization', function (handshakeData, callback) {
	  callback(null, true); // error first callback style
	});
});


/**
 * Cuando un cliente pega en el servidor por primera vez*/
sio.sockets.on('connection', function (client) {
	
	/** Abstraccion de jugador. Uno por cliente */
	var p = { 
		/** Identificador */
		id: client.id,
		/** La posicion se determina en el servidor y se informa al cliente */
		pos: {
			x: Math.floor(Math.random() * 200),
			y: Math.floor(Math.random() * 200)
		}
	}
	
	/** Se agrega al objeto jugador en el hash de jugadores */
	game.players[p.id] = new Player(p);
	
	/** Se manda al cliente su posicion y su UUID y el estado relevante
	 * de los demas jugadores en el hash de jugadores. */
	client.emit('onconnected', { 
		player: p,
		players: game.players
	});
	
	/** Se le avisa a los demas jugadores que un nuevo jugador ha ingresado
	 * al juego */
	client.broadcast.emit("addPlayer", p);
	
	/** Se asocia a este cliente con un evento capturar sus mensajes */
	client.on("sendMessage", function(messageID, messageData){
		console.log("recieveMessage", this.id, messageID, messageData);
		sio.sockets.emit("recieveMessage", this.id, messageID, messageData);
		game.handleMessage(this.id, messageID, messageData);
	});
	
	/** Cuando un jugador se desconecta se maneja la desconeccion y se 
	 * le avisa a los demas de la desconeccion para que la manejen */
	client.on('disconnect', function(){
		console.log("disconnect", client.id);
		sio.sockets.emit('playerDisconnected', client.id);
		delete game.players[client.id];
	});
	
}); /** End on connection */


