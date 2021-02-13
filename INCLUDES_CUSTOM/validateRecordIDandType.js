//S17 - In ACA or in AA the parent parent id could be added as ASI field so that the record can be related to its parent.
// validateRecordIDandType("16PA0001","Planning/LandUse/ZoningCase/NA")
function validateRecordIDandType(capID,recordType){
	try{
		// get the capID
		var getCapResult = aa.cap.getCapID(capID);
		if (getCapResult.getSuccess()) {
			var pCapId = getCapResult.getOutput();
		}else{
			return false;
		}
		
		// get the cap object
		var pCap = aa.cap.getCap(pCapId).getOutput(); // Cap object
		var appTypeResult = pCap.getCapType();
		var appTypeString = appTypeResult.toString();
		
		//aa.print("appTypeString:" + appTypeString);
		//aa.print("recordType:" + recordType);
		//check to see if types are equal		
		if(!recordType.toUpperCase().equals(appTypeString.toUpperCase())){
			return false;
		}
		return true;
	}catch(err){
		logDebug("Method name: validateRecordIDandType. Message: Error-" + err.message + ". CapID:" + capID);
		return false;
	}
}
