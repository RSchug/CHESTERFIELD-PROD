//editted from original 11-2020 to pass the related parent and copy the given ASI from that parent to the given ASI in the current cap.
function copyASIfromParent_TPS(childCapID,parentCapID,childASISubGrpfldNm,parentASISubGrpfldNm){
	try{
		// get the given asi field's value from parent cap
		fldVal = getAppSpecific(parentASISubGrpfldNm,parentCapID);
		if(fldVal==null){
			logDebug("Method name: copyASIfromParent_TPS. Error: parent ASI is null. parentASISubGrpfldNm:" + parentASISubGrpfldNm);
			return false;
		}			
		//update given child field from parent
		editAppSpecific(childASISubGrpfldNm,fldVal,childCapID);
		return true;
	}catch(err){
		logDebug("Method name: copyASIfromParent_TPS. Message: Error-" + err.message + ". CapID:" + childCapID);
		return false;
	}
}