module.exports = function(core){
	core.on('admit', function(action, callback){
		if(action.role === "guest") return callback(new Error('ERR_NOT_ALLOWED'));
		if(action.role === "owner") return callback();
		else if(action.role === "moderator" && action.victim.invitedRole !== "owner" && action.victim.invitedRole !=="moderator") return callback();
		if(action.role === "follower" && action.victim.role === "registered" && action.room.params.authorizer.openFollow) return callback();
		if(action.role !== "gagged" || action.role !=="banned" || action.role !== "registered" || action.role !== "guest"){
			if(action.victim.requestedRole === action.role) return callback();
			else{
				action.victim.invitedRole = action.role;
				return callback();
			}
		}
		return callback(new Error('ERR_NOT_ALLOWED'));
	});
	
	core.on('expel', function(action, callback){
		if(action.role === "guest") return callback(new Error('ERR_NOT_ALLOWED'));
		if(action.role === "owner") return callback();
		else if(action.role === "moderator" && action.victim.role !== "moderator" && action.victim.role !== "owner") { return callback(); }
		return callback(new Error('ERR_NOT_ALLOWED'));
	});
};