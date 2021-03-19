try {
//
/* 1CE When: Workflow Task = 'Community Enhancement' and Task Status = 'Inspection Required PM'
THEN:  deactive Community Enhancement Workflow Task
create child Enforcement / Property Maintenance / NA / NA record
schedule "Initial" inspection for next day on Child Record and assign inspection Based on Inspector GIS Layer and add the Custom Fields Data from Parent record that is checked to the Inspection Request field on the Child Record
copy Custom Fields Data from Parent record that is checked to the Inspection Request field on the Child Record
CC-ENF-ZONE >  CC-ENF-PROAC or CC-ENF-ZONE
 */
	if (wfTask == 'Community Enhancement' && wfStatus == 'Inspection Required PM') {
		deactivateTask("Community Enhancement");
		var checkedItems = getAppSpecificFieldLabels(null, ["CC-ENF-VIOT"], null, ["CHECKED"], ["Checkbox"]);
		logDebug("Violations: " + checkedItems);
		newChildID = createChildLic("Enforcement", "Property Maintenance", "NA", "NA", "");
		if (newChildID) {
			var newInspId = scheduleInspection_TPS("Initial", 1, null, null, "Auto Scheduled from Concern Record: " + checkedItems, newChildID);
			var iInspector = assignInspection_CHESTERFIELD(newInspId, null, newChildID);
			performCISLookup_TPS();
			copyAppSpecific(newChildID);
			var ParcelZoning = AInfo["ParcelAttribute.ZONING"];
		editAppSpecific("Zoning",ParcelZoning);
			var InspAssignment = null;
			if (iInspector && iInspector.getGaUserID()) {
				InspAssignment = iInspector.getGaUserID();
				assignCap(InspAssignment, newChildID);
			}
			/*Add "TRANSPORTATION CONCERNS" custom fields
			var checkedItems = getAppSpecificFieldLabels(null, ["CC-ENF-VIOT"], null, ["CHECKED"], ["Checkbox"]);
			for (asi in checkedItems) {
			logDebug("Updating " + asi + " with " + AInfo[asi]);
			editAppSpecific(asi, AInfo[asi], newChildID);
			} */
		}
	}


	if (wfTask == 'Community Enhancement' && wfStatus == 'Inspection Required ZC') {
		deactivateTask("Community Enhancement");
		var checkedItems = getAppSpecificFieldLabels(null, ["CC-ENF-VIOT"], null, ["CHECKED"], ["Checkbox"]);
		logDebug("Violations: " + checkedItems);
		newChildID = createChildLic("Enforcement", "Zoning Code Compliance", "NA", "NA", "");
		if (newChildID) {
			var newInspId = scheduleInspection_TPS("Initial", 1, null, null, "Auto Scheduled from Concern Record: " + checkedItems, newChildID);
			var iInspector = assignInspection_CHESTERFIELD(newInspId, null, newChildID);
			copyAppSpecific(newChildID);
			var ParcelZoning = AInfo["ParcelAttribute.ZONING"];
		editAppSpecific("Zoning",ParcelZoning);
			saveCapId = capId;
			capId = newChildID;
			deactivateTask("Initiation");
			activateTask("Investigation");
			capId = saveCapId;
			performCISLookup_TPS();
			copyAppSpecific(newChildID);
			var InspAssignment = null;
			if (iInspector && iInspector.getGaUserID()) {
				InspAssignment = iInspector.getGaUserID();
				assignCap(InspAssignment, newChildID);
			}
			/*Add "TRANSPORTATION CONCERNS" custom fields
			var checkedItems = getAppSpecificFieldLabels(null, ["CC-ENF-VIOT"], null, ["CHECKED"], ["Checkbox"]);
			for (asi in checkedItems) {
			logDebug("Updating " + asi + " with " + AInfo[asi]);
			editAppSpecific(asi, AInfo[asi], newChildID);
			} */
		}
	}

	if (wfTask == 'Community Enhancement' && wfStatus == 'Inspection Required PM and ZC') {
		deactivateTask("Community Enhancement");
		var checkedItems = getAppSpecificFieldLabels(null, ["CC-ENF-VIOT"], null, ["CHECKED"], ["Checkbox"]);
		logDebug("Violations: " + checkedItems);
		newChildID = createChildLic("Enforcement", "Property Maintenance", "NA", "NA", "");
		if (newChildID) {
			var newInspId = scheduleInspection_TPS("Initial", 1, null, null, "Auto Scheduled from Concern Record: " + checkedItems, newChildID);
			var iInspector = assignInspection_CHESTERFIELD(newInspId, null, newChildID);
			performCISLookup_TPS();
			copyAppSpecific(newChildID);
			var ParcelZoning = AInfo["ParcelAttribute.ZONING"];
		editAppSpecific("Zoning",ParcelZoning);
			var InspAssignment = null;
			if (iInspector && iInspector.getGaUserID()) {
				InspAssignment = iInspector.getGaUserID();
				assignCap(InspAssignment, newChildID);
			}
			/*Add "TRANSPORTATION CONCERNS" custom fields
			var checkedItems = getAppSpecificFieldLabels(null, ["CC-ENF-VIOT"], null, ["CHECKED"], ["Checkbox"]);
			for (asi in checkedItems) {
			logDebug("Updating " + asi + " with " + AInfo[asi]);
			editAppSpecific(asi, AInfo[asi], newChildID);
			} */
		}
		newChildID = createChildLic("Enforcement", "Zoning Code Compliance", "NA", "NA", "");
		if (newChildID) {
			var newInspId = scheduleInspection_TPS("Initial", 1, null, null, "Auto Scheduled from Concern Record: " + checkedItems, newChildID);
			var iInspector = assignInspection_CHESTERFIELD(newInspId, null, newChildID);
			performCISLookup_TPS();
			copyAppSpecific(newChildID);
			var ParcelZoning = AInfo["ParcelAttribute.ZONING"];
		editAppSpecific("Zoning",ParcelZoning);
			saveCapId = capId;
			capId = newChildID;
			deactivateTask("Initiation");
			activateTask("Investigation");
			capId = saveCapId;
			copyAppSpecific(newChildID);
			var InspAssignment = null;
			if (iInspector && iInspector.getGaUserID()) {
				InspAssignment = iInspector.getGaUserID();
				assignCap(InspAssignment, newChildID);
			}
		}
	}

	if (wfTask == 'Community Enhancement' && wfStatus == 'KCB Workorder') {
		newChildID = createChild("Enforcement", "KCB Workorder", "NA", "NA", "");
		if (newChildID) {
			saveCapId = capId;
			capId = newChildID;
			updateTask("Initiation", "Pending Review", "Updated based on Concern Record", "");
			capId = saveCapId;
			copyAppSpecific(newChildID);
		}
	}
//Variables for the CE Inspector based on Parcel field "Council Dist" and Standard Choice
    if (isTaskActive("Community Enhancement")) {
        assignTask_CHESTERFIELD("Community Enhancement", null, null, null, "Enforcement");
    }
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}

function performCISLookup_TPS() {
    itemCap = capId;
    if (arguments.length > 0) itemCap = arguments[0];

    dataServiceURL = lookup("CIS Lookup Service", "dataServiceURL");
    if (dataServiceURL && dataServiceURL != "") {
        var capAddrResult = aa.address.getAddressByCapId(itemCap);
        var addressToUse = null;
            
        if (capAddrResult.getSuccess()) {
            var addresses = capAddrResult.getOutput();
            if (addresses) {
                for (zz in addresses) {
                      capAddress = addresses[zz];
                    if (capAddress.getPrimaryFlag() && capAddress.getPrimaryFlag().equals("Y")) 
                        addressToUse = capAddress;
                }
                if (addressToUse == null)
                    addressToUse = addresses[0];
            }
        }
        if (addressToUse != null) {
            var stName = addressToUse.getStreetName();
            var stType = addressToUse.getStreetSuffix();
            var stNbr = addressToUse.getHouseNumberStart();
            stName = String(stName).replace(/ /g, "%20");
	        stName = String(stName).replace(/,/g, "%2C");
	        var qString = stName+"|"+stType+"|"+stNbr;
            var postresp = aa.util.httpPost( dataServiceURL.replace("$$DATA$$",qString), "PARAMETERSINURL");
            if (postresp.getSuccess()) {
               var tmpResp = postresp.getOutput();
               logDebug("Response: " + tmpResp);    
               respObj = JSON.parse(tmpResp);
               for (var rIndex in respObj) {
                   thisObj = respObj[rIndex];
                   newRow = fillRow(thisObj);
                   addToASITable("CC-UT-UC",newRow,newChildID);     
               }
            }
            else {
                logDebug("Error : " + postresp.getErrorMessage());
            }
        }
    }
}