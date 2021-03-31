try {
//07-2020 Boucher 11p  and 82p - updated per Word Doc on 9-2020 - 02-2021 Updated because business days does not work in dateAdd function
// for all Planning records - updating the Reviewers Due date based on the Special Consideration field, only those active Reviews (can get overwritten by TRC Set Hearing Date)
	if (matches(wfTask,'Review Distribution') && matches(wfStatus,'Routed for Review','Routed for Commercial Review','Routed for Residential Review','Routed for Residential and Commercial','Routed for Towers Review','Manual Routing')) {
		if ((appMatch('*/Subdivision/*/*') || appMatch('*/SitePlan/*/*')) && !appMatch('*/*/Minor/*') &&  !appMatch('*/*/Final Plat/*') && !appMatch('*/*/ParcelAcreage/*')) {
			var workflowTasks = aa.workflow.getTasks(capId).getOutput();
			var taskAuditArray = ['Airport Review','Assessor Review','Building Inspection Review','Budget and Management Review','Community Enhancement Review','County Library Review','Chesterfield Historical Society Review','Health Department Review','CDOT Review','Economic Development Review','Environmental Engineering Review','Fire and Life Safety Review','GIS-EDM Utilities Review','GIS-IST Review','Parks and Recreation Review','Planning Review','Police Review','Real Property Review','Schools Research and Planning Review','County Attorney Review','Utilities Review','VDOT Review','Water Quality Review'];
			for (var ind in taskAuditArray) {
				var wfaTask = taskAuditArray[ind];
				for (var i in workflowTasks) {
					var wfbTask = workflowTasks[i];
					if (wfbTask.getActiveFlag() == 'Y') {
						if (wfaTask == wfbTask.getTaskDescription()) {
							if (AInfo['Special Consideration'] == 'Expedited') {
							editTaskDueDate(wfbTask.getTaskDescription(),dateAdd(null,14));
							} else if (AInfo['Special Consideration'] == 'Fast Track') {
							editTaskDueDate(wfbTask.getTaskDescription(),dateAdd(null,7));
							} else if (AInfo['Special Consideration'] == 'Regular') {
							editTaskDueDate(wfbTask.getTaskDescription(),dateAdd(null,21));
							}
						else { editTaskDueDate(wfbTask.getTaskDescription(),dateAdd(null,21)); }
						}
					}
				}
			}
		}
	//1P and 6p Activate Adhoc Tasks that are not Active based on above Rev Distribution Status - 8/2020 change, add 'Manual Routing' and chuncked it up into Record groupings
		if (appMatch('*/LandUse/*/*') && !appMatch('*/LandUse/CertificateofAppropriateness/*') && !appMatch('*/LandUse/WrittenDetermination/*') && !appMatch('*/LandUse/ZoningOpinion/*')) {
			
			if (!isTaskActive("Public Notices") && !isTaskComplete_TPS("Public Notices")) {
				addAdHocTask_TPS("ADHOC_WF","Public Notices","");
			}
			if (isTaskComplete_TPS("Public Notices")) {
				activateTask("Public Notices");
			}
			if (!isTaskActive("Adjacents") && !isTaskComplete_TPS("Adjacents")){
				addAdHocTask_TPS("ADHOC_WF","Adjacents","");
			}
			if (isTaskComplete_TPS("Adjacents")) {
				activateTask("Adjacents");
			}
			if (!isTaskActive("IVR Message") && !isTaskComplete_TPS("IVR Message")){
				addAdHocTask_TPS("ADHOC_WF","IVR Message","");
			}
			if (isTaskComplete_TPS("IVR Message")) {
				activateTask("IVR Message");
			}			
			if (!isTaskActive("Sign Posting") && !isTaskComplete_TPS("Sign Posting")){
				addAdHocTask_TPS("ADHOC_WF","Sign Posting","");
			}
			if (isTaskComplete_TPS("Sign Posting")) {
				activateTask("Sign Posting");
			}
	//Only AdminVariance does not have Maps ad hoc		
			if (!appMatch('*/*/AdminVariance/*')) {
				if (!isTaskActive("Maps") && !isTaskComplete_TPS("Maps")){
					addAdHocTask_TPS("ADHOC_WF","Maps","");
				}
				if (isTaskComplete_TPS("Maps")) {
					activateTask("Maps");
				}
			}
			if (appMatch('*/*/ZoningCase/*') || appMatch('*/*/SubstantialAccord/*') || appMatch('*/*/HistoricPreservation/*')) {
				if (!isTaskActive("CPC Staff Report") && !isTaskComplete_TPS("CPC Staff Report")){
					addAdHocTask_TPS("ADHOC_WF","CPC Staff Report","");
				}
				if (isTaskComplete_TPS("CPC Staff Report")) {
					activateTask("CPC Staff Report");
				}
				if (!isTaskActive("BOS Staff Report") && !isTaskComplete_TPS("BOS Staff Report")){
					addAdHocTask_TPS("ADHOC_WF","BOS Staff Report","");
				}
				if (isTaskComplete_TPS("BOS Staff Report")) {
					activateTask("BOS Staff Report");
				}
			}
			if (appMatch('*/*/ManufacturedHomes/*') || appMatch('*/*/RPAException/*')) {
				if (!isTaskActive("BOS Staff Report") && !isTaskComplete_TPS("BOS Staff Report")){
					addAdHocTask_TPS("ADHOC_WF","BOS Staff Report","");
					activateTask("BOS Hearing");
				}
				if (isTaskComplete_TPS("BOS Staff Report")) {
					activateTask("BOS Staff Report");
				}
			}
			if (appMatch('*/*/Appeal/*') || appMatch('*/*/Variance/*') || appMatch('*/*/SpecialException/*')) {
				if (!isTaskActive("BZA Staff Report") && !isTaskActive("BZA Hearing")){
					activateTask("BZA Staff Report");
					activateTask("BZA Hearing");
				}
			}
		}
		else if (appMatch('*/SitePlan/Major/*') || appMatch('*/SitePlan/Schematics/*') || appMatch('*/Subdivision/ConstructionPlan/*') || appMatch('*/Subdivision/ExceptiontoPreliminary/*') 
		      || appMatch('*/Subdivision/OverallConceptualPlan/*') || appMatch('*/Subdivision/Preliminary/*')) {
				  
			if (!isTaskActive("IVR Message") && !isTaskComplete_TPS("IVR Message")){
				addAdHocTask_TPS("ADHOC_WF","IVR Message","");
			}
			if (isTaskComplete_TPS("IVR Message")) {
				activateTask("IVR Message");
			}
			if (!isTaskActive("Sign Posting") && !isTaskComplete_TPS("Sign Posting")){
				addAdHocTask_TPS("ADHOC_WF","Sign Posting","");
			}
			if (isTaskComplete_TPS("Sign Posting")) {
				activateTask("Sign Posting");
			}
			if (appMatch('*/SitePlan/Major/*') && AInfo['Review Type'] == 'Administrative Review') {
				if (!isTaskActive("Public Notices") && !isTaskComplete_TPS("Public Notices")) {
					addAdHocTask_TPS("ADHOC_WF","Public Notices","");
				}
				if (isTaskComplete_TPS("Public Notices")) {
					activateTask("Public Notices");
				}				
				if (!isTaskActive("Adjacents") && !isTaskComplete_TPS("Adjacents")){
					addAdHocTask_TPS("ADHOC_WF","Adjacents","");
				}
				if (isTaskComplete_TPS("Adjacents")) {
					activateTask("Adjacents");
				}
			}
			else if (AInfo['Review Type'] == 'Planning Commission Public Hearing') {
				if (!isTaskActive("Public Notices") && !isTaskComplete_TPS("Public Notices")) {
					addAdHocTask_TPS("ADHOC_WF","Public Notices","");
				}
				if (isTaskComplete_TPS("Public Notices")) {
					activateTask("Public Notices");
				}				
				if (!isTaskActive("Adjacents") && !isTaskComplete_TPS("Adjacents")){
					addAdHocTask_TPS("ADHOC_WF","Adjacents","");
				}
				if (isTaskComplete_TPS("Adjacents")) {
					activateTask("Adjacents");
				}
				if (!isTaskActive("Maps") && !isTaskComplete_TPS("Maps")){
					addAdHocTask_TPS("ADHOC_WF","Maps","");
				}
				if (isTaskComplete_TPS("Maps")) {
					activateTask("Maps");
				}
				if (!isTaskActive("CPC Staff Report") && !isTaskComplete_TPS("CPC Staff Report")){
					addAdHocTask_TPS("ADHOC_WF","CPC Staff Report","");
				}
				if (isTaskComplete_TPS("CPC Staff Report")) {
					activateTask("CPC Staff Report");
				}
			}
		}
	
	//09-2020 Boucher per the ELM Planning DueDate Doc and in chart for Admin Review and these record types update ad hoc due dates - and based on Rev Dist. and Routed from above
	//02-2021 Removed the Business day call on the dateAdd function
		if (AInfo['Review Type'] == 'Administrative Review') {
			
			if (appMatch('*/SitePlan/Major/*') || appMatch('*/SitePlan/Schematics/*')) {
				if (isTaskActive('Public Notices')) {
					editTaskDueDate('Public Notices', dateAdd(getTaskDueDate('Review Distribution'),3));
				}
				if (isTaskActive('Adjacents')) {
					editTaskDueDate('Adjacents', dateAdd(getTaskDueDate('Review Distribution'),5));
				}
				if (isTaskActive('IVR Message')) {
					editTaskDueDate('IVR Message', dateAdd(getTaskDueDate('Review Distribution'),6));
				}
				if (isTaskActive('Sign Posting')) {
					editTaskDueDate('Sign Posting', dateAdd(getTaskDueDate('Review Distribution'),7));
				}
			}
			else if (appMatch('*/Subdivision/ConstructionPlan/*') || appMatch('*/Subdivision/ExceptiontoPreliminary/*') || appMatch('*/Subdivision/OverallConceptualPlan/*') || appMatch('*/Subdivision/Preliminary/*')) {
				if (isTaskActive('IVR Message')) {
					editTaskDueDate('IVR Message', dateAdd(getTaskDueDate('Review Distribution'),6));
				}
				if (isTaskActive('Sign Posting')) {
					editTaskDueDate('Sign Posting', dateAdd(getTaskDueDate('Review Distribution'),7));
				}
			}
		}
		if (appMatch("*/*/AdminVariance/*")) {	
			if (isTaskActive('Public Notices')) {
				editTaskDueDate('Public Notices', dateAdd(getTaskDueDate('Review Distribution'),13));
			}
			if (isTaskActive('Adjacents')) {
				editTaskDueDate('Adjacents', dateAdd(getTaskDueDate('Review Distribution'),13));
			}
			if (isTaskActive('IVR Message')) {
				editTaskDueDate('IVR Message', dateAdd(getTaskDueDate('Review Distribution'),13));
			}
			if (isTaskActive('Sign Posting')) {
				editTaskDueDate('Sign Posting', dateAdd(getTaskDueDate('Review Distribution'),13));
			}
		}
	}

//09-2020 Boucher per ELM Planning DueDates for any record with TRC - No due dates are updated for Staff and Developer Meeting
	if (matches(wfTask,'Technical Review Committee','Pre-Application Meeting','Staff and Developer Meeting') && matches(wfStatus,'Set Hearing Date','Set Meeting Date')) {
		var workflowTasks = aa.workflow.getTasks(capId).getOutput();
		var taskAuditArray = ['Airport Review','Assessor Review','Building Inspection Review','Budget and Management Review','Community Enhancement Review','County Library Review','Chesterfield Historical Society Review','Health Department Review','CDOT Review','Economic Development Review','Environmental Engineering Review','Fire and Life Safety Review','GIS-EDM Utilities Review','GIS-IST Review','Parks and Recreation Review','Planning Review','Police Review','Real Property Review','Schools Research and Planning Review','County Attorney Review','Utilities Review','VDOT Review','Water Quality Review'];
		for (var ind in taskAuditArray) {
			var wfaTask = taskAuditArray[ind];
			for (var i in workflowTasks) {
				var wfbTask = workflowTasks[i];
				if (wfbTask.getActiveFlag() == 'Y' && wfTask == 'Technical Review Committee') {
					if (wfaTask == wfbTask.getTaskDescription()) {
						editTaskDueDate(wfbTask.getTaskDescription(),dateAdd(getTaskDueDate('Technical Review Committee'),3));
					}
				}
				else if (wfbTask.getActiveFlag() == 'Y' && wfTask == 'Pre-Application Meeting') {
					if (wfaTask == wfbTask.getTaskDescription()) {
						editTaskDueDate(wfbTask.getTaskDescription(),dateAdd(getTaskDueDate('Pre-Application Meeting'),-1));
					}
				}
			}
		}
	}

//07-2020 Boucher 21p  using ELM Planning Due Date Doc for setting Due Dates on Ad Hocs
	if (matches(wfTask,'CPC Hearing') && matches(wfStatus,'Set Hearing Date','Set Meeting Date')) {
		if (appMatch('*/LandUse/ZoningCase/*') || appMatch('*/LandUse/HistoricPreservation/*') || appMatch('*/LandUse/SubstantialAccord/*')) {
			if (isTaskActive('Maps')) {
				editTaskDueDate('Maps', dateAdd(getTaskDueDate('CPC Hearing'),-35));
			}
			if (isTaskActive('Public Notices')) {
				editTaskDueDate('Public Notices', dateAdd(getTaskDueDate('CPC Hearing'),-34));
			}
			if (isTaskActive('Adjacents')) {
				editTaskDueDate('Adjacents', dateAdd(getTaskDueDate('CPC Hearing'),-28));
			}
			if (isTaskActive('IVR Message')) {
				editTaskDueDate('IVR Message', dateAdd(getTaskDueDate('CPC Hearing'),-23));
			}
			if (isTaskActive('Sign Posting')) {
				editTaskDueDate('Sign Posting', dateAdd(getTaskDueDate('CPC Hearing'),-22));
			}
			if (isTaskActive('CPC Staff Report')) {
				editTaskDueDate('CPC Staff Report', dateAdd(getTaskDueDate('CPC Hearing'),-15));
			}
			if (appMatch('*/LandUse/HistoricPreservation/*') && isTaskActive('HPC Hearing')) {
				editTaskDueDate('HPC Hearing', dateAdd(getTaskDueDate('CPC Hearing'),0));
			}
		}
	//These Due Date timing are the same as above, but split out so if there is any changes
		else if ((appMatch('*/SitePlan/Major/*') || appMatch('*/SitePlan/Schematics/*') || appMatch('*/Subdivision/ConstructionPlan/*') || appMatch('*/Subdivision/ExceptiontoPreliminary/*') 
		      || appMatch('*/Subdivision/OverallConceptualPlan/*') || appMatch('*/Subdivision/Preliminary/*')) && AInfo['Review Type'] == 'Planning Commission Public Hearing') {
			if (isTaskActive('Maps')) {
				editTaskDueDate('Maps', dateAdd(getTaskDueDate('CPC Hearing'),-35));
			}
			if (isTaskActive('Public Notices')) {
				editTaskDueDate('Public Notices', dateAdd(getTaskDueDate('CPC Hearing'),-34));
			}
			if (isTaskActive('Adjacents')) {
				editTaskDueDate('Adjacents', dateAdd(getTaskDueDate('CPC Hearing'),-28));
			}
			if (isTaskActive('IVR Message')) {
				editTaskDueDate('IVR Message', dateAdd(getTaskDueDate('CPC Hearing'),-23));
			}
			if (isTaskActive('Sign Posting')) {
				editTaskDueDate('Sign Posting', dateAdd(getTaskDueDate('CPC Hearing'),-22));
			}
			if (isTaskActive('CPC Staff Report')) {
				editTaskDueDate('CPC Staff Report', dateAdd(getTaskDueDate('CPC Hearing'),-15));
			}
		}	  
	}
//per the ELM Planning Due Dates Doc
	if (matches(wfTask,'BOS Hearing') && matches(wfStatus,'Set Hearing Date') && !matches(capStatus, 'Deferred from BOS','Deferred')) {
		if (appMatch('*/LandUse/ZoningCase/*') || appMatch('*/LandUse/HistoricPreservation/*') || appMatch('*/LandUse/SubstantialAccord/*')) {
			
			if (isTaskActive('Public Notices')) {
				editTaskDueDate('Public Notices', dateAdd(getTaskDueDate('CPC Hearing'),1));
			}
			if (isTaskActive('Adjacents')) {
				editTaskDueDate('Adjacents', dateAdd(getTaskDueDate('CPC Hearing'),2));
			}
			if (isTaskActive('IVR Message')) {
				editTaskDueDate('IVR Message', dateAdd(getTaskDueDate('CPC Hearing'),6));
			}
			if (isTaskActive('BOS Staff Report')) {
				editTaskDueDate('BOS Staff Report', dateAdd(getTaskDueDate('CPC Hearing'),6));
			}
		}
		else if (appMatch('*/LandUse/ManufacturedHomes/*') || appMatch('*/LandUse/RPAException/*')) {
			if (isTaskActive('Maps')) {
				editTaskDueDate('Maps', dateAdd(getTaskDueDate('BOS Hearing'),-35));
			}
			if (isTaskActive('Public Notices')) {
				editTaskDueDate('Public Notices', dateAdd(getTaskDueDate('BOS Hearing'),-30));
			}
			if (isTaskActive('Adjacents')) {
				editTaskDueDate('Adjacents', dateAdd(getTaskDueDate('BOS Hearing'),-28));
			}
			if (isTaskActive('IVR Message')) {
				editTaskDueDate('IVR Message', dateAdd(getTaskDueDate('BOS Hearing'),-23));
			}
			if (isTaskActive('Sign Posting')) {
				editTaskDueDate('Sign Posting', dateAdd(getTaskDueDate('BOS Hearing'),-22));
			}
			if (isTaskActive('BOS Staff Report')) {
				editTaskDueDate('BOS Staff Report', dateAdd(getTaskDueDate('BOS Hearing'),-26));
			}	
		}
	} else if (matches(wfTask,'BOS Hearing') && matches(wfStatus,'Set Deferral Hearing Date')) {
		if (appMatch('*/LandUse/ZoningCase/*') || appMatch('*/LandUse/HistoricPreservation/*') || appMatch('*/LandUse/SubstantialAccord/*')) {
			if (isTaskActive('Public Notices')) {
				editTaskDueDate('Public Notices', dateAdd(getTaskDueDate('BOS Hearing'),-30));
			}
			if (isTaskActive('Adjacents')) {
				editTaskDueDate('Adjacents', dateAdd(getTaskDueDate('BOS Hearing'),-28));
			}
			if (isTaskActive('IVR Message')) {
				editTaskDueDate('IVR Message', dateAdd(getTaskDueDate('BOS Hearing'),-23));
			}
			if (isTaskActive('BOS Staff Report')) {
				editTaskDueDate('BOS Staff Report', dateAdd(getTaskDueDate('BOS Hearing'),-26));
			}
		}
	}
	
//per the ELM Planning Due Dates Doc
	if (matches(wfTask,'BZA Hearing') && matches(wfStatus,'Set Hearing Date')) {
		if (appMatch("*/*/Variance/*") || appMatch("*/*/SpecialException/*") || appMatch("*/*/Appeal/*")) {
			if (isTaskActive('Maps')) {
				editTaskDueDate('Maps', dateAdd(getTaskDueDate('BZA Hearing'),-35));
			}
			if (isTaskActive('Public Notices')) {
				editTaskDueDate('Public Notices', dateAdd(getTaskDueDate('BZA Hearing'),-26));
			}
			if (isTaskActive('Adjacents')) {
				editTaskDueDate('Adjacents', dateAdd(getTaskDueDate('BZA Hearing'),-22));
			}
			if (isTaskActive('IVR Message')) {
				editTaskDueDate('IVR Message', dateAdd(getTaskDueDate('BZA Hearing'),-26));
			}
			if (isTaskActive('Sign Posting')) {
				editTaskDueDate('Sign Posting', dateAdd(getTaskDueDate('BZA Hearing'),-22));
			}
			if (isTaskActive('BZA Staff Report')) {
				editTaskDueDate('BZA Staff Report', dateAdd(getTaskDueDate('BZA Hearing'),-12));
			}
		}
		else if (appMatch("*/*/AdminVariance/*")) {
			if (isTaskActive('Public Notices')) {
				editTaskDueDate('Public Notices', dateAdd(getTaskDueDate('BZA Hearing'),13));
			}
			if (isTaskActive('Adjacents')) {
				editTaskDueDate('Adjacents', dateAdd(getTaskDueDate('BZA Hearing'),13));
			}
			if (isTaskActive('IVR Message')) {
				editTaskDueDate('IVR Message', dateAdd(getTaskDueDate('BZA Hearing'),13));
			}
			if (isTaskActive('Sign Posting')) {
				editTaskDueDate('Sign Posting', dateAdd(getTaskDueDate('BZA Hearing'),13));
			}
		}
	}

//4.1P and 5p and 9p and 95p any Hearing task and Denial or Approval or deferred is submitted then activate the Hearing task, and follow ELM Planning Due Date doc for ad hocs
	if (matches(wfTask,'CPC Hearing','Review Distribution') && matches(wfStatus,'Deferred','Remanded','Deferred by Applicant','Deferred by CPC') && matches(capStatus, 'Deferred from CPC','Deferred')){
		activateTask("CPC Hearing");
		//if (wfTask == 'CPC Hearing') {
		//	editTaskDueDate('CPC Hearing', getTaskDueDate('CPC Hearing'));
		//}
	}
	if (matches(wfTask,'BOS Hearing','Review Distribution') && matches(wfStatus,'Deferred','Remanded','Deferred by Applicant','Deferred by BOS','Deferred from BOS') && matches(capStatus, 'Deferred from BOS','Deferred')){
		activateTask("BOS Hearing");
	}
	if (wfTask == 'BZA Hearing' && matches(wfStatus,'Deferred','Remanded','Deferred by Applicant','Deferred by BZA') && matches(capStatus, 'Deferred from BZA','Deferred')){
		activateTask("BZA Hearing");
	}
	
//07-2020 Boucher 40p - Land use Record do not have submittal count
	if (matches(wfTask,'Review Distribution') && matches(wfStatus,'Revisions Received') && AInfo['Submittal Count'] != null) {
		var subNum = parseInt(AInfo['Submittal Count']) + 1;
		editAppSpecific('Submittal Count',subNum);
	}
	
//33.1p
	if (matches(wfTask, 'Administrative Approval','BZA Hearing','BOS Hearing','Administrative Outcome','CPC Hearing') && matches(wfStatus, 'Final Approval','Approved','Denied','CPC Approved','CPC Approved with Admin Review','CPC Denied')) {
		if (AInfo['No Time Limit'] != 'CHECKED'){
		var ApprovedTimeLimit = AInfo['Approved Time Limit'];
		var BlankExpireDate = AInfo['Expiration Date'];
		var months = 12 * Number(ApprovedTimeLimit);
			if(BlankExpireDate == null || BlankExpireDate == "") {
				var NewExpireDate = dateAddMonths(dateAdd(null,0),months);
			}
			if(BlankExpireDate != null && BlankExpireDate != "") {
				var NewExpireDate = dateAddMonths(BlankExpireDate,months);
			}
			editAppSpecific("Expiration Date",NewExpireDate);
		}
	}
	if (matches(wfTask,'Review Consolidation') && matches(wfStatus,'Move to CPC')) {
		if (appMatch('*/SitePlan/Major/*') || appMatch('*/SitePlan/Schematics/*') || appMatch('*/Subdivision/ConstructionPlan/*') || appMatch('*/Subdivision/ExceptiontoPreliminary/*') 
		      || appMatch('*/Subdivision/OverallConceptualPlan/*') || appMatch('*/Subdivision/Preliminary/*')) {
				  
			if (!isTaskActive("Public Notices") && !isTaskComplete_TPS("Public Notices")) {
				addAdHocTask_TPS("ADHOC_WF","Public Notices","");
			}
			if (isTaskComplete_TPS("Public Notices")) {
				activateTask("Public Notices");
			}				
			if (!isTaskActive("Adjacents") && !isTaskComplete_TPS("Adjacents")){
				addAdHocTask_TPS("ADHOC_WF","Adjacents","");
			}
			if (isTaskComplete_TPS("Adjacents")) {
				activateTask("Adjacents");
			}
			if (!isTaskActive("Maps") && !isTaskComplete_TPS("Maps")){
				addAdHocTask_TPS("ADHOC_WF","Maps","");
			}
			if (isTaskComplete_TPS("Maps")) {
				activateTask("Maps");
			}
			if (!isTaskActive("CPC Staff Report") && !isTaskComplete_TPS("CPC Staff Report")){
				addAdHocTask_TPS("ADHOC_WF","CPC Staff Report","");
			}
			if (isTaskComplete_TPS("CPC Staff Report")) {
				activateTask("CPC Staff Report");
			}
		}
	}
	if (wfStatus == "Ready for Payment" || wfStatus == "First Glance Review Complete" || (appMatch("*/Subdivision/ExceptiontoPreliminary/*") && wfStatus == "Accepted") || (appMatch("*/LandUse/WrittenDetermination/*") && wfStatus == "Calculate Fees")) {
		emailReadyforPayment();	
	}	
// -------->  FEES <------------
	if ((appMatch("Planning/SitePlan/Major/NA")) && ((wfTask.equals("Review Consolidation") && matches(wfStatus,'RR-Revisions Requested','RR-Substantial Approval','RR-Table Review','RR-Staff and Developer Meeting')) && ((AInfo['Submittal Count'] > 2) && (AInfo['Waive Submittal Fee'] != 'CHECKED')))) {
		addFee('SITEPLAN2','CC-PLANNING','FINAL',1,'Y');
		emailReadyforPayment();
	}
	if ((appMatch("Planning/Subdivision/OverallConceptualPlan/NA")) && ((wfTask.equals("Review Consolidation") && matches(wfStatus,'RR-Revisions Requested','RR-Substantial Approval','RR-Table Review','RR-Staff and Developer Meeting')) && ((AInfo['Submittal Count'] > 2) && (AInfo['Waive Submittal Fee'] != 'CHECKED')))) {
		addFee('OCPLAN2','CC-PLANNING','FINAL',1,'Y');
		emailReadyforPayment();
	}
	if ((appMatch("Planning/Subdivision/ConstructionPlan/NA")) && ((wfTask.equals("Review Consolidation") && matches(wfStatus,'RR-Revisions Requested','RR-Substantial Approval','RR-Table Review','RR-Staff and Developer Meeting')) && ((AInfo['Submittal Count'] > 2) && (AInfo['Waive Submittal Fee'] != 'CHECKED')))) {
		addFee('CONSTPLAN2','CC-PLANNING','FINAL',1,'Y');
		emailReadyforPayment();
	}
	if (appMatch("Planning/Subdivision/ConstructionPlan/NA") && (wfTask.equals("Review Consolidation") && matches(wfStatus,'RR-Table Review'))) {
		addFee('CONSTPLAN3','CC-PLANNING','FINAL',1,'Y');
		emailReadyforPayment();
	}

//07-2020 Boucher 24p
	if (matches(wfTask, 'CPC Meeting', 'CPC Hearing') && matches(wfStatus, 'Deferred by Applicant')) {
		var tasksHistory = getWorkflowHistory_TPS(wfTask, wfStatus, null, capId);
		logDebug("tasksHistory(" + wfTask + "," + wfStatus + "): " + tasksHistory.length);
		var feeSchedule = "CC-PLANNING", feeCode = "DEFERRALPC", feeQty = 1;
		if (tasksHistory && tasksHistory.length > 1) {
			feeQty = 2
		}
		logDebug("Adding fee: " + feeSchedule + "." + feeCode + ", Qty:" + feeQty);
		addFee(feeCode, feeSchedule, 'FINAL', feeQty, 'Y');
	}

	//When 'BOS Hearing' is "Deferred by Applicant" add DEFERRALBOS fee with 1 for first and 2 for each after first
	if (matches(wfTask, 'BOS Hearing') && matches(wfStatus, 'Deferred by Applicant')) {
		var tasksHistory = getWorkflowHistory_TPS(wfTask, wfStatus, null, capId);
		logDebug("tasksHistory(" + wfTask + "," + wfStatus + "): " + tasksHistory.length);
		var feeSchedule = "CC-PLANNING", feeCode = "DEFERRALBOS", feeQty = 1;
		if (tasksHistory && tasksHistory.length > 1) {
			feeQty = 2
		}
		logDebug("Adding fee: " + feeSchedule + "." + feeCode + ", Qty:" + feeQty);
		addFee(feeCode, feeSchedule, 'FINAL', feeQty, 'Y');
	}
	//When 'BZA Hearing' is "Deferred by Applicant" add DEFERRALBZA fee with 1
	if (matches(wfTask, 'BZA Hearing') && matches(wfStatus, 'Deferred by Applicant')
		&& (appMatch("*/*/Variance/*") || appMatch("*/*/SpecialException/*") || appMatch("*/*/Appeal/*"))) {
		var tasksHistory = getWorkflowHistory_TPS(wfTask, wfStatus, null, capId);
		logDebug("tasksHistory(" + wfTask + "," + wfStatus + "): " + tasksHistory.length);
		var feeSchedule = "CC-PLANNING", feeCode = "DEFERRALBZA", feeQty = 1;
	//Per Business 01-2021 - no qty 2 for these fees.
		//if (tasksHistory && tasksHistory.length > 1) {
		//	feeQty = 2
		//}
		logDebug("Adding fee: " + feeSchedule + "." + feeCode + ", Qty:" + feeQty);
		addFee(feeCode, feeSchedule, 'FINAL', feeQty, 'Y');
	}
	
// 56p db 01-19-21 updated this to a function so it would be called at PRA too.  Based on the code inside the function, it should not overwrite or duplicate the numbers.
	if (matches(wfTask,'Fee Payment') && matches(wfStatus,'Fees Received','Fees Waived','Payment Received')) {
		overallCodeSchema_CC();
	}

// 44P: When Adhoc Workflow Task "Sign Posting" Status 'Signs Removed' is submitted, lookup the Record ID from the Standard Choice list, and then remove the Record ID.
// Makes the 3 digit number available again.This is related to what was done for 10P:
//	On Record Creation: Custom Field Sign Posting Number should be auto populated with a number of 100 - 999.  The number must not be a duplicate number for another active record.
// Sign Posting field should be auto generated number 100 - 999. when a case is active that number should be skipped - no duplicates.The sign post number is a number is related to the IVR prompt that will be recorded so that callers may get case information from calling the number.There is a specific and finite group of numbers that have been identified for the 2 case types. Accela is to provide the next available number from the list.
	if (wfTask == 'Sign Posting' && wfStatus == 'Signs Removed') {
		var seqName = "Sign Posting Number";
		var fieldName = null;
		if (appMatch("Planning/LandUse/ManufacturedHomes/NA") || appMatch("Planning/LandUse/RPAException/NA")) {
			fieldName = seqName;
		} else if (appMatch("Planning/LandUse/*/*")
			&& exists(appTypeArray[2], ["Variance", "AdminVariance", "SpecialExceptions", "HistoricPreservation", "SubstantialAccord", "Utilities Waiver", "ZoningCase"])) {
			fieldName = seqName;
		} else if (appMatch("Planning/Subdivision/ExceptiontoPreliminary/NA") || appMatch("Planning/Subdivision/Preliminary/NA")) {
			fieldName = seqName;
		} else if (appMatch("Planning/SitePlan/Schematics/NA") || appMatch("Planning/SitePlan/Major/NA")) {
			fieldName = seqName;
		}
		if (fieldName && typeof (AInfo[fieldName]) != "undefined") {
			logDebug("Releasing " + fieldName + " " + AInfo[fieldName]);
			editAppSpecific(fieldName, "Removed " + AInfo[fieldName]);
		}
	}
//for all DigEplan processing
	loadCustomScript("WTUA_EXECUTE_DIGEPLAN_SCRIPTS_PLAN");
	
//Create Conditions from proffers table - 59p - moved here 12/2020 for additional tables
	if (wfStatus == 'Create Conditions and Close Case') {
		logDebug("Inside: " + wfStatus);
		var capParcelResult = aa.parcel.getParcelandAttribute(capId,null);
		var Parcels = capParcelResult.getOutput().toArray();
		/*if (Parcels[0]==undefined) {
			cancel = true; showMessage = true; comment("<span class='fontbold font14px'>Error: You do not have a Parcel on this record.</span>");
		} else { */
			var sum = 0;
			var tempAsit = loadASITable("PROFFER CONDITIONS");
			if (tempAsit) {
				for (a in tempAsit) {
					if (tempAsit[a]["Approved"] == 'CHECKED') {
					// added this for the departments that are just going to be on the Parcel with no stoppage
						if (matches(tempAsit[a]["Department"],'Airport','CE','Cnty Attorney','Econ Dev','GIS-IST','Gen Services','Library','Police','Radio Shop','Real Est Assr','School Constr','GIS-EDM','Hist Society','DEQ','US Corps Eng','Water Qual')) {
							var cType = 'RevDepts';
							logDebug("Inside: " + cType);
						} else if(tempAsit[a]["Department"] != null) {
							var cType = tempAsit[a]["Department"];
							logDebug("Inside: " + cType);
						}
						var cDesc = tempAsit[a]["Department"]+' - '+tempAsit[a]["Record Type"];
						var cShortComment = tempAsit[a]["Proffer Condition"];
						var cLongComment = tempAsit[a]["Long Comment"];
						addParcelStdCondition_TPS(null, cType, cDesc, cShortComment, cLongComment);
					}
				} //for all rows
			}
		//}
	}
//Autoemail items
	if (matches(wfStatus, "Additional Information Requested") && !appMatch("Planning/LandUse/ZoningOpinion/NA")) {
		emailPendingApplicantNotification(wfTask, wfStatus)
	}
	
} catch (err) {
	logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}

function emailReadyforPayment() {
    showMessageDefault = showMessage;
    //populate email notification parameters
    var emailSendFrom = "";
    var emailSendTo = "";
    var emailCC = "";
    var emailParameters = aa.util.newHashtable();
    var fileNames = [];

    getRecordParams4Notification(emailParameters);
    getAPOParams4Notification(emailParameters);
    var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
    acaSite = acaSite.substr(0, acaSite.toUpperCase().indexOf("/ADMIN"));
    //getACARecordParam4Notification(emailParameters,acaSite);
    addParameter(emailParameters, "$$acaRecordUrl$$", getACARecordURL(acaSite));
    addParameter(emailParameters, "$$wfComment$$", wfComment);
    addParameter(emailParameters, "$$wfStatus$$", wfStatus);
    addParameter(emailParameters, "$$ShortNotes$$", getShortNotes());

    var applicantEmail = "";
	var applicantName = "";
    var assignedTo = getAssignedToStaff();
    var assignedToEmail = "No email";
    var assignedToFullName = "Not Assigned";
    var contObj = {};
    contObj = getContactArray(capId);
    if (typeof(contObj) == "object") {
        for (co in contObj) {
            if (contObj[co]["contactType"] == "Applicant" && contObj[co]["email"] != null || contObj[co]["contactType"] == "Agent" && contObj[co]["email"] != null || contObj[co]["contactType"] == "Individual" && contObj[co]["email"] != null)
                applicantEmail += contObj[co]["email"] + ";";
				applicantName += contObj[co]["firstName"] + " " + contObj[co]["lastName"] + ",";
        }
    }
    addParameter(emailParameters, "$$applicantEmail$$", applicantEmail);
	addParameter(emailParameters, "$$applicantName$$", applicantName);

    if (!matches(assignedTo,undefined,"",null)) {
        assignedToFullName = aa.person.getUser(assignedTo).getOutput().getFirstName() + " " + aa.person.getUser(assignedTo).getOutput().getLastName();
        if (!matches(aa.person.getUser(assignedTo).getOutput().getEmail(), undefined, "", null)) {
            assignedToEmail = aa.person.getUser(assignedTo).getOutput().getEmail();
        }
    }
    addParameter(emailParameters, "$$assignedToFullName$$", assignedToFullName);
    addParameter(emailParameters, "$$assignedToEmail$$", assignedToEmail);

	//Load the Parcel numbers
	var tempAsit = loadASITable("CC-LU-TPA");
		if (tempAsit) {
			var TaxIDArray = "";
			for (b in tempAsit) {
				if (TaxIDArray == "") {
					TaxIDArray = tempAsit[b]["Tax ID"];
				} else { TaxIDArray = TaxIDArray + ", " + tempAsit[b]["Tax ID"]; }
			}
			addParameter(emailParameters, "$$TaxIdArray$$",TaxIDArray);	
		}
	var emailTemplate = "WTUA_PLANNING_READYFORPAYMENT";
	sendNotification(emailSendFrom, emailSendTo, emailCC, emailTemplate, emailParameters, fileNames);
    }

function addAdHocTask_TPS(adHocProcess, adHocTask, adHocNote) {
//adHocProcess must be same as one defined in R1SERVER_CONSTANT
//adHocTask must be same as Task Name defined in AdHoc Process
//adHocNote can be variable
//Optional 4 parameters = Assigned to User ID must match an AA user
//Optional 5 parameters = CapID
	var thisCap = capId;
	var thisUser = currentUserID;
	if(arguments.length > 3)
		thisUser = arguments[3]
	if(arguments.length > 4)
		thisCap = arguments[4];
	var userObj = aa.person.getUser(thisUser);
	if (!userObj.getSuccess())
	{
		logDebug("Could not find user to assign to");
		return false;
	}
	var taskObj = aa.workflow.getTasks(thisCap).getOutput()[0].getTaskItem()
	taskObj.setProcessCode(adHocProcess);
	taskObj.setTaskDescription(adHocTask);
	taskObj.setDispositionNote(adHocNote);
	taskObj.setProcessID(0);
	//taskObj.setAssignmentDate(aa.util.now());
	taskObj.setDueDate(null);
	//taskObj.setAssignedUser(userObj.getOutput());
	wf = aa.proxyInvoker.newInstance("com.accela.aa.workflow.workflow.WorkflowBusiness").getOutput();
	wf.createAdHocTaskItem(taskObj);
	return true;
} 

/*07-2020 Boucher old 21p 
	if (matches(wfTask,'Review Consolidation','Community Meeting') && matches(wfStatus,'Move to CPC')) {
		var tsi = []
		loadTaskSpecific(tsi);
		if (tsi["CPC Due Date"] != null) {
			if (isTaskActive('Public Notices')) {
				editTaskDueDate('Public Notices',tsi["CPC Due Date"]);
			}
			if (isTaskActive('Adjacents')) {
				editTaskDueDate('Adjacents',tsi["CPC Due Date"]);
			}
			if (isTaskActive('IVR Message')) {
				editTaskDueDate('IVR Message',tsi["CPC Due Date"]);
			}
			if (isTaskActive('Sign Posting')) {
				editTaskDueDate('Sign Posting',tsi["CPC Due Date"]);
			}
			if (isTaskActive('Maps')) {
				editTaskDueDate('Maps',tsi["CPC Due Date"]);
			}
		}
	}*/
//Below is all code from previous implementer - Not sure if these work db
/*
var recordTypesArray = new Array("Planning/Subdivision/ConstructionPlan", "Planning/Subdivision/Preliminary", "Planning/Subdivision/Overall",
		"Planning/Subdivision/Conceptual Plan", "Planning/Subdivision/ExceptiontoPreliminary", "Planning/siteplan/Major", "Planning/siteplan/Minor",
		"Planning/siteplan/Schematics");

var module = appTypeArray[0];
var type = appTypeArray[1];
var subType = appTypeArray[2];
var itemAppTypeString = module + "/" + type + "/" + subType;
var meetingDuration = 60;
var meetingType = "PLANNING COMMISSION HEARING";
var meetingSubject = "Staff and Developer Meetings";

var Priority = AInfo['Special Consideration'];
//Review Consolidation
var TaskTocheckActive = "Review Consolidation";
//Staff and Developer Meeting"
var tasktobeActive = "Staff and Developer Meeting";

for (var i in recordTypesArray) {
	if (itemAppTypeString.equals(recordTypesArray[i])) {
		if (isTaskActive(TaskTocheckActive) && !isTaskActive(tasktobeActive)) {
			activateTask(tasktobeActive);
			if ((Priority == "Fast Track" || "Expedited") && type == "Commercial") {
				editTaskDueDate(tasktobeActive, getDueDate(3, 3));
				scheduleMeeting(getDueDate(3, 3));
			} else if (Priority == "Regular" && type == "Commercial") {
				editTaskDueDate(tasktobeActive, getDueDate(28, 3));
				scheduleMeeting(getDueDate(28, 3));
			} else if ((Priority == "Fast Track" || "Expedited") && type == "Subdivision") {
				editTaskDueDate(tasktobeActive, getDueDate(3, 4));
				scheduleMeeting(getDueDate(3, 4));
			} else if (Priority == "Regular" && type == "Subdivision") {
				editTaskDueDate(tasktobeActive, getDueDate(28, 4));
				scheduleMeeting(getDueDate(28, 4));
			}
		}
	}
}

/**
 * this function to calculate the due date based on the requirement
 * @param numberofDays the minimum days that pass before the meeting is scheduled
 * @param dayId day id that need to get it Ex. 0 is Sunday and 3 is Wednesday
 * Ex.getDueDate(3,3) this will return date of the next Wednesday after the 3 days from .
 * @returns Due Date
 *
function getDueDate(numberofDays, dayId) {
	var nextDate = new Date();
	nextDate.setDate(nextDate.getDate() + parseInt(numberofDays));
	nextDate.setDate(nextDate.getDate() + (dayId - 1 - nextDate.getDay() + 7) % 7 + 1);
	var dd = nextDate.getDate();
	var mm = nextDate.getMonth() + 1;
	var yy = nextDate.getFullYear();
	var day = nextDate.getDay();
	var formatedDate = mm + '/' + dd + '/' + yy;
	return formatedDate;
}

/**
 * this function to schedule the needed meeting based on the active task
 * @param meetingDate
 *

function scheduleMeeting(meetingDate) {
	var workflowTasks = aa.workflow.getTasks(capId).getOutput();
	var contactList = getContactsListByType("Applicant", capId);
	var list = aa.meeting.getMeetingCalendars().getOutput();
	var meetingIds = aa.meeting.addMeeting(list[0].getMeetingGroupId(), meetingSubject, meetingType, meetingDate).getOutput();
	var scheduleResult = aa.meeting.scheduleMeeting(capId, list[0].getMeetingGroupId(), meetingIds.get(0), meetingDuration, meetingSubject, meetingSubject);
	var MeetingModelList = aa.meeting.getMeetingsByCAP(capId, false).getOutput();
	var MeetingAttendeeList = aa.util.newArrayList();
	var CurrentMeetingModelsList = aa.util.newArrayList();
	for (var i = 0; i < MeetingModelList.size(); i++) {

		if (MeetingModelList.get(i).getMeetingID() == meetingIds.get(0)) {
			CurrentMeetingModelsList.add(MeetingModelList.get(i))
		}
	}

	var taskAuditArray = [];
	for (var i in workflowTasks) {
		var userExists = false;
		if (workflowTasks[i].getCompleteFlag() == "Y" && workflowTasks[i].getTaskDescription().indexOf("Review") != -1 && workflowTasks[i].getTaskDescription() != "Project Manager Review" && workflowTasks[i].getTaskDescription() != "First Glance Review" && workflowTasks[i].getTaskDescription() != "Review Distribution" || (workflowTasks[i].getTaskDescription() == "Environmental Engineering")) {
			for (var ind in taskAuditArray) {
				if (taskAuditArray[ind] == workflowTasks[i].getTaskItem().getAuditID()) {
					userExists = true;
					break;
				}

			}
			if (!userExists) {
				aa.print("userExists " + userExists);
				taskAuditArray.push(workflowTasks[i].getTaskItem().getAuditID());
				var userObject = aa.people.getSysUserByID(workflowTasks[i].getTaskItem().getAuditID()).getOutput();
				var seq = userObject.getGaUserID();
				var fullName = userObject.getFullName();
				var MeetingAttendeeModel = aa.meeting.createMeetingAttendeeModel(meetingIds.get(0), list[0].getMeetingGroupId(), capId, seq, fullName, userObject.getEmail()).getOutput();
				MeetingAttendeeModel.setEntityType(com.accela.aa.meeting.meeting.attendee.AttendeeEntity.User.getEntityType());
				MeetingAttendeeModel.setEntityValue(seq);
				MeetingAttendeeList.add(MeetingAttendeeModel);
			}
		}
	}

	for (var x in contactList) {
		var seq = contactList[x]["contactSeqNumber"];
		var fullName = contactList[x]["firstName"] + " " + contactList[x]["lastName"];
		var MeetingAttendeeModel = aa.meeting.createMeetingAttendeeModel(meetingIds.get(0), list[0].getMeetingGroupId(), capId, seq, fullName, contactList[x]["email"]).getOutput();
		MeetingAttendeeList.add(MeetingAttendeeModel);

	}

	if (MeetingAttendeeList.size() > 0 && CurrentMeetingModelsList.size() > 0) {

		var attendeeBuisnessObject = aa.proxyInvoker.newInstance("com.accela.aa.meeting.meeting.attendee.MeetingAttendeeBusiness").getOutput();
		attendeeBuisnessObject.createAttendees(CurrentMeetingModelsList, MeetingAttendeeList);
	}

}

/**
 * this function is to get the cap contact by type
 * @param ContactType
 * @returns contact array if exists else returns false
 *

function getContactsListByType(ContactType) {
	var contactArray = getPeople(capId);
	var contactsArray = new Array;
	if (contactArray.length > 0) {
		for (var cc = 0; cc < contactArray.length; cc++) {
			if (contactArray[cc].getPeople().contactType == ContactType) {
				var contact = [];
				contact["lastName"] = contactArray[cc].getPeople().lastName;
				contact["firstName"] = contactArray[cc].getPeople().firstName;
				contact["middleName"] = contactArray[cc].getPeople().middleName;
				contact["businessName"] = contactArray[cc].getPeople().businessName;
				contact["contactSeqNumber"] = contactArray[cc].getPeople().contactSeqNumber;
				contact["contactType"] = contactArray[cc].getPeople().contactType;
				contact["relation"] = contactArray[cc].getPeople().relation;
				contact["phone1"] = contactArray[cc].getPeople().phone1;
				contact["phone2"] = contactArray[cc].getPeople().phone2;
				contact["email"] = contactArray[cc].getPeople().email;
				contact["addressLine1"] = contactArray[cc].getPeople().getCompactAddress().getAddressLine1();
				contact["addressLine2"] = contactArray[cc].getPeople().getCompactAddress().getAddressLine2();
				contact["city"] = contactArray[cc].getPeople().getCompactAddress().getCity();
				contact["state"] = contactArray[cc].getPeople().getCompactAddress().getState();
				contact["zip"] = contactArray[cc].getPeople().getCompactAddress().getZip();
				contact["fax"] = contactArray[cc].getPeople().getFax();
				contact["country"] = contactArray[cc].getPeople().getCountryCode();
				contact["fullName"] = contactArray[cc].getPeople().getFullName();
				contact["peopleModel"] = contactArray[cc].getPeople();
				contactsArray.push(contact);
			}
		}
		return contactsArray
	}

	return false;  }
*/