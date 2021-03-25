try {
	// LPAB:Building/*/*/*
	var jobCostMaxValueMap = {
		"A - Unlimited": null,
		"B - Up to $120,000/permit. $750,000 per year": 120000,
		"C - Up to $10,000/permit. $150,000 per year": 10000,
		"C - Up to $10,000/permit. $150" : 10000,
		"Tradesman - Up to $1,000/permit": 1000,
		"A": null,
		"B": 120000,
		"C": 10000,
		"Tradesman": 1000
	};

	var jobCostMax = null;
	if (LicProfModel && LicProfModel != "") {
		var jobCostRank = LicProfModel.getSalutation();
		logDebug("jobCostRank: " + jobCostRank);
		if (jobCostRank && typeof (jobCostMaxValueMap[jobCostRank]) != "undefined")
			jobCostMax = jobCostMaxValueMap[jobCostRank];
		if (jobCostRank && !jobCostMax) {
			var jobCostRank = jobCostRank.split(" ")[0];
			logDebug("jobCostRank: " + jobCostRank);
			if (jobCostRank && typeof (jobCostMaxValueMap[jobCostRank]) != "undefined")
				jobCostMax = jobCostMaxValueMap[jobCostRank];
		}
		logDebug("LicProfModel[" + i + "]: "
			+ ", Lic #: " + LicProfModel.getLicenseNbr()
			+ ", Type: " + LicProfModel.getLicenseType()
			+ ", Flag: " + LicProfModel.getTypeFlag()
			+ ", Rank: " + LicProfModel.getSalutation()
			+ ", jobCostRank: " + jobCostRank
			+ ", jobCostMax: " + jobCostMax
			+ ", estValue: " + estValue
		//  + (i == 0 && LicProfModel? br + describe_TPS(LicProfModel):"")
		);
	}
	else logDebug("There are no LPs");

	if (estValue != null && jobCostMax != null && estValue > jobCostMax) {
		showMessage = true;
		comment("Estimated Cost of Construction (" + estValue + ") is over their Rank limit: " + jobCostMax);
		cancel = true;
	}
} catch (err) {
logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}