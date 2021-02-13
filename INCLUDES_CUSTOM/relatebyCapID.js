// S11A Certain record type will have the ID of the parent in the ASI or ASIT. Relate the record to its parent. 
// Sample calls (capId.getCustomID(),parentCapID.getCustomID())- ("20161214-00001","BLD16-00019")
function relatebyCapID(childCapID,parentCapID){
	try{
		// get parent capID
		var getCapResult = aa.cap.getCapID(parentCapID);
		if (getCapResult.getSuccess()) {
			var prntCapId = getCapResult.getOutput();
		}else{
			logDebug("Method name: relatebyCapID. Message: Error: Can't get the parent cap." + parentCapID);
			return false;
		}
					
		// get child capID
		var cgetCapResult = aa.cap.getCapID(childCapID);
		if (cgetCapResult.getSuccess()) {
			var chldCapId = cgetCapResult.getOutput();
		}else{
			logDebug("Method name: relatebyCapID. Message: Error: Can't get the child cap." + childCapID);
			return false;
		}

		// relate caps	
		var result = aa.cap.createAppHierarchy(prntCapId,chldCapId); 
		if (result.getSuccess()){
			logDebug("relatebyCapID: Child application successfully linked. ParentID:" + prntCapId.getCustomID() + " . Child" );
		}else{
			logDebug("relatebyCapID: Could not link applications");
			return false;
		}
		
		return true;
	}catch(err){
		logDebug("Method name: relatebyCapID. Message: Error-" + err.message + ". childCapID:" + childCapID);
		return false;
	}
}
