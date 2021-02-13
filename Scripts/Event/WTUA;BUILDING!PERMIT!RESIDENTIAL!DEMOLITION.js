// 17B:If 'Inspections' Workflow Task status is updated to 'Completed' then 'Delete' the related Building / Structure / NA / NA record.
if (wfTask == "Inspections" && wfStatus == "Completed") {
    if (parentCapId && appMatch("Building/Structure/NA/NA", parentCapId)) {
        logDebug("Updating Structure " + parentCapId.getCustomID() + " to Demolished");
        updateAppStatus("Demolished", "Updated via script from " + capId.getCustomID(), parentCapId);
        //logDebug("Deleting Structure " + parentCapId.getCustomID());
        //deleteRecord(parentCapId);
    }
}

