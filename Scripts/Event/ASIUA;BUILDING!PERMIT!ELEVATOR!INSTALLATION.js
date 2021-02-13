// ASIUA:Building/Permit/Elevator/Installation
// Update Elevator Table on Structure
// Get Commercial: Parent of Elevator Installation
var tableName = "CC-BLD-ELEVATOR";
var tableElevators = loadASITable(tableName);
if (typeof (tableElevators) != "object") tableElevators = null;
if (tableElevators && tableElevators.length > 0) {  
    // Check for Commercial as parent of current
    var capIdsCommercial = (parentCapId && appMatch("Building/Permit/Commercial/NA", parentCapId) ? [parentCapId] : getParents_TPS("Building/Permit/Commercial/NA"));
    var capIdCommercial = (capIdsCommercial && capIdsCommercial.length > 0 ? capIdsCommercial[0] : null);
    logDebug("capIdCommercial: " + (capIdCommercial ? " " + capIdCommercial.getCustomID() : capIdCommercial));
    // Check for Structure as parent of current
    var capIdsStructure = (parentCapId && appMatch("Building/Structure/NA/NA", parentCapId) ? [parentCapId] : getParents_TPS("Building/Structure/NA/NA"));
    var capIdStructure = (capIdsStructure && capIdsStructure.length > 0 ? capIdsStructure[0] : null);
    if (!capIdStructure) {
        // Check for Structure as parent of Commercial
        var capIdsStructure = (capIdCommercial ? getParents_TPS("Building/Structure/NA/NA", capIdCommercial) : null);
        var capIdStructure = (capIdsStructure && capIdsStructure.length > 0 ? capIdsStructure[0] : null);
    }
    logDebug("capIdStructure: " + (capIdStructure ? " " + capIdStructure.getCustomID() : capIdStructure));
    if (capIdStructure && appMatch("Building/Structure/NA/NA", capIdStructure)){
        updateASITable_TPS(tableName,["Name/ID#"], capIdStructure, capId);
    }
}
