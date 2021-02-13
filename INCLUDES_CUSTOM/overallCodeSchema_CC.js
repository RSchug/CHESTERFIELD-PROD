function overallCodeSchema_CC() {
// 56p Community/Subdivision/Development/Section Codes are generated at time of Fees Received or Fees Waived - logic based on CODE SchemaDesign for GIS spreadsheet.
// Number(s) should be generatee, with padded 0 at the beginning.  No duplicates number for another active record.For: Planning/Subdivision/ Preliminary - OverallConceptualPlan - ConstructionPlan 
//  and Planning/SitePlan/ -> Schematics - Major - Minor  -  01-19-21 db added this as function, and it is called in the WTUA and PRA - and they should not overwrite each other.	
try {
	var ComCodeName = "Community Code";
	if (AInfo[ComCodeName] > 1) {
		logDebug('Community Code Already Exists: ' + AInfo[ComCodeName]);
	} else {
		var seq1CodeName = null;
		if (appMatch('*/Subdivision/Preliminary/*') || appMatch('*/Subdivision/OverallConceptualPlan/*') || appMatch('*/SitePlan/Schematics/*') || appMatch('*/SitePlan/Major/*')) {
			seq1CodeName = "Community Code";
			if (seq1CodeName && typeof(AInfo[ComCodeName]) != "undefined") {
				AInfo[ComCodeName] = generateCommunityCode(ComCodeName);
				if (AInfo[ComCodeName] < 10) {
					AInfo[ComCodeName] = '00' + AInfo[ComCodeName];
				} else if (AInfo[ComCodeName] < 100) {
					AInfo[ComCodeName] = '0' + AInfo[ComCodeName];
				} else if (AInfo[ComCodeName] < 1000) {
					AInfo[ComCodeName] = AInfo[ComCodeName];
				} else if (AInfo[ComCodeName] < 1000) {
					AInfo[ComCodeName] = 'Incorrect Code Value';
				}
				logDebug(ComCodeName + ": " + AInfo[ComCodeName]);
				editAppSpecific(ComCodeName, AInfo[ComCodeName]);
			}
		}
	}

	var SubCodeName = "Subdivision Code";
	if (AInfo[SubCodeName] > 1) {
		logDebug('Subdivision Code Already Exists: ' + AInfo[SubCodeName]);
	} else {
		var seq2CodeName = null;
		if (appMatch('*/Subdivision/ConstructionPlan/*') || appMatch('*/Subdivision/Preliminary/*') || (appMatch('*/SitePlan/Major/*') && AInfo['Mixed Use'] == "Yes" && (AInfo['Multi-Family (MF)'] == 'CHECKED'
					 || AInfo['Residential Construction Plan (CP)'] == 'CHECKED'))) {
			seq2CodeName = "Subdivision Code";
			if (seq2CodeName && typeof(AInfo[SubCodeName]) != "undefined") {
				AInfo[SubCodeName] = generateSubdivCode(SubCodeName);
				if (AInfo[SubCodeName] < 100) {
					AInfo[SubCodeName] = '000' + AInfo[SubCodeName];
				} else if (AInfo[SubCodeName] < 1000) {
					AInfo[SubCodeName] = '00' + AInfo[SubCodeName];
				} else if (AInfo[SubCodeName] < 10000) {
					AInfo[SubCodeName] = '0' + AInfo[SubCodeName];
				} else if (AInfo[SubCodeName] < 100000) {
					AInfo[SubCodeName] = AInfo[SubCodeName];
				} else if (AInfo[SubCodeName] > 100000) {
					AInfo[SubCodeName] = 'Incorrect Code Value';
				}
				logDebug(SubCodeName + ": " + AInfo[SubCodeName]);
				editAppSpecific(SubCodeName, AInfo[SubCodeName]);
			}
		}
	}

	var DevCodeName = "Development Code";
	if (AInfo[DevCodeName] > 1) {
		logDebug('Development Code Already Exists: ' + AInfo[DevCodeName]);
	} else {
		var seq3CodeName = null;
		if (appMatch('*/SitePlan/Minor/*') || appMatch('*/SitePlan/Major/*')) {
			seq3CodeName = "Development Code";
			if (seq3CodeName && typeof(AInfo[DevCodeName]) != "undefined") {
				AInfo[DevCodeName] = generateDevCode(DevCodeName);
				if (AInfo[DevCodeName] < 100) {
					AInfo[DevCodeName] = '000' + AInfo[DevCodeName];
				} else if (AInfo[DevCodeName] < 1000) {
					AInfo[DevCodeName] = '00' + AInfo[DevCodeName];
				} else if (AInfo[DevCodeName] < 10000) {
					AInfo[DevCodeName] = '0' + AInfo[DevCodeName];
				} else if (AInfo[DevCodeName] < 100000) {
					AInfo[DevCodeName] = AInfo[DevCodeName];
				} else if (AInfo[DevCodeName] > 100000) {
					AInfo[DevCodeName] = 'Incorrect Code Value';
				}
				logDebug(DevCodeName + ": " + AInfo[DevCodeName]);
				editAppSpecific(DevCodeName, AInfo[DevCodeName]);
			}
		}
	}

	var SecCodeName = "Section Code";
	if (AInfo[SecCodeName] > 1) {
		logDebug('Section Code Already Exists: ' + AInfo[SecCodeName]);
	} else {
		var seq4CodeName = null;
		if (appMatch('*/Subdivision/ConstructionPlan/*')) {
			seq4CodeName = "Section Code";
			if (seq4CodeName && typeof(AInfo[SecCodeName]) != "undefined") {
				AInfo[SecCodeName] = generateSecCode(SecCodeName);
				if (AInfo[SecCodeName] < 10) {
					AInfo[SecCodeName] = '0' + AInfo[SecCodeName];
				} else if (AInfo[SecCodeName] < 100) {
					AInfo[SecCodeName] = AInfo[SecCodeName];
				} else if (AInfo[SecCodeName] > 100) {
					AInfo[SecCodeName] = 'Incorrect Code Vaule';
				}
				logDebug(SecCodeName + ": " + AInfo[SecCodeName]);
				editAppSpecific(SecCodeName, AInfo[SecCodeName]);
			}
		}
	}

	var SubIDName = "Subdivision ID";
	if (AInfo[SubIDName] > 1) {
		logDebug('Subdivision ID Already Exists: ' + AInfo[SubIDName]);
	} else {
		var seq5CodeName = null;
		if (appMatch('*/Subdivision/Final Plat/*')) {
			seq5CodeName = "Subdividion ID";
			if (seq5CodeName && typeof(AInfo[SubIDName]) != "undefined") {
				AInfo[SubIDName] = AInfo[ComCodeName] + '-' + AInfo[SubCodeName] + '-' + AInfo[SecCodeName];
				logDebug(SubIDName + ": " + AInfo[SubIDName]);
				editAppSpecific(SubIDName, AInfo[SubIDName]);
			} else { {
					AInfo[SubIDName] = 'Incorrect Code Vaule';
				}
			}
		}
	}
} catch (err) {
	logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}
}