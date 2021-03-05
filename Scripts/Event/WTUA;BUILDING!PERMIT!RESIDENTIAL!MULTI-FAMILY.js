// WTUA:Building/Permit/Residential/Multi-Family
// 59B: When Application Submitted is 'Accepted - Plan Review Required' or 'Accepted - Plan Review Not Required' then create Unit Records under the Structure - which is associated by the count of Number of Units. And each Unit should have Address that are listed on the Multi-Family.
var units = parseInt(AInfo["Number of Units"]);
if (isNaN(units)) units = 0;
logDebug("Creating Units: " + units);
logDebug("wfTask: " + wfTask + ", wfStatus: " + wfStatus + ", parentCapId: " + parentCapId);
if (wfTask == "Application Submittal" && exists(wfStatus, ["Accepted - Plan Review Required", "Accepted - Plan Review Not Required"]) && parentCapId) {
    var units = parseInt(AInfo["Number of Units"]);
    if (isNaN(units)) units = 0;
    logDebug("Creating Units: " + units);
    var saveCapId = capId;
    for (var uu = 1; uu <= units; uu++) {
        copySections = ["Contacts", "LPs", "Cap Detail", "Detailed Description"]; // Excludes ASI, ASIT, Addresses,Parcels,Owners, GIS Objects,Additional Info, Cap Short Notes, Comments, LPs, Documents, Education, ContEducation, Examination
        var newCapId = createCap_TPS("Building/Unit/NA/NA", capName, null, "Child", capId, copySections); //remove units from capName + " # " + uu,
        comment("New child Building Unit[" + uu + "]: " + (newCapId ? newCapId.getCustomID() : newCapId)
            + " for " + (capId ? capId.getCustomID() : capId));
        // capId = newCapId;
        // branchTask("Application Submittal", "Accepted - Plan Review Not Required", "Issued as MultiUnit", "")
        capId = saveCapId;
    }
    capId = saveCapId;
}
// 60B: When Review Consolidation is 'Approved' then create the Residential/NA Building Permit records for each Unit. Copy all information to the Building Permit.  Each Building Permit will be set to Application Submittal - Accepted - No Plan Review Required and at Permit Issuance workflow task. 
if (wfTask == "Review Consolidation" && wfStatus == "Approved" && parentCapId) {
    logDebug("Updating Units");
    var units = parseInt(AInfo["Number of Units"]);
    if (isNaN(units)) units = 0;
    var saveCapId = capId;
    var childArray = getChildren("Building/Unit/NA/NA", capId);
    if (childArray == null || childArray == false) childArray = [];
    for (var uu in childArray) {
        capId = childArray[uu];
        copySections = ["Addresses", "Cap Detail", "Detailed Description", "Contacts", "GIS Objects", "LPs", "Owners", "Parcels"]; // Excludes ASI, ASIT, Cap Short Notes, Additional Info, Comments, Documents, Education, ContEducation, Examination
        cap = aa.cap.getCap(capId).getOutput();
        newCapName = cap.getSpecialText();
        var newCapId = createCap_TPS("Building/Permit/Residential/NA", newCapName, null, "Child", capId, copySections);
        comment("New child Residential Building: " + (newCapId ? newCapId.getCustomID() : newCapId)
            + " for Unit[" + uu + "]: " + (capId ? capId.getCustomID() : capId) + " " + newCapName);
        capId = newCapId;
        resultWorkflowTask("Application Submittal", "Accepted - Plan Review Not Required", "Approved as Multi-Family", "")
        capId = saveCapId;
    }
    capId = saveCapId;
}
