BenAlt.Control = function(){ // GENERIC MESSAGE BASED CONTROLLER
	return {
		init : function() {
			BenAlt.Logger.log("BenAlt.Proxy.init");
			
			for (var _compName in this) {
				var comp = this[_compName];
				if (comp && comp.init) {comp.init();}
			}
			
		}
	}
}();