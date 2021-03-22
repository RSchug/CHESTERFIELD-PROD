try {
//added 03-2021 per business request - Permit must be Issued for ACA
	if (publicUser) {
		if (capStatus != "Issued") { 
			showDebug = false;
			showMessage = true;
			comment('<font size=small><b>Record must be Issued to Schedule Inspection</b></font>');
			cancel = true;
		}
	}
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}
/*
// Parent Permit must be Issued for ACA and Selectron
//if (inspType != "Site Visit") { //removed as not needed for IVR
        var parentAppTypes = null;
        if (publicUser) {
        if (exists(appTypeArray[3], ["Boiler", "Fire", "Gas", "Mechanical", "Plumbing"])) {
                var parentAppTypes = ["Building/Permit/Commercial/NA", "Building/Permit/Residential/NA", "Building/Permit/Residential/Multi-Family"];
        } else if (exists(appTypeArray[3], ["Electrical"])) { // Includes Elevator & Sign 
                var parentAppTypes = ["Building/Permit/Commercial/NA", "Building/Permit/Residential/NA", "Building/Permit/Residential/Multi-Family", "Building/Permit/Elevator/Installation", "Building/Permit/Sign/NA"];
        } else if (appMatch("Building/Permit/Elevator/Installation")) {
                var parentAppTypes = ["Building/Permit/Commercial/NA", "Building/Permit/Residential/NA", "Building/Permit/Residential/Multi-Family"];
        }
        if (parentAppTypes) {
                logDebug("Checking parentCap: " + (parentCapId ? parentCapId.getCustomID() : parentCapId) + " was issued");
        }
        if (parentAppTypes && parentCapId && !wasCapStatus(["Issued"], parentCapId)) {
                showMessage = true;
                comment('<font size=small><b>Parent Record ' + (parentCapId ? parentCapId.getCustomID() : parentCapId) + ' must be Issued to schedule inspections</b></font>');
                // if (!exists(vEventName, ["InspectionMultipleScheduleAfter", "InspectionMultipleScheduleBefore"])) 
                cancel = true;
        }
} */