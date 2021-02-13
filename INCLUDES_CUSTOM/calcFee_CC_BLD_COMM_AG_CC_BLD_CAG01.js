/**
 * Calculates the fee CC-BLD-COMM-AG.CC-BLD-CAG01
 * $59.00 minimun with estimated construction cost less than or equal to $1,000. 
 * $6.60 for each additional $1,000 or fraction thereof, of the estimated cost over $1,000.
 * 
 * @return null
 */
function calcFee_CC_BLD_COMM_AG_CC_BLD_CAG01() {

	//fee variables
	var fcode = "CC-BLD-CAG01";
	var fsched = "CC-BLD-COMM-AG";
	var fperiod = "FINAL";
	var fqty = 59.00;
	var finvoice = "N";

	try {
		// get the ASI field needed for the fee calculation.
		var totalCostOfWork = AInfo["Total Cost of Work"];

		if (totalCostOfWork == "" || totalCostOfWork == null) {
			logDebug("Total Cost of Work amount is required to calculate fee.");
			return false;
		}
		
		// calculation code here.
		totalCostOfWork = parseFloat(totalCostOfWork);
		if (totalCostOfWork >= 1000.00) {
			fqty = fqty + (Math.floor((totalCostOfWork / 1000)) * 6.60);
		}

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
