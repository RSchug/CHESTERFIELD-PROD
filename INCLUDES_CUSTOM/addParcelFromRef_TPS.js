function addParcelFromRef_TPS(parcel) {
    var ownerName = (arguments.length > 1 ? arguments[1] : null);
    var streetStart = (arguments.length > 2 ? arguments[2] : null);
    var streetEnd = (arguments.length > 3 ? arguments[3] : null);
    var houseFractionStart = (arguments.length > 4 ? arguments[4] : null);
    var houseFractionEnd = (arguments.length > 5 ? arguments[5] : null);
    var houseNumberAlphaStart = (arguments.length > 6 ? arguments[6] : null);
    var houseNumberAlphaEnd = (arguments.length > 7 ? arguments[7] : null);
    var streetDirection = (arguments.length > 8 ? arguments[8] : null);
    var streetPrefix = (arguments.length > 9 ? arguments[9] : null);
    var streetName = (arguments.length > 10 ? arguments[10] : null);
    var streetSuffix = (arguments.length > 11 ? arguments[11] : null);
    var streetSuffixDirection = (arguments.length > 12 ? arguments[12] : null);
    var unitType = (arguments.length > 13 ? arguments[13] : null);
    var unitStart = (arguments.length > 14 ? arguments[14] : null);
    var unitEnd = (arguments.length > 15 ? arguments[15] : null);
    var city = (arguments.length > 16 ? arguments[16] : null);
    var state = (arguments.length > 17 ? arguments[17] : null);
    var zipCode = (arguments.length > 18 ? arguments[18] : null);
    var county = (arguments.length > 19 ? arguments[19] : null);
    var country = (arguments.length > 20 ? arguments[20] : null);
    var levelPrefix = (arguments.length > 21 ? arguments[21] : null);
    var levelNumberStart = (arguments.length > 22 ? arguments[22] : null);
    var levelNumberEnd = (arguments.length > 23 ? arguments[23] : null);
    var refAddressId = (arguments.length > 24 ? arguments[24] : null);
    var primaryParcel = (arguments.length > 25 && exists(arguments[25], [false, "N"]) ? "N" : "Y");
    var itemCap = (arguments.length > 26 && arguments[26] ? arguments[26] : capId);

    var capParcelObj = null;

    var fMsg = "";
    fMsg += " to " + (arguments.length > 2 && arguments[2] != null ? "itemCap: " : "capId: ") + (itemCap && itemCap.getCustomID ? itemCap.getCustomID() : itemCap);
    if (parcel) {
        fMsg = "parcel # " + parcel + fMsg;
        //logDebug("Looking for reference parcel using " + fMsg);
        var refParcelValidateModelResult = aa.parcel.getParceListForAdmin(parcel, null, null, null, null, null, null, null, null, null);
        //var refParcelValidateModelResult = aa.parcel.getParceListForAdmin(parcel, streetStart, streetEnd, streetDirection, streetName, streetSuffix, unitStart, unitEnd, city, ownerName, houseNumberAlphaStart, houseNumberAlphaEnd, levelPrefix, levelNumberStart, levelNumberEnd);
    } else if (refAddressId) {
        fMsg = "refAddress # " + refAddressId + fMsg;
        //logDebug("Looking for reference parcel using " + fMsg);
        var refParcelValidateModelResult = aa.parcel.getPrimaryParcelByRefAddressID(refAddressId, "Y");
    } else if (addressStart && addressStreetName && addressStreetSuffix) {
        fMsg = "address # " + streetStart
            + (streetEnd ? " - " + streetEnd : "")
            + (streetDirection ? " " + streetDirection : "")
            + (streetName ? " " + streetName : "")
            + (streetSuffix ? " " + streetSuffix : "")
            + (unitStart ? ", Unit(s): " + unitStart : "")
            + (unitEnd ? " - " + unitEnd : "")
            + (addressCity ? " - " + addressCity : "");
        + (ownerName ? ", ownerName: " + ownerName : "")
            + fMsg;
        //logDebug("Looking for reference parcel using " + fMsg);
        var refParcelValidateModelResult = aa.address.getParceListForAdmin(null, streetStart, streetEnd, streetDirection, streetName, streetSuffix, unitStart, unitEnd, city, ownerName, houseNumberAlphaStart, houseNumberAlphaEnd, levelPrefix, levelNumberStart, levelNumberEnd);
    } else {
        logDebug("Failed to create transactional Parcel. No parcel/address identified");
        return false;
    }

    if (!refParcelValidateModelResult.getSuccess()) {
        logDebug("xxFailed to get reference Parcel for " + fMsg + " Reason: " + refParcelValidateModelResult.getErrorMessage());
        return false;
    }

    var refParcelNumber = null;
    var refParcelModels = refParcelValidateModelResult.getOutput();
    if (refParcelModels && refParcelModels.length) {
        var prcl = refParcelModels[0].getParcelModel(); // Use 1st matching reference parcel
        var refParcelNumber = prcl.getParcelNumber();
        //if (primaryParcel) 
        prcl.setPrimaryParcelFlag("Y");
        var capPrclResult = aa.parcel.warpCapIdParcelModel2CapParcelModel(itemCap, prcl);
        if (capPrclResult.getSuccess()) {
            capPrcl = capPrclResult.getOutput();
            if (!capPrcl.l1ParcelNo) { logDebug("Updated Wrapped Parcel L1ParcelNo:" + prcl.getL1ParcelNo()); capPrcl.setL1ParcelNo(prcl.getL1ParcelNo()); }
            if (!capPrcl.UID) { logDebug("Updated Wrapped Parcel UID:" + prcl.getUID()); capPrcl.setUID(prcl.getUID()); }
            logDebug("Wrapped Transactional Parcel " + refParcelNumber + " with Reference Data: "
                + (capPrcl && capPrcl.parcelNumber ? ", parcelNumber: " + capPrcl.parcelNumber : "")
                + (capPrcl && capPrcl.l1ParcelNo ? ", l1ParcelNo: " + capPrcl.l1ParcelNo : "")
                + (capPrcl && capPrcl.UID ? ", UID: " + capPrcl.UID : ""));
            var capPrclCreateResult = aa.parcel.createCapParcel(capPrcl);
            if (capPrclCreateResult.getSuccess()) {
                logDebug("Created Transactional Parcel " + refParcelNumber + " with Reference Data");
                //capParcelObj = capPrclCreateResult.getOutput(); // Returns null
                //capParcelObj = getCapParcelObj();
                capParcelObj = true;
            } else {
                logDebug("Failed to create Transactional Parcel with APO Attributes for " + refParcelNumber + " on " + itemCap + " Reason: " + capPrclCreateResult.getErrorMessage());
            }
        } else {
            logDebug("Failed to create Transactional Parcel with APO Attributes for " + refParcelNumber + " on " + itemCap + " Reason: " + capPrclResult.getErrorMessage());
        }
    } else {
        logDebug("No matching reference Parcel for " + fMsg);
        return false;
    }

    return (capParcelObj ? capParcelObj : false);
}