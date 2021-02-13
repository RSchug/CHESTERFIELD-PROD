//ASUA:ENVENGINEERING/SURETIES/*/*
//If Status is updated to Void close all active Workflow Tasks as Voided
if(matches(appStatus,"Void"))
{taskCloseAllExcept("Voided","Automatically Voided from Record Status of Void");
}