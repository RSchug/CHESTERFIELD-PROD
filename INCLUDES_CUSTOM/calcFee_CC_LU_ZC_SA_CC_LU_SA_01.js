/**
 * Calculates the fee CC-LU-ZC-SA.CC-LU-SA-01
 * Substantial accord - communication tower 
 * $7500 + $100 per acre in excess of 1 acre.
 *  
 * @return null
 */
function calcFee_CC_LU_ZC_SA_CC_LU_SA_01() {

	//fee variables
	var fcode = "CC-LU-SA-01";
	var fsched = "CC-LU-ZC-SA";
	var fperiod = "FINAL";
	var fqty = 7500.00;
	var finvoice = "N";

	try {
		// get the ASI field needed for the fee calculation.
        var requestType = AInfo["Request type"];
        if (!requestType) {
            logDebug("Can't apply fee " + fcode + ". Request Type is null.");
            return null;
        }

        if (requestType.toUpperCase().indexOf("TOWER") < 0) {
            logDebug("This fee doesn't apply for this Request Type:" + requestType);
            return null;
        }

		var totalAcreage = AInfo["Total Parcel Area"];
		if (!totalAcreage) {
			logDebug("You need the Total Parcel Area to assess fee.");
			return null;
		}
		
		totalAcreage = parseFloat(totalAcreage);

		// calculation code here.
		var minimumFee = fqty;
		var calculatedFee = minimumFee;

		if (totalAcreage > 1.00) {
			calculatedFee = minimumFee + ((totalAcreage - 1) * 100.00);
		}

		fqty = calculatedFee;

		// check if the fee is already added.
		if (feeExists(fcode)) {
			updateFee(fcode, fsched, fperiod, fqty, finvoice);
		} else {
			addFee(fcode, fsched, fperiod, fqty, finvoice);
		}

	} catch (err) {
		logDebug("A JavaScript Error occured: " + arguments.callee.toString().match(/function ([^\(]+)/)[1] + " - " + err.message);
	}
}
