//IRSA:BUILDING/BUILDING CODE COMPLIANCE/DISASTER INVESTIGATION/NA
if (inspResult.equals("No Damage")){
	closeTask("Investigation","No Damage","Updated based on Inspection Result","");
	}
if (inspResult.equals("Damage")){
	updateTask("Investigation","Damaged","Updated based on Inspection Result","");
}
if (inspResult.equals("Approved")){
	closeTask("Investigation","Approved","Updated based on Inspection Result","");	
	}
