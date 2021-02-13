// FA check to see if given application condition exists
 function hasAppCondition(capID,pType,pStatus,pDesc,pImpact) {
	try
	{
		var condResult = aa.capCondition.getCapConditions(capID);
		
		if (condResult.getSuccess()){
			var capConds = condResult.getOutput();
		}else{ 
			logMessage("**ERROR: getting cap conditions: " + condResult.getErrorMessage());
			logDebug("**ERROR: getting cap conditions: " + condResult.getErrorMessage());
		}
		
		var cStatus;
		var cDesc;
		var cImpact;
		var condForEmail = "";
		for (cc in capConds) {
			var thisCond = capConds[cc];
			var cStatus = thisCond.getConditionStatus();
			var cDesc = thisCond.getConditionDescription();
			var cPubDisplayMessage = thisCond.getDispPublicDisplayMessage();
			var cImpact = thisCond.getImpactCode();
			var cType = thisCond.getConditionType();
			
			aa.print("cStatus:" + cStatus);
			aa.print("cDesc:" + cDesc);
			
			if (cType.toUpperCase().equals(pType.toUpperCase()) && cDesc.toUpperCase().equals(pDesc.toUpperCase()) && cStatus.toUpperCase().equals(pStatus.toUpperCase()) && cImpact.toUpperCase().equals(pImpact.toUpperCase())){
				return true;
			}
		}
		return false; 
	}catch(err){
		aa.print("Method name: hasAppCondition. Message: Error-" + err.message + ". CapID:" + capID);
		return false;
	}
}
