// Permit must be Issued for ACA and Selectron
if (publicUser) {
if (!wasCapStatus(["Issued"])) { //Remove != "Site Visit" as not available in IVR, "Temporary CO Issued" removed as always Issued first
        showMessage = true;
        comment('<font size=small><b>Record must be Issued to Schedule Inspection</b></font>');
        // if (!exists(vEventName, ["InspectionMultipleScheduleAfter", "InspectionMultipleScheduleBefore"])) 
        cancel = true;
}
}
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
}