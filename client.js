( function () {

    var lastTime = 0;
    var vendors = [ 'ms', 'moz', 'webkit', 'o' ];

    for ( var x = 0; x < vendors.length && !window.requestAnimationFrame; ++ x ) {
        window.requestAnimationFrame = window[ vendors[ x ] + 'RequestAnimationFrame' ];
        window.cancelAnimationFrame = window[ vendors[ x ] + 'CancelAnimationFrame' ] || window[ vendors[ x ] + 'CancelRequestAnimationFrame' ];
    }

    if ( !window.requestAnimationFrame ) {
        window.requestAnimationFrame = function ( callback, element ) {
            var currTime = Date.now(), timeToCall = Math.max( 0, frame_time - ( currTime - lastTime ) );
            var id = window.setTimeout( function() { callback( currTime + timeToCall ); }, timeToCall );
            lastTime = currTime + timeToCall;
            return id;
        };
    }

    if ( !window.cancelAnimationFrame ) {
        window.cancelAnimationFrame = function ( id ) { clearTimeout( id ); };
    }

}() );


ClientPlayer = function(settings){
	Player.apply(this, settings);
	this.ctx = settings.ctx;
}

ClientPlayer.prototype.draw = function(){
	this.ctx.set
	this.ctx.drawRect(this.pos.x, this.pos.y, this.width, this.height);
}

ClientGame = function(settings){
	Game.call(this, settings);
	
	this.viewport = settings.viewport;
	
	this.world = {
		width: this.viewport.width,
		height: this.viewport.height
	}
	
	this.ctx = this.viewport.getContext("2d");
	
	var socket = this.socket = io.connect();
	socket.on('connect', function(){
		console.log('Socket connection established');
	});
	
	socket.on('onconnected', function(data){
		this.players = {};
		for(var p in data.players){
			this.players[data.players[p].id] = new Player(data.players[p]);
		} 
		this.players[data.player.id] = new Player(data.player);
		this.me = this.players[data.player.id];
	}.bind(this));
	
	socket.on('playerDisconnected', function(playerId){
		delete this.players[playerId];
	}.bind(this));
	
	socket.on('recieveMessage', this.recieveMessage.bind(this));
	socket.on('addPlayer', this.addPlayer.bind(this));
	
	window.addEventListener("keypress", this.onKeyPress.bind(this));
}

ClientGame.prototype = Object.create(Game.prototype);

ClientGame.prototype.addPlayer = function(player){
	this.players[player.id] = new Player(player);
} 

/** Send messages to the server */
ClientGame.prototype.sendMessage = function(messageID, messageData){
	this.socket.emit('sendMessage', messageID, messageData);
}

/** Cuando apretamos una tecla, le enviamos el mensage al servidor, pero
 * no modificamos el estado del juego aun. El callback a esta llamada se
 * maneja en el metodo recieveMessage */ 
ClientGame.prototype.onKeyPress = function(e){
	this.sendMessage("keypress", e.keyCode);
}

ClientGame.prototype.recieveMessage = function(playerId, messageId, messageData){
	this.handleMessage(playerId, messageId, messageData);
}

ClientGame.prototype.loop = null;
ClientGame.prototype.loop = function(){
	this.ctx.fillStyle="#FFF";
	this.ctx.fillRect(0, 0, this.world.width, this.world.height);
	for(var i in this.players){
		this.ctx.fillStyle=this.players[i].color;
		this.ctx.fillRect(
			this.players[i].pos.x,
			this.players[i].pos.y,
			this.players[i].width,
			this.players[i].height
		);
	}
	requestAnimationFrame(this.loop.bind(this));
}

var game = null;
var viewport = null;

function init(){
	viewport = document.getElementById('viewport');
	game = new ClientGame({
		viewport: viewport
	});
	game.loop();
	
	var up = document.getElementById("up")
	
	var keyCodes = {
		'up': 119,
		'down':  115,
		'left': 97,
		'right': 100
	}
	
	for(var key in keyCodes){
		(function(key){
			var btn = document.getElementById(key);
			btn.onclick =  function(){
				game.sendMessage("keypress", keyCodes[key]);
			}
		})(key);
	}
	
	var colorChanger = document.getElementById('change-color');
	
	colorChanger.onclick = function(e){
		game.sendMessage('changeColor', '#'+Math.floor(Math.random()*16777215).toString(16));
	};
	
}
