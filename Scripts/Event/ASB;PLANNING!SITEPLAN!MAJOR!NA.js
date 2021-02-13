try {
//10-2020 Boucher for application creation when ACA has not APO data
	
	loadASITables4ACA_TPS();// Load ASITables into Arrays
	
	if (typeof (CCPLNSTMN) != "undefined") { // Check if ASITable array exists. 
		logDebug("ASITable: CCPLNSTMN");
		for (var rr in CCPLNSTMN) {
			var eachRow = CCPLNSTMN[rr];
			var rParcelID = (eachRow["Tax ID"] ? eachRow["Tax ID"] :"");
			showMessage = true;
			comment('<B><Font Color=RED>WARNING: Here is the Parcel Id you entered: ' + rParcelID + '.</B></Font>');
			var newCapParcel = aa.parcel.getCapParcelModel().getOutput();
			newCapParcel.setParcelModel(null);
			newCapParcel.setCapIDModel(capId);
			newCapParcel.setL1ParcelNo(rParcelID);
			newCapParcel.setParcelNo(rParcelID);
			aa.parcel.createCapParcel(newCapParcel);
			if (!rParcelID) continue;
		}	
	}
	// Send Debug Email
	debugEmailSubject = "";
	debugEmailSubject += (capIDString ? capIDString + " " : "") + vScriptName + " - Debug";
	if (exists(publicUserEmail, ["dboucher@truepointsolutions.com",""]))
		debugEmailTo = "dboucher@truepointsolutions.com";
	else if (exists(publicUserEmail, ["dboucher@truepointsolutions.com",""]))
		debugEmailTo = publicUserEmail;
	if (debugEmailTo && debugEmailTo != "")
		aa.sendMail("noreply@chesterfield.gov", debugEmailTo, "", debugEmailSubject, "Debug: " + br + debug);
} catch (err) {
		logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}

function loadASITables4ACA_TPS() {
 	// Loads App Specific tables into their own array of arrays.  Creates global array objects
	// Optional parameter, cap ID to load from.  If no CAP Id specified, use the capModel
	var itemCap = capId;
	if (arguments.length == 1) {
		itemCap = arguments[0]; // use cap ID specified in args
		var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(itemCap).getOutput();
	}
	else {
		var gm = cap.getAppSpecificTableGroupModel()
	}
	var ta = gm.getTablesMap();
	var tai = ta.values().iterator();
	while (tai.hasNext()) {
		var tsm = tai.next();
		if (tsm.rowIndex.isEmpty()) continue;  // empty table
			var tempObject = new Array();
			var tempArray = new Array();
			var tn = tsm.getTableName();
			tn = String(tn).replace(/[^a-zA-Z0-9]+/g,'');
		if (!isNaN(tn.substring(0,1))) tn = "TBL" + tn  // prepend with TBL if it starts with a number
			var tsmfldi = tsm.getTableField().iterator();
			var tsmcoli = tsm.getColumns().iterator();
			var numrows = 1;
		while (tsmfldi.hasNext()) { // cycle through fields
			if (!tsmcoli.hasNext()) { // cycle through columns
				var tsmcoli = tsm.getColumns().iterator();
				tempArray.push(tempObject);  // end of record
				var tempObject = new Array();  // clear the temp obj
				numrows++;
			}
			var tcol = tsmcoli.next();
			var tval = tsmfldi.next();  //.getInputValue();
			tempObject[tcol.getColumnName()] = tval;
		}
	tempArray.push(tempObject);  // end of record
	var copyStr = "" + tn + " = tempArray";
	logDebug("ASI Table Array : " + tn + " (" + numrows + " Rows)");
	eval(copyStr);  // move to table name
	}
}