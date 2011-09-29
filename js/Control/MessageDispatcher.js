BenAlt.Control.MessageDispatcher = function(){ // GENERIC MESSAGE BASED CONTROLLER
	var _messageMappings 	= {};
	
	function selectPage (data) {
		BenAlt.Logger.log("SalsaLabs.Control > selectPage - " + data );
	};
	
	return {
		messages : {
			"PAGE_SELECTED"		: "PAGE_SELECTED"
		},
		
		init : function(){
		
			for (var mes in this.messages) { 
				_messageMappings[mes] = [];
			}
			
			this.map(this.messages.PAGE_SELECTED, selectPage);
		},
		
		map : function(messageName, func){
			if (this.messages[messageName] == undefined) {
				SalsaLabs.Logger.log("SalsaLabs.Control.map : attempting to map to a non-existing message");
				return;
			}
			_messageMappings[messageName].push(func);
		},
		
		notify : function(messageName, data) {
			if (_messageMappings[messageName] == undefined) {
				cSalsaLabs.Logger.log("SalsaLabs.Control.notify : attempting to notify a non-mapped message", messageName);
				return;
			}
			var maps = _messageMappings[messageName],
				data = data || null;
			for (var i = maps.length - 1; i>-1; i--) { 
				maps[i](data);
			}
		}
	}
}();