//S21 - This script looks at all the related record types and returnes all CAP IDs that are of a particular record type
function allRelatedCapsofAType(capID,recordType){
	try{
		var typeMatchedArray = new Array(); // new array
		
		// if recordType is null return null
		if(recordType==null){
			logDebug("Method name: allRelatedCapsofAType. Message: recordType is null. CapID:" + capID);
			return null;
		}
		
		// get the list of all the related child caps
		var tmpdirectChld = getAllRelatedCaps(capID);
		if (tmpdirectChld!=null)
		{
			//loop thru the list
			for(ff in tmpdirectChld) {
				//aa.print("tmpdirectChld[ff]:" + tmpdirectChld[ff]);
				if (tmpdirectChld[ff]) {
					var getCapResult =aa.cap.getCapID(tmpdirectChld[ff]).getOutput();
					var capChld = aa.cap.getCap(getCapResult).getOutput(); 	// Cap object 
					var appTypeChldResult = capChld.getCapType(); 							// get the child cap's type
					var appTypeChldString = appTypeChldResult.toString(); 					// get the child cap's type string
					//aa.print("appTypeChldString:" + appTypeChldString);
					
					// compare the related child cap's type with recordType. if both match add it to the array
					if(appTypeChldString.toUpperCase().equals(recordType.toUpperCase())){
						var chldCapId = aa.cap.getCapID(tmpdirectChld[ff]).getOutput(); //.getCapID().getCustomID()
						typeMatchedArray.push(chldCapId.getCustomID());
					}
				}
			}
		}
		return typeMatchedArray;
	}catch(err){
		logDebug("Method name: allRelatedCapsofAType. Message: Error-" + err.message + ". CapID:" + capID);
		return null;
	}
}