var BenAlt = function () { // self -initializing namespace, closure protected object.
	// REQUIRES JQUERY
	var _self = {};
	
	function autoInit(){
		for (var _modName in _self) {
			var mod = _self[_modName];
			if (mod.init) {
				mod.init();
			}
		}
		BenAlt.Logger.log("BenAlt > autoInit - finished");
	}
	
	$(document).ready(function(){
		autoInit();
	});
	
	return _self;
}();