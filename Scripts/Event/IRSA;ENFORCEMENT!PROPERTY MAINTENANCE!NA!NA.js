//Enforcement/PROPERTY MAINTENANCE/*/* if Initial Inspection is In Violation then close Investigation Workflow with In Violation status and update Notice Workflow with Pending Notice status and schedule Follow-up Inspection for next day 
if((matches(inspResult,"In Violation") && inspType.equals("Initial")) && isTaskActive("Initial Investigation")){
	closeTask("Initial Investigation","In Violation","Updated based on In Violation Initial Inspection",""); activateTask("Notice");
	updateTask("Notice","Pending Correction Letter Review","Updated based on In Violation Initial Inspection","");
	scheduleInspection("Follow-up",1,currentUserID,null,"Auto Scheduled");
	}
if((matches(inspResult,"10 Day In Violation") && inspType.equals("Initial")) && isTaskActive("Initial Investigation")){
	closeTask("Initial Investigation","In Violation","Updated based on 10 Day In Violation Initial Inspection",""); activateTask("Notice");
	updateTask("Notice","Pending Correction Letter Review","Updated based on In Violation Initial Inspection","");
	scheduleInspection("Follow-up",13,currentUserID,null,"Auto Scheduled");
	}
if((matches(inspResult,"14 Day In Violation") && inspType.equals("Initial")) && isTaskActive("Initial Investigation")){
	closeTask("Initial Investigation","In Violation","Updated based on 10 Day In Violation Initial Inspection",""); activateTask("Notice");
	updateTask("Notice","Pending Correction Letter Review","Updated based on In Violation Initial Inspection","");
	scheduleInspection("Follow-up",17,currentUserID,null,"Auto Scheduled");
	}
if((matches(inspResult,"30 Day In Violation") && inspType.equals("Initial")) && isTaskActive("Initial Investigation")){
	closeTask("Initial Investigation","In Violation","Updated based on 10 Day In Violation Initial Inspection",""); activateTask("Notice");
	updateTask("Notice","Pending Correction Letter Review","Updated based on In Violation Initial Inspection","");
	scheduleInspection("Follow-up",33,currentUserID,null,"Auto Scheduled");
	}
if((matches(inspResult,"60 Day In Violation") && inspType.equals("Initial")) && isTaskActive("Initial Investigation")){
	closeTask("Initial Investigation","In Violation","Updated based on 10 Day In Violation Initial Inspection",""); activateTask("Notice");
	updateTask("Notice","Pending Correction Letter Review","Updated based on In Violation Initial Inspection","");
	scheduleInspection("Follow-up",63,currentUserID,null,"Auto Scheduled");
	}
if((matches(inspResult,"No Violation") && inspType.equals("Initial")) && isTaskActive("Initial Investigation")){
	closeTask("Initial Investigation","No Violation","Updated based on No Violation Initial Inspection","");
	}
if(matches(inspResult,"Administrative Review") && inspType.equals("Initial")){
	scheduleInspection("Initial",14,currentUserID,null,"Auto Scheduled");
	}
if(matches(inspResult,"Administrative Review") && inspType.equals("Follow-up")){
	scheduleInspection("Follow-up",14,currentUserID,null,"Auto Scheduled");
	}
if(matches(inspResult,"Abated - County") && inspType.equals("Follow-up")){
	closeTask("Route to Legal","Demolition","Updated based on Abated - County Follow-up Inspection","");
	activateTask("Final Processing"); updateTask("Final Processing","Pending Invoice","Updated based on Abated - County Follow-up Inspection","");
	}
if((matches(inspResult,"Abated - Owner") && inspType.equals("Follow-up")) && isTaskActive("Route to Legal")){
	closeTask("Route to Legal","Complied","Updated based on Abated - Owner Follow-up Inspection","");
	}
if((matches(inspResult,"Abated - Owner") && inspType.equals("Follow-up")) && isTaskActive("Follow-Up Investigation")){
	closeTask("Follow-Up Investigation","Violation Corrected","Updated based on Abated - Owner Follow-up Inspection","");
	}
if(matches(inspResult,"In Violation") && inspType.equals("Follow-up")){
	scheduleInspection("Follow-up",1,currentUserID,null,"Auto Scheduled");
	}
if(matches(inspResult,"10 Day In Violation") && inspType.equals("Follow-up")){
	scheduleInspection("Follow-up",13,currentUserID,null,"Auto Scheduled");
	}
if(matches(inspResult,"14 Day In Violation") && inspType.equals("Follow-up")){
	scheduleInspection("Follow-up",17,currentUserID,null,"Auto Scheduled");
	}
if(matches(inspResult,"30 Day In Violation") && inspType.equals("Follow-up")){
	scheduleInspection("Follow-up",33,currentUserID,null,"Auto Scheduled");
	}
if(matches(inspResult,"60 Day In Violation") && inspType.equals("Follow-up")){
	scheduleInspection("Follow-up",63,currentUserID,null,"Auto Scheduled");
	}