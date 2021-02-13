function addFees_ZoneCase() {
    var tableName = "CC-LU-ZC-TYPE";
    var requestUseFeeMap = {        // Maps Request Type & Use Type to Fee Code.
        // Request Type: Amend Prior Case
        "Amend Prior Case.All Others": 'AMEND4',
        "Amend Prior Case.Recreational Facility and Grounds Primarily Serving Surrounding Residential Community": "AMEND2",
        "Amend Prior Case.Use Incidental to Principal Dwelling to include Family Day Care Home or Resource Prot Area SFD": "AMEND1",
        // Request Type: Conditional Use
        "Conditional Use.Adult Business": "ADULTCU",
        "Conditional Use.All Others": "CONDUSEOTHCU",
        "Conditional Use.Communication Tower": "CTOWERCU",
        "Conditional Use.Computer Controlled Variable Message Electronic (EMC) Sign": null, // Disabled: "EMCSIGN",
        "Conditional Use.Landfill, Quarry, Mine or Borrow Pit": "LANDFILLCU",
        "Conditional Use.Recreational Facility and Grounds Primarily Serving Surrounding Residential Community": "RECFACILITYC",
        "Conditional Use.Use Incidental to Principal Dwelling to include Family Day Care Home": "DAYCARECU",
        // Request Type: Conditional Use Planned Development
        "Conditional Use Planned Development.Adult Business": "ADULT",
        "Conditional Use Planned Development.All Others": "CONDUSEOTHER",
        "Conditional Use Planned Development.Communication Tower": "CTOWER",
        "Conditional Use Planned Development.Computer Controlled Variable Message Electronic (EMC) Sign": null, // Disabled: "EMCSIGN",
        "Conditional Use Planned Development.Landfill, Quarry, Mine or Borrow Pit": "LANDFILL",
        "Conditional Use Planned Development.Recreational Facility and Grounds Primarily Serving Surrounding Residential Community": "RECFACILITY",
        "Conditional Use Planned Development.Use Incidental to Principal Dwelling to include Family Day Care Home": "DAYCARE",
        // Request Type: Rezoning
        "Rezoning.Not Applicable": "REZONING",
        // Request Type: Utility Waiver
        "Utility Waiver.Not Applicable": "UTILITY"
    /*  // Request Types
            "Amend Prior Case": null,
            "Conditional Use": null,
            "Conditional Use Planned Development": null,
            "Rezoning": null,
            "Utility Waiver": null,
            // Use Type: Conditional Use Type
            ".Adult Business": null,
            ".All Others": null,
            ".Communication Tower": null,
            ".Computer Controlled Variable Message Electronic (EMC) Sign": null,
            ".Landfill, Quarry, Mine or Borrow Pit": null,
            ".Not Applicable": null,
            ".Recreational Facility and Grounds Primarily Serving Surrounding Residential Community": null,
            ".Use Incidental to Principal Dwelling to include Family Day Care Home": null,
            ".Use Incidental to Principal Dwelling to include Family Day Care Home or Resource Prot Area SFD": null */
    }
    // Get Fee Code Quantities
    var feeQty = [];
    var sRows = loadASITable(tableName, capId);
    if (typeof (sRows) != "object") srcRows = null;
    if (sRows && sRows.length > 0) {
        for (var eachRow in sRows) {
            var sRow = sRows[eachRow];
            var requestUseType = sRow["Request Type"]+"."+sRow["Conditional Use and Conditional Use Planned Development Type"];
            var acreage = sRow["Acreage"];
            var feeCode = null;
            if (typeof (requestUseFeeMap[requestUseType]) == "undefined") continue; // No Associated Fee.
            var feeCode = requestUseFeeMap[requestUseType];
            if (!feeCode) continue;
            if (typeof (feeQty[feeCode]) == "undefined") feeQty[feeCode] = 0;
            if (exists(feeCode, ["AMEND1","AMEND2","DAYCARE","DAYCARECU","RECFACILITY","AMEND4","UTILITY","CTOWERCU","CTOWER"])) // Fees not based on acreage. 01-2021 db added ctowers per testing
                feeQty[feeCode] = 1;
            else
                feeQty[feeCode] += acreage;
            logDebug("Totaling " + tableName + "[" + requestUseType + "]:" + acreage + " > " + feeCode + ", Total: " + feeQty[feeCode]);
        }
    }
    for (var feeCode in feeQty) {
        logDebug("Adding Fee " + feeCode + ", Qty: " + feeQty[feeCode]);
        updateFee(feeCode, "CC-PLANNING", "FINAL", feeQty[feeCode], "N");
    }
}