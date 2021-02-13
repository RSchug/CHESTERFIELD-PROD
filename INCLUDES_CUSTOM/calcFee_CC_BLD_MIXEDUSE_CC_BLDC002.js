/**
 * Calculates the fee CC-BLD-MIXEDUSE.CC_BLDC002
 * The minimum fee applies if calculation is less than minimum fees below. 
 * -- New Construction $297.00, or Addition $178 ****
 * Look through ASIT Work Description Commercial and Residential ASITs. 
 * The first Nature of the work found that starts with the word "New" we 
 * will assume New Construction. If "New" not found, then assume addition. 
 * If no records in either ASITs then assume New Construction.
 * 
 * @return null
 */
function calcFee_CC_BLD_MIXEDUSE_CC_BLDC002() {

    //fee variables
    var newConstFeeCode = "CC_BLDC002";
    var additionFeeCode = "CC_BLDC004";

    var fcode = newConstFeeCode; // default fee code
    var fsched = "CC-BLD-MIXEDUSE";
    var fperiod = "FINAL";
    var fqty = 297.00;
    var finvoice = "N";

    try {
        // get the ASIT field needed for the fee calculation.
        var tblName = "CC-BLD-MIXEDUSE-WD-COMMERCIAL";
        var totalNewCommercial = 0;
        var newConstruction = false;

        var workDescriptionCommercialArray = null;
        if (CCBLDMIXEDUSEWDCOMMERCIAL) {
            workDescriptionCommercialArray = CCBLDMIXEDUSEWDCOMMERCIAL;
        } else {
            workDescriptionCommercialArray = loadASITable(tblName);
        }

        if (!workDescriptionCommercialArray) {
            logDebug("Can't find ASI Table: " + tblName);
        } else {
            for (i in workDescriptionCommercialArray) {
                var workDescription = workDescriptionCommercialArray[i];

                if (workDescription["Nature of work"].fieldValue.toUpperCase().indexOf("NEW") >= 0) {
                    totalNewCommercial += 1;
                }
            }
        }

        var tblName = "CC-BLD-MIXEDUSE-WD-RESIDENTIAL";
        var totalNewResidential = 0;

        var workDescriptionResidentialArray = null;
        if (CCBLDMIXEDUSEWDRESIDENTIAL) {
            workDescriptionResidentialArray = CCBLDMIXEDUSEWDRESIDENTIAL;
        } else {
            workDescriptionResidentialArray = loadASITable(tblName);
        }

        if (!workDescriptionResidentialArray) {
            logDebug("Can't find ASI Table: " + tblName);
        } else {
            for (i in workDescriptionResidentialArray) {
                var workDescription = workDescriptionResidentialArray[i];

                if (workDescription["Nature of work"].fieldValue.toUpperCase().indexOf("NEW") >= 0) {
                    totalNewResidential += 1;
                }
            }
        }

        var calculatedFee = 0.00;
        var minimumFee = 297.00;
        var totalAmountPaid = 0.00;

        if (totalCostOfWork == "" || totalCostOfWork == null) {
            totalCostOfWork = 0.00;
        }

        // check if New construction, otherwise is an addition.
        newConstruction = ((workDescriptionResidentialArray.length > 0 && totalNewResidential > 0) || 
            (workDescriptionCommercialArray.length > 0 && totalNewCommercial > 0) || 
            (workDescriptionCommercialArray.length == 0 && workDescriptionResidentialArray.length == 0));

        if (!newConstruction) {
            fcode = additionFeeCode
            minimumFee = 178.00
        }

        // bypass the Total cost of work if ACA
        if (!publicUser) {
            var totalCostOfWork = AInfo["Total cost of work"];
            totalCostOfWork = parseFloat(totalCostOfWork);
            if (totalCostOfWork > 1000.00) {
                calculatedFee = minimumFee + (Math.floor((totalCostOfWork / 1000)) * 7.40);
            } else {
                calculatedFee = minimumFee;
            }
        } else {
            calculatedFee = minimumFee;
        }

        // check if any of the related fees is already assessed and paid.
        var feeArray = loadFees();
        for (f in feeArray) {
            fee = feeArray[f];

            if (fee.code.toUpperCase().equals(fcode) && fee.sched.toUpperCase().equals(fsched) && fee.status.toUpperCase().equals("NEW")) {
                totalAmountPaid += fee.amountPaid;
                logDebug("Amount: " + currencyFormat(fee.amount));
                logDebug("Amount Paid: " + currencyFormat(fee.amountPaid));
            }

        }

        fqty = calculatedFee;

        if (calculatedFee > 0 && totalAmountPaid > 0 && calculatedFee > totalAmountPaid) {
            fqty = calculatedFee - totalAmountPaid;
        }
        

        logDebug("totalAmountPaid: " + totalAmountPaid);
        logDebug("calculatedFee: " + calculatedFee);
        logDebug("minimumFee: " + minimumFee);
        logDebug("Fee: " + fqty);

        // remove the related not invoiced fees.
        logDebug("Removing fee: " + newConstFeeCode);
        removeFee(newConstFeeCode, fperiod);
        logDebug("Removing fee: " + additionFeeCode);
        removeFee(additionFeeCode, fperiod);

        // check if the fee is already added.
        if (feeExists(fcode)) {
            logDebug("Updating fee: " + fcode);
            updateFee(fcode, fsched, fperiod, fqty, finvoice);
        } else {
            logDebug("Adding fee: " + fcode);
            addFee(fcode, fsched, fperiod, fqty, finvoice);
        }

    } catch (err) {
        logDebug("A JavaScript Error occured: " + arguments.callee.toString().match(/function ([^\(]+)/)[1] + " - " + err.message);
    }
}
