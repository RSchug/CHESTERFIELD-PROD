function copyCapInfo(srcCapId, targetCapId) {
    var copySections = (arguments.length > 2 && arguments[2] ? arguments[2] : null);
    // For typically use null, by default valuation, documents & education are not copied.
    //copy data
    if (srcCapId == null) srcCapId = capId;
    if (copySections == null) copySections = ["Addresses", "ASI", "ASIT", "Cap Name", "Cap Short Notes", "Conditions", "Contacts", "GIS Objects", "LPs", "Owners", "Parcels"]; // Excludes Additional Info, Cap Detail, Conditions, Comments, Detailed Description, Documents, Education, ContEducation, Examination

    var srcCap = aa.cap.getCap(srcCapId).getOutput();
    var srcCapName = srcCap.getSpecialText();

    if (exists("Cap Detail", copySections)) { // Use with care!!
        aa.cap.copyCapDetailInfo(srcCapId, targetCapId);
    }
    if (exists("Cap Name", copySections) && srcCapName) {
        editAppName(srcCapName, targetCapId);
    }
    if (exists("Cap Short Notes", copySections)) { // Included in Cap Detail
        srcShortNotes = getShortNotes(srcCapId);
        updateShortNotes(srcShortNotes, targetCapId);
    }
    if (exists("Detailed Description", copySections)) {
        srcWorkDes = workDescGet(srcCapId);
        if (srcWorkDes != null && srcWorkDes != "")
            updateWorkDesc(srcWorkDes, targetCapId);
    }
    if (exists("Addresses", copySections)) copyAddresses(srcCapId, targetCapId);
    if (exists("Parcels", copySections)) copyParcels(srcCapId, targetCapId);
    if (exists("Owners", copySections)) copyOwner(srcCapId, targetCapId);
    if (exists("GIS Objects", copySections)) { //Copy GIS Objects
        var holdId = capId;
        capId = targetCapId;
        copyParcelGisObjects();
        capId = holdId;
    }
    if (exists("ASI", copySections)) {
        // copyASIFields(srcCapId, targetCapId);       // Must be identical for this to work.
        if (srcCapId == capId && typeof (AInfo) != "undefined")  // Use AInfo info instead of database.
            copyAppSpecific(targetCapId);
        else {
            var srcASIResult = aa.appSpecificInfo.getByCapID(srcCapId)
            if (srcASIResult.getSuccess()) {
                var srcASI = srcASIResult.getOutput();
            } else {
                logDebug("**ERROR: getting source ASI: " + sourceASIResult.getErrorMessage());
                var srcASI = [];
            }
            for (var i in srcASI) {
                var itemName = (useAppSpecificGroupName ? srcASI[i].getCheckboxType() : "") + srcASI[i].getCheckboxDesc();
                var itemValue = srcASI[i].getChecklistComment();
                editAppSpecific(itemName, itemValue, targetCapId);
            }
        }
    }
    if (exists("ASIT", copySections)) copyASITables(srcCapId, targetCapId);
    // copyASITables(srcCapId, targetCapId);       // Must be identical for this to work.

    if (exists("Contacts", copySections)) copyContacts(srcCapId, targetCapId);
    if (exists("LPs", copySections)) copyLicensedProf(srcCapId, targetCapId);
    if (exists("Valuation Calc", copySections)) copyCalcVal(srcCapId, targetCapId);


    if (exists("Additional Info", copySections)) {
        if (typeof (copyAdditionalInfo) == "function") {
            copyAdditionalInfo(srcCapId, targetCapId);
        } else {
            logDebug("Missing function copyAdditionalInfo")
        }
    }

    if (exists("Conditions", copySections)) copyConditions(srcCapId, targetCapId);
    if (exists("Education", copySections)) {
        aa.education.copyEducationList(srcCapId, targetCapId);
        logDebug("copied Education");
    }
    if (exists("ContEducation", copySections)) {
        copyEducation(srcCapId, targetCapId);
        aa.continuingEducation.copyContEducationList(srcCapId, targetCapId);
        logDebug("copied Continuing Education");
    }
    if (exists("Examination", copySections)) {
        aa.examination.copyExaminationList(srcCapId, targetCapId);
        logDebug("copied Examination");
    }
    if (exists("Documents", copySections)) {
        if (typeof (copyDocuments) == "function") {
            copyDocuments(srcCapId, targetCapId);
        } else {
            logDebug("Missing function copyDocuments")
        }
    }
    if (exists("Comments", copySections)) {  // TO DO
        if (typeof (copyCapComments) == "function") {
            copyCapComments(srcCapId, targetCapId);
        } else {
            logDebug("Missing function copyCapComments")
        }
    }

    // Copy License Expiration Information
    if (exists("License", copySections)) {
        if (typeof (copyCapLicense) == "function") {
            copyCapLicense(srcCapId, targetCapId);
        } else {
            logDebug("Missing function copyCapLicense")
        }
    }
}
