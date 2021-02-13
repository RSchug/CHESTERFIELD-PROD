// S11B Find the related parent of the given record type and copy the given ASI from the parent to the given ASI in the current cap.
function copyASIfromParent(childCapID,parentRecordType,childASISubGrpfldNm,parentASISubGrpfldNm){
	try{
		
		pCapID = getRelatedParentCap(childCapID, parentRecordType);
		
		if(pCapID==null){
			logDebug("Method name: copyASIfromParent. Error: Parent capID is missing. childCapID:" + childCapID);
			return false;
		}
		
		//aa.print("pCapID:" + pCapID);
		// split it by '-'
		capArr=pCapID.toString().split("-");
		
		// get parent capID
		var getCapResult = aa.cap.getCapID(capArr[0],capArr[1],capArr[2]);
		if (getCapResult.getSuccess()) {
			var prntCapId = getCapResult.getOutput();
		}else{
			logDebug("Method name: copyASIfromParent. Message: Error: Can't get the parent cap." + pCapID);
			return false;
		}
		
		// get the given asi field's value from parent cap
		fldVal = getAppSpecific(parentASISubGrpfldNm,prntCapId);
		if(fldVal==null){
			logDebug("Method name: copyASIfromParent. Error: childASISubGrpfldNm is null. parentASISubGrpfldNm:" + parentASISubGrpfldNm);
			return false;
		}			
		//aa.print("fldVal:" + fldVal);
		
		//update given child field from parent
		editAppSpecific(childASISubGrpfldNm,fldVal,childCapID);
		
		return true;
	}catch(err){
		logDebug("Method name: copyASIfromParent. Message: Error-" + err.message + ". CapID:" + childCapID);
		return false;
	}
}
