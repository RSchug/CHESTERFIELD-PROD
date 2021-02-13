if (((appMatch('EnvEngineering/Plan Review/Timbering/NA'))||(appMatch('EnvEngineering/Plan Review/ESC Plan/NA'))||(appMatch('EnvEngineering/Plan Review/Linear Project/NA'))) && (isTaskActive("Fee Payment") && (balanceDue == 0))) {
    closeTask("Fee Payment","Payment Received","Updated based on Balance of 0","");
}