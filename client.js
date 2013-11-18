(function(){
	
	var socket = io.connect();
	socket.on('connect', function(){
		console.log('Socket connection established');
	});
	
	socket.on('onconnected', function(data){
		console.log("Player created: ", data)
	})
	
	socket.on('onmessage', function(data){
		var handler = data[0];
		
		switch( handler ){
			case 'ig' : (function(settings){
				console.log('Initializing game', settings)
			})({
				role : data[1]
			})
		}
	});
	
	socket.emit('message', 'Hello server', "cat");
	
})();


