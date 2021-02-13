//IRSA:BUILDING/BUILDING CODE COMPLIANCE/CONCERN HANDLING/NA
if (inspResult.equals("Approved")){
	closeTask("Investigation","Approved","Updated based on Inspection Result","");
	}
if (inspResult.equals("Corrections Required")){
	updateTask("Investigation","Corrections Required","Updated based on Inspection Result","");
	}