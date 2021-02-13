/**
 * Assess fees depending on the record type.
 * @return bool - false if an error occured.
 *
 * Updated By: DDJ - 2017.01.13
 * 
 */
function feeAssess() {
	var sucess = false;

	try {

        if (NumberOfFeeItems > 0) {
            var feeItemsArray = String(FeeItemsList).replace("[", "").replace("]", "").split("|");
            var qtyArray = String(FeeItemsQuantityList).replace("[", "").replace("]", "").split("|");
            var module = appTypeArray[0];
            logDebug("Assessing " + module + " fees.");


            // loop thru the added fee items
            for (var i in feeItemsArray) {
                var feeItem = feeItemsArray[i];
                var qty = new Number(qtyArray[i]);
 
                logDebug("Working with " + feeItem + " Qty:" + qty + ".");

                // Assess Building module fees
                if (module.equals("Building")) {
                    switch (feeItem) {
                        case "CC-BLD-001":
                        	calcFee_CC_BLD_COMM_CC_BLD_001();
                            break;
                        case "CC_BLD_04":
                        	calcFee_CC_BLD_COMM_CC_BLD_04();
                            break;
                        case "CC_BLD_06":
                        	calcFee_CC_BLD_COMM_CC_BLD_06();
                            break;
                        case "CC-BLDCAE-03":
                        	calcFee_CC_BLD_COMM_AE_CC_BLDCAE_03();
                            break;
                        case "CC-BLD-CAG01":
                        	calcFee_CC_BLD_COMM_AG_CC_BLD_CAG01();
                            break;
                        case "CC-BLD-CAB01":
                        	calcFee_CC_BLD_COMM_AUX_BOILER_CC_BLD_CAB01();
                            break;
                        case "CC-BLD-CAF01":
                        	calcFee_CC_BLD_COMM_AUX_FIRE_CC_BLD_CAF01();
                            break;
                        case "CC-BLD-CAM01":
                        	calcFee_CC_BLD_COMM_AUX_MECH_CC_BLD_CAM01();
                        	break;
                        case "CC-BLD-CAP01":
                        	calcFee_CC_BLD_COMM_AUX_PLUMBING_CC_BLD_CAP01();
                        	break;
                        case "CC-BLD-CV-02":
                        	calcFee_CC_BLD_CV_CC_BLD_CV_02();
                        	break;
                        case "CC-BLD-CV-03":
                        	calcFee_CC_BLD_CV_CC_BLD_CV_03();
                        	break;
                        // case "CC_BLDC002":
                        // 	calcFee_CC_BLD_MIXEDUSE_CC_BLDC002();
                        // 	break;
                        // case "CC_BLDC004":
                        // 	calcFee_CC_BLD_MIXEDUSE_CC_BLDC004();
                        // 	break;
                        case "CC_BLDR018":
                        	calcFee_CC_BLD_MIXEDUSE_CC_BLDR018();
                        	break;
                        case "CC_GEN_111":
                            calcFee_CC_BLD_MIXEDUSE_CC_GEN_111();
                            break;
                        case "CC_GEN_131":
                            calcFee_CC_BLD_MIXEDUSE_CC_GEN_131();
                            break;
                        case "CC_GEN_11":
                            calcFee_CC_BLD_RESIDENTIAL_CC_GEN_11();
                            break;
                        case "CC_GEN_13":
                            calcFee_CC_BLD_RESIDENTIAL_CC_GEN_13();
                            break;
                        case "CC_BLDGF015":
                        	calcFee_CC_BLD_MULTIUNIT_CC_BLDGF015();
                        	break;
                        case "CC_BLDGF017":
                        	calcFee_CC_BLD_MULTIUNIT_CC_BLDGF017();
                        	break;
                        case "CC_BLDMU003":
                        	calcFee_CC_BLD_MULTIUNIT_CC_BLDMU003();
                        	break;
                        default:
                            logDebug("Do nothing.");
                    }

                }

                // Assess Utilities module fees
                if (module.equals("Utilities")) {
                    switch (feeItem) {
                        case "":
                            break;
                        default:
                            logDebug("Do nothing.");
                    }
                }
            }

            sucess = true;
		}

	} catch(err) {
		logDebug("A JavaScript Error occured: " + err.message);
	}
	return sucess;
}
