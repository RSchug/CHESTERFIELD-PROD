try {
	var ParcelZoning = AInfo["ParcelAttribute.ZONING"];
	editAppSpecific("Zoning",ParcelZoning);
	
	var iInspector = assignInspection_CHESTERFIELD(null); // Get Inspector
	var InspAssignment = null;
	if (appMatch("Enforcement/Zoning Code Compliance/*/*") || appMatch("Enforcement/Property Maintenance/*/*")){  //04-2021 removed || appMatch("Enforcement/Street Light/*/*")
		if (iInspector && iInspector.getGaUserID()) {
			InspAssignment = iInspector.getGaUserID();
			assignCap(InspAssignment);
		}
	}
	if (appMatch("Enforcement/Zoning Code Compliance/*/*") || appMatch("Enforcement/Property Maintenance/*/*")){
		scheduleInspection("Initial", 0, InspAssignment, null, "Auto Scheduled");
	}
	if (!publicUser) performCISLookup()
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}