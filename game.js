Player = function(settings){
	this.pos = settings.pos;
	this.width = this.height = 20;
	this.id = settings.id;
	this.color = "#000"
}

Game = function(settings){
	
	this.players = settings? settings.players : {};
}

Game.prototype.handleMessage = function(playerId, messageId, messageData){
	this.messagesHandler[messageId].bind(this)(playerId, messageData);
}

Game.prototype.messagesHandler = {};
Game.prototype.messagesHandler.keypress = function(playerId, keyData){
	var p = this.players[playerId];
	if(keyData == 119) p.pos.y -= 2; //UP
	if(keyData == 115) p.pos.y += 2; //DOWN
	if(keyData == 97) p.pos.x -= 2;  //LEFT
	if(keyData == 100) p.pos.x += 2; //RIGHT
}

Game.prototype.messagesHandler.changeColor = function(playerId, colorData){
	console.log(playerId, colorData);
	this.players[playerId].color = colorData;
}
