// 159EE When BMP Re-Inspection inspection is resulted with "Not Approved" then Schedule a BMP Re-Inspection and schedule it for 60 calendar days out and assign to the inspection to the individual that did the last BMP Inspection
if ((inspResult == 'Not Approved') && (matches(inspType,"BMP","BMP Re-Inspection"))){
	var nextInspectorID = getLastInspector(inspType);
	if (!nextInspectorID) nextInspectorID = currentUserID; // Assign to current User if inspector could not be found.
	//scheduleInspectDate("BMP Re-Inspection", dateAdd(null, 60, true), nextInspectorID, null, "Auto Scheduled"); // Auto Schedule for working day 60 days from now .
	scheduleInspection("BMP Re-Inspection", 60, nextInspectorID, null, "Auto Scheduled");
}