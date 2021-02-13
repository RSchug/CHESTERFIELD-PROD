// S2 For each case number in the "related cases" of the Zoning Case Record Type, copy all active Conditions to t he current record.
// Find the related Planning/Landuse/Zoning Case/NA and copy all active (applied) conditions from zoning case to the given cap ID. 
// First check to make sure that the condition doesnt exist in the given capID (Matching condition type and the Name). DONT copy if already exists.
function copyConditionsfromZoningCase(capID){
	try{
		var copiedCnt=0;
		var recordType = "Planning/LandUse/ZoningCase/NA"; //Building/Permit/Sign/NA"; //"
		
		// get all the related caps
		var pCapID = allRelatedCapsofAType(capID, recordType);
		
		if(pCapID==null){
			aa.print("Method name: copyConditionsfromZoningCase. Error: Planning/LandUse/ZoningCase/NA is not found. capID:" + capID);
			return false;
		}
		
		//aa.print("2pCapID:" + pCapID); //aa.cap.getCapID(pCapID).getOutput());
		
		// get the conditions from zoning case cap	
		var condResult = aa.capCondition.getCapConditions(pCapID);
		if (condResult.getSuccess())
			var capConds = condResult.getOutput();
		else { 
			logDebug("**ERROR: getting cap conditions: " + condResult.getErrorMessage());
		}
		
		var cComment="Added via script";
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
			if (cStatus==null)
				cStatus = " ";
			if (cDesc==null)
				cDesc = " ";
			if (cImpact==null)
				cImpact = " ";
			
			if(cStatus.toUpperCase().equals("APPLIED")){
				//aa.print("BB:" + cStatus + "--" + cDesc + "--" + cImpact);
				
				// check to see if condition exist on the target cap
				if(!hasAppCondition(capID,cType,cStatus,cDesc,cImpact)){
					var addCapCondResult = aa.capCondition.addCapCondition(capID, cType, cDesc, cComment, sysDate, null, sysDate, null,null, 
																		   cImpact, systemUserObj, systemUserObj, cStatus, currentUserID, "A")
					if (addCapCondResult.getSuccess())
					{
						logDebug("Successfully added condition (" + cImpact + ") " + cDesc);
						//aa.print("Successfully added condition (" + cImpact + ") " + cDesc);
						copiedCnt++;
					}
					else
					{
						logDebug( "**ERROR: adding condition (" + cImpact + "): " + addCapCondResult.getErrorMessage());
					}
				}
				
			}

		}
			
		return copiedCnt;
	}catch(err){
		logDebug("Method name: copyConditionsfromZoningCase. Message: Error-" + err.message + ". CapID:" + capID);
		return -1;
	}
}
