try {
	//AIUB:BUILDING/PERMIT/*/*
	//Check Estimate Cost is less than Professional Job Cost Rank
	//
	logDebug("aiValuation: " + aiValuation + ", aiBuildingCount: " + aiBuildingCount + ", aiHouseCount: " + aiHouseCount);
	logDebug("aiConstructionTypeCode: " + aiConstructionTypeCode + ", aiPublicOwnedFlag: " + aiPublicOwnedFlag);
	logDebug("aiApplicationName: " + aiApplicationName);
	logDebug("aiWorkDescription: " + aiWorkDescription);
	var jobCostMaxValueMap = {
		"A - Unlimited": null,
		"B - Up to $120,000": 120000,
		"C - Up to $10,000": 10000,
		"Tradesman - Up to $1,000": 1000
	};

	estValue = aiValuation;
	var jobCostMax = null;
	var capLicense = null;
	capLicenseArr = aa.licenseScript.getLicenseProf(capId).getOutput();
	if (capLicenseArr && capLicenseArr.length > 0) {
		for (var i in capLicenseArr) {
			capLicense = capLicenseArr[0];
			var jobCostRank = capLicense.getSalutation();
			if (jobCostRank && typeof (jobCostMaxValueMap[jobCostRank]) != "undefined") 
				jobCostMax = jobCostMaxValueMap[jobCostRank];
			if (!jobCostMax) {
				logDebug("jobCostRank: " + jobCostRank);
				var jobCostRank = jobCostRank.split(" ")[0];
				logDebug("jobCostRank: " + jobCostRank);
				if (jobCostRank && typeof (jobCostMaxValueMap[jobCostRank]) != "undefined") 
					jobCostMax = jobCostMaxValueMap[jobCostRank];
			}
			logDebug("capLicense[" + i + "]: "
				+ ", Lic #: " + capLicense.getLicenseNbr()
				+ ", Type: " + capLicense.getLicenseType()
				+ ", Flag: " + capLicense.getTypeFlag()
				+ ", Rank: " + capLicense.getSalutation()
				+ ", jobCostMax: " + jobCostMax
				+ ", estValue: " + estValue
	//          + (i == 0 && capLicense? br + describe_TPS(capLicense):"")
				);
			if (capLicense.getPrintFlag() == "Y") break; // Found Primary.
		}
	}
	else logDebug("There are no LPs");

	if (estValue != null && jobCostMax != null && estValue > jobCostMax) {
		showMessage = true;
		comment("Estimated Cost of Construction (" + estValue + ") is over their Rank limit: " + jobCostMax
			+ (capLicense ? " " + capLicense.getLicenseType() + " # " + capLicense.getLicenseNbr():""));
		cancel = true;
	}
	//update ASI Housing Units based on Additional Info Housing Units
	editAppSpecific("Number of Units", houseCount);
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}
