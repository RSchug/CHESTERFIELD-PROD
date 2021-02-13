function copyCapLicense(srcCapId, targetCapId) {
    try { // Handle NullPointerException when no expiration record.
        var oldLic = new licenseObject(null, srcCapId);
        if (oldLic != null) {
            expStatus = oldLic.b1Status;
            expDate = oldLic.b1ExpDate;
            logDebug("oldLic: " + oldLic.b1Status + " " + oldLic.b1ExpDate);
            b1ExpResult = aa.expiration.getLicensesByCapID(targetCapId);
            if (b1ExpResult.getSuccess()) {
                var b1Exp = b1ExpResult.getOutput();
                    if (expStatus) b1Exp.setExpStatus(expStatus);
                    b1ExpDate = null;
                    if (expDate) {
                        var b1ExpDate = aa.date.parseDate(expDate);
                    }
                    b1Exp.setExpDate(b1ExpDate);
                    aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
                    var newLic = new licenseObject(null, targetCapId);
                    if (newLic != null)
                        logDebug("Expiration: " + newLic.b1Status + " " + newLic.b1ExpDate);
            }
        }
    } catch (err) {
        var b1Exp = null;
        logDebug("ERROR: copying Expiration: " + err.message);
    }
}
