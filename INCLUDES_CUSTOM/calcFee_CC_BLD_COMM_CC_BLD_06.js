/**
 * Calculates the fee CC-BLD-COMM.CC_BLD_06
 * Fee for $2,000 or less of the estimated construction cost, 
 * (less the cost used to calculate auxiliary permit fees) $119.00. 
 * For each additional $1,000 of the estimated construction cost, 
 * or fraction thereof $7.40
 * 
 * @return null
 */
function calcFee_CC_BLD_COMM_CC_BLD_06() {

	//fee variables
	var fcode = "CC_BLD_06";
	var fsched = "CC-BLD-COMM";
	var fperiod = "FINAL";
	var fqty = 119.00;
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
		if (totalCostOfWork > 2000.00) {
			fqty = fqty + (Math.floor((totalCostOfWork / 1000)) * 7.40);
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
