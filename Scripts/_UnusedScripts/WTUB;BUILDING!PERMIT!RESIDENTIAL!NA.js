/*
Title : Final Plat Validation
Purpose : The Final Plat record has data that should be validated as building permits are created.
Author: Yazan Barghouth
Functional Area : WorkflowTaskUpdateBefore
Description : 

When 60 percent of building permits are issued within a subdivision section, the roads are required to have base asphalt (this is verified by the Environmental
Engineering Inspector) If no asphalt is down, no additional building permits shall be issued.

When 90 percent of building permits are issued within a subdivision section, the roads are required to be State Accepted. If the roads are not State Accepted, no
additional building permits shall be issued. (This ties in with SRA in the Land Disturbance Permit record)

 */

//Constants:
var INSPECTION_TYPE = "Environmental Engineering Final";
var INSPECTION_REQUIRED_RESULT = "Approved";

var TRIGGER_TASK_NAME = "Permit Issuance";
var NUMBER_OF_LOTS_NAME = "No of lots";

//"State Road Acceptance"
var LAND_DISTURBANCE_TASK_NAME = "SRA";
var LAND_DISTURBANCE_TASK_REQUIRED_STATUS = "Completed";

try {
	if (wfTask.equalsIgnoreCase(TRIGGER_TASK_NAME) && wfStatus.equalsIgnoreCase("Issued")) {

		var permitTypesArray = [ "Building/Permit/Residential/NA", "Building/Permit/Residential/Multiunit", "Building/Permit/Commercial/NA" ];

		var finalPlatType = "Planning/Subdivision/Final Plat/NA";

		var relatedFinalPlats = getRelatedCapsByParcel(finalPlatType);

		if (relatedFinalPlats) {

			for (r in relatedFinalPlats) {
				var relatedFinalPlatCapId = relatedFinalPlats[r].getCapID();

				var numberOfPlots = getAppSpecific(NUMBER_OF_LOTS_NAME, relatedFinalPlatCapId);
				if (isNaN(numberOfPlots) || numberOfPlots == null) {
					cancel = true;
					showMessage = true;
					comment("**YAZAN Invalid 'Number of Plots' value= " + numberOfPlots
						+ ", capID: " + (relatedFinalPlatCapId ? relatedFinalPlatCapId.getCustomID() : relatedFinalPlatCapId));

					continue;
				}
				numberOfPlots = parseInt(numberOfPlots);

				//Count all permits:
				var numberOfcreatedPermits = 0;
				for (p in permitTypesArray) {
					var relatedBuildingPermits = getRelatedCapsByParcelForCapId(permitTypesArray[p], relatedFinalPlatCapId);
					if (relatedBuildingPermits) {
						numberOfcreatedPermits += relatedBuildingPermits.length;
					}
				}//all related permits

				var percentage = ((numberOfcreatedPermits / numberOfPlots) * 100);

				//validation not required yet, or already validated (pass)
				if (percentage < 60) {
					continue;
				}

				//better to check 90 first, as 60 can be already validated
				if (percentage > 90) {
					//get parent of relatedFinalPlatCapId [type: Planning/LandUse/LandDisturbance/NA]
					var parents = getParentsByCapId("Planning/LandUse/LandDisturbance/NA", relatedFinalPlatCapId);
					if (parents && parents.length > 0) {
						//in workflow "SRA"
						var statusCompleted = isTaskStatusByCapId(LAND_DISTURBANCE_TASK_NAME, LAND_DISTURBANCE_TASK_REQUIRED_STATUS, parents[0]);
						if (!statusCompleted) {
							cancel = true;
							showMessage = true;
							comment("90% exceeded while Task: 'State Road Acceptance' not Completed");
							break;
						}
					} else {
						//TODO if failed to get parents ??
						cancel = true;
						showMessage = true;
						comment("90% exceeded , failed to get parent");
						break;
					}//get parents failed or []
				}//exceeds 90%

				if (percentage > 60) {
					//check inspection in Final Plot:
					if (checkInspectionResultByCapId(INSPECTION_TYPE, INSPECTION_REQUIRED_RESULT, relatedFinalPlatCapId)) {
						//TODO check letters case for insp type and result
						//percentage can exceed 60% as inspection was completed
						continue;
					}//Inspection was completed

					//Inspection not completed, stop submission
					cancel = true;
					showMessage = true;
					comment("60% exceeded while 'Environmental Engineering' not Completed");
					break;
				}//exceeds 60%
			}//for all related caps
		} else {//relatedCaps
			aa.print("**YAZAN no related " + finalPlatType + " by same Parcel");
		}
	}//if target task and status
} catch (ex) {
	aa.print("YAZAN: Exception while executing script: " + ex);
}

function getRelatedCapsByParcelForCapId(recordType, recordCapId) {
	var t = new Array;
	var n = aa.parcel.getParcelandAttribute(recordCapId, null);
	if (n.getSuccess()) {
		var r = n.getOutput().toArray()
	} else {
		logDebug("**ERROR: getting parcels by cap ID: " + n.getErrorMessage());
		return false
	}
	for (zz in r) {
		var i = r[zz].getParcelNumber();
		var s = aa.cap.getCapListByParcelID(i, null);
		if (s.getSuccess()) {
			var o = s.getOutput()
		} else {
			logDebug("**ERROR: getting similar parcels: " + s.getErrorMessage());
			return false
		}
		for (cappy in o) {
			if (recordCapId.getCustomID().equals(o[cappy].getCustomID()))
				continue;
			var u = aa.cap.getCap(o[cappy].getCapID()).getOutput();
			var a = u.getCapType().toString().split("/");
			var f = true;
			var l = recordType.split("/");
			if (l.length != 4)
				logDebug("**ERROR: The following Application Type String is incorrectly formatted: " + recordType);
			else
				for (xx in l)
					if (!l[xx].equals(a[xx]) && !l[xx].equals("*"))
						f = false;
			if (f)
				t.push(o[cappy])
		}
	}
	if (t.length > 0)
		return t
}

function isTaskStatusByCapId(taskName, taskStatus, recordCapId) {
	var s = aa.workflow.getTaskItems(recordCapId, taskName, "", null, taskStatus, null);
	if (s.getSuccess())
		var o = s.getOutput();
	else {
		aa.print("ERR: Failed to get workflow object: " + s.getErrorMessage());
		return false
	}

	for (i in o) {
		fTask = o[i];
		if (fTask.getTaskDescription().toUpperCase().equals(taskName.toUpperCase())) {
			return fTask.getDisposition() != null && fTask.getDisposition().toUpperCase().equals(taskStatus.toUpperCase());
		}
	}
	return false
}

function getParentsByCapId(parentRecordType, recordCapId) {
	var t = 1;
	while (true) {
		if (!aa.cap.getProjectParents(recordCapId, t).getSuccess())
			break;
		t += 1
	}
	t -= 1;
	getCapResult = aa.cap.getProjectParents(recordCapId, t);
	myArray = new Array;
	if (getCapResult.getSuccess()) {
		parentArray = getCapResult.getOutput();
		if (parentArray.length) {
			for (x in parentArray) {
				if (parentRecordType != null) {
					var tmpParentCap = aa.cap.getCap(parentArray[x].getCapID()).getOutput();
					if (tmpParentCap.getCapType().toString().equalsIgnoreCase(parentRecordType))
						myArray.push(parentArray[x].getCapID())
				} else
					myArray.push(parentArray[x].getCapID())
			}
			return myArray
		} else {
			logDebug("**WARNING: GetParent found no project parent for this application");
			return null
		}
	} else {
		logDebug("**WARNING: getting project parents:  " + getCapResult.getErrorMessage());
		return null
	}
}

function checkInspectionResultByCapId(insp2Check, insp2Result, recordCapId) {
	var n = aa.inspection.getInspections(recordCapId);
	if (n.getSuccess()) {
		var r = n.getOutput();
		for (xx in r)
			if (String(insp2Check).equals(r[xx].getInspectionType()) && String(insp2Result).equals(r[xx].getInspectionStatus()))
				return true
	}
	return false
}