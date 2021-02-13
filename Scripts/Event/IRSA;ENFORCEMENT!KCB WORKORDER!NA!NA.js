//Enforcement/KCB WORKORDER/*/* if Initial Inspection is ... 
if((matches(inspResult,"No Action") && inspType.equals("Initial")) && isTaskActive("Initiation")){
	closeTask("Initiation","No Action","Updated based on No Action Initial Inspection","");
	}
if((matches(inspResult,"Abated") && inspType.equals("Initial")) && isTaskActive("In Progress")){
	closeTask("In Progress","Abated","Updated based on Abated Initial Inspection","");
	activateTask("Final Processing"); updateTask("Final Processing","Pending Invoicing","Updated based on Abated Initial Inspection","");
	}
if((matches(inspResult,"No Action") && inspType.equals("Initial")) && isTaskActive("In Progress")){
	closeTask("In Progress","No Action","Updated based on No Action Initial Inspection","");
	}
