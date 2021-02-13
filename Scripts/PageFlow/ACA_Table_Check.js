try {
	showDebug = true;				
	var sessiontabledata = getASITablesRowsFromSession4ACA_local('CC-LU-TPA');
	if (sessiontabledata) {
		/*for (b in sessiontabledata) {
			if (sessiontabledata[b]["Tax ID"] > 0) {
				logDebug('There is data in Tax ID');
			} else {
				showMessage = true;
				comment('You need to enter at least 1 Tax ID in the table to continue.');
				cancel = true;
			}
		}*/
		logDebug('There is data in Tax ID');
	} else if (sessiontabledata == false) { showMessage = true; comment('There is no table avaialable to pull data from'); cancel = true; }
	
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}
function getASITablesRowsFromSession4ACA_local(tableName) {
	var gm = cap.getAppSpecificTableGroupModel()
	var ta = gm.getTablesMap();
	var tai = ta.values().iterator();
	while (tai.hasNext()) {
		var tsm = tai.next();
		if (tsm.rowIndex.isEmpty())
			return false; //continue;

		var asitRow = new Array;
		var asitTables = new Array;
		var tn = tsm.getTableName();
		if (tn != tableName) {
			continue;
		}

		var tsmfldi = tsm.getTableField().iterator();
		var tsmcoli = tsm.getColumns().iterator();
		while (tsmfldi.hasNext()) {

			var tcol = tsmcoli.next();
			var tval = tsmfldi.next();

			asitRow[tcol.getColumnName()] = tval;

			if (!tsmcoli.hasNext()) {
				tsmcoli = tsm.getColumns().iterator();
				asitTables.push(asitRow);
				asitRow = new Array;
			}
		}
		return asitTables;
	}
	return false;
}
	// Get Public User Email Address
	var debugEmailTo = "";
	var publicUserEmail = "";
	if (publicUserID) {
		var publicUserModelResult = aa.publicUser.getPublicUserByPUser(publicUserID);
		if (publicUserModelResult.getSuccess() || !publicUserModelResult.getOutput()) {
			publicUserEmail = publicUserModelResult.getOutput().getEmail();
			logDebug("publicUserEmail: " + publicUserEmail + " for " + publicUserID)
		} else {
			publicUserEmail = null;
			logDebug("publicUserEmail: " + publicUserEmail);
		}
	}
	if (publicUserEmail) publicUserEmail = publicUserEmail.replace("TURNED_OFF","").toLowerCase();
	logDebug("publicUserEmail: " + publicUserEmail);
	// Set Debug User if TPS User.
	if (publicUserEmail && debugEmailTo == "") {
		if (publicUserEmail.indexOf("@truepointsolutions.com") > 0) 	debugEmailTo = publicUserEmail;
		if (exists(publicUserEmail,['bushatos@hotmail.com']))	debugEmailTo = publicUserEmail;
	}
	logDebug("debugEmailTo: " + debugEmailTo);
	if (debugEmailTo && debugEmailTo != "") showDebug = true;

	// Send Debug Email
	if (debugEmailTo && debugEmailTo != "") {
		debugEmailSubject = "";
		debugEmailSubject += (capIDString ? capIDString + " " : (capModel && capModel.getCapID ? capModel.getCapID() + " " : "")) + vScriptName + " - Debug";
		logDebug("Sending Debug Message to "+debugEmailTo);
		aa.sendMail("NoReply-" + servProvCode + "@accela.com", debugEmailTo, "", debugEmailSubject, "Debug: \r" + br + debug);
		showDebug = false;
	}