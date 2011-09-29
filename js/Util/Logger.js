BenAlt.Logger = function () {
	var debug = true;
		 
	function _log (message){
		if (debug==false) {return;}
		if (console && console.log) {
			console.log(message);
		}
	};
	
	return {
		init : function() {
			this.log("BenAlt.Logger.init");
		}
		
		log : function(message){
			_log(message);
		}
	};
}();


