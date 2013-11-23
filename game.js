var Player = function(settings){
	this.pos = settings.pos;
	this.width = this.height = 20;
	this.UUID = settings.UUID;
	this.ctx = settings.ctx;
}

Player.prototype.draw = function(){
	this.ctx.drawRect(this.pos.x, this.pos.y, this.width, this.height);
}

var Game = function(settings){
	
	this.players = settings.players || {};
	this.viewport = settings.viewport;
	
	this.ctx = this.viewport.getContext("2d");
	
	this.world = {
		width: 200,
		height: 200
	}
	
	var socket = this.socket = io.connect();
	socket.on('connect', function(){
		console.log('Socket connection established');
	});
	
	socket.on('onconnected', function(data){
		this.players = {};
		for(var p in data.players){
			this.players[data.players[p].UUID] = new Player(data.players[p]);
		} 
		this.players[data.player.UUID] = new Player(data.player);
		this.me = this.players[data.player.UUID];
		console.log(this.players);
	}.bind(this));
	
	socket.on('inputRecivied', this.inputRecivied.bind(this) );
	socket.on('addPlayer', this.addPlayer.bind(this));
	
	window.addEventListener("keypress", this.onKeyPress.bind(this));
}

Game.prototype.addPlayer = function(player){
	console.log("Player connected: ", player);
	this.players[player.UUID] = new Player(player);
} 

Game.prototype.inputRecivied = function(playerUUID, eventType, eventData){
	var p = this.players[playerUUID];
	if(eventData == 119) p.pos.y -= 1; //UP
	if(eventData == 115) p.pos.y += 1; //DOWN
	if(eventData == 97) p.pos.x -= 1;  //LEFT
	if(eventData == 100) p.pos.x += 1; //RIGHT
}

Game.prototype.sendInput = function(playerUUID, eventType, eventData){
	this.socket.emit('sendInput', playerUUID, eventType, eventData);
}

Game.prototype.onKeyPress = function(e){
	this.sendInput(this.me.UUID, "keypress", e.keyCode);
}

Game.prototype.loop = null;
Game.prototype.loop = function(){
	this.ctx.fillStyle="#FFF";
	this.ctx.fillRect(0, 0, this.world.width, this.world.height);
	this.ctx.fillStyle="#FF0000";
	for(var i in this.players){
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
	game = new Game({
		viewport: viewport
	});
	game.loop();
}
