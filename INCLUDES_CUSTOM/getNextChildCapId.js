function getNextChildCapId(pCapId, cAppTypeString, suffix) {
    var pAltId = pCapId.getCustomID();
    //For Omega record masks we need to remove the existing suffix from the parent AltId
    //pAltId = pAltId.substring(0,13);
    //Get the number of child records by type provided
    var childCaps = getChildren(cAppTypeString, pCapId);
    if (childCaps === null || childCaps.length === 0) {
        var seqMin = 1;
        var seqMax = seqMin + 98;
    } else {
        var seqMin = childCaps.length + 1;
        var seqMax = seqMin + 98;
    }
    //When using the clone feature multiple records can be created at the same time. When this happens the AltIds of the children records are not set. To correctly set the AltIds we need to start with the last number and work backwards.
    //This ensures all the new child records receives a unique AltId.
    for (var i = seqMin; i <= seqMax; i++) {
        var seqNbr = (i < 10 ? "0" : "") + i;  //Add leading 0 if single digit
        var newAltId = pAltId + suffix + seqNbr + "";
        // Check if new AltId is available.
        var s_capResult = aa.cap.getCapID(newAltId);
        if (!s_capResult.getSuccess()) return newAltId; // New Alt Id available.
    }
    return null;
}