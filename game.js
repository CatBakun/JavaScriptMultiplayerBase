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
		console.log("Player created: ", data)
		this.players[data.player.UUID] = new Player(data.player);
		this.me = data.player;
	}.bind(this));
	
	socket.on('inputRecivied', this.inputRecivied );
	socket.on('addPlayer', this.addPlayer);
	
	window.addEventListener("keypress", this.onKeyPress.bind(this))
}

Game.prototype.addPlayer = function(data){
	this.players[data.player.UUID] = data.player;
} 

Game.prototype.inputRecivied = function(data){
	console.log('inputRecivied', data);
}

Game.prototype.sendInput = function(data){
	this.socket.emit('sendInput', data);
}

Game.prototype.onKeyPress = function(e){
	this.sendInput(this.player.UUID, "keypress", e.keyCode);
}

Game.prototype.loop = null;
Game.prototype.loop = function(){
	this.ctx.clearRect(0, 0, this.world.width, this.world.height)
	.rect(this.pos.x, this.pos.y, this.width, this.height);
	requestAnimationFrame(this.loop);
}

var game = null;
var viewport = null;

function init(){
	viewport = document.getElementById('viewport');
	game = new Game({
		viewport: viewport
	});
}
