function getParents_TPS(pAppType) {
	// returns the capId array of all parent caps
	//Dependency: appMatch function
	//
    var itemCap =(arguments.length > 1 && arguments[1]? arguments[1]:capId);

	var i = 1;
	while (true) {
		if (!(aa.cap.getProjectParents(itemCap, i).getSuccess()))
			break;

		i += 1;
	}
	i -= 1;

	getCapResult = aa.cap.getProjectParents(itemCap, i);
	myArray = new Array();

	if (getCapResult.getSuccess()) {
		parentArray = getCapResult.getOutput();

		if (parentArray.length) {
			for (x in parentArray) {
				if (pAppType != null) {
					//If parent type matches apType pattern passed in, add to return array
					if (appMatch(pAppType, parentArray[x].getCapID()))
						myArray.push(parentArray[x].getCapID());
				} else
					myArray.push(parentArray[x].getCapID());
			}

			return myArray;
		} else {
			logDebug("**WARNING: GetParent found no project parent for this application");
			return null;
		}
	} else {
		logDebug("**WARNING: getting project parents:  " + getCapResult.getErrorMessage());
		return null;
	}
} 
