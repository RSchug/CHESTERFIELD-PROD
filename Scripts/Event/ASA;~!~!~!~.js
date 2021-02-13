try {
/*
//Add Standard Solution Includes 
 solutionInc = aa.bizDomain.getBizDomain("STANDARD_SOLUTIONS").getOutput().toArray(); 
 for (sol in solutionInc) { 
       if (solutionInc[sol].getAuditStatus() != "I") eval(getScriptText(solutionInc[sol].getBizdomainValue(),null)); 
 }  
 
 //Add Configurable RuleSets 
 configRules = aa.bizDomain.getBizDomain("CONFIGURABLE_RULESETS").getOutput().toArray(); 
 for (rule in configRules) { 
       if (configRules[rule].getAuditStatus() != "I") eval(getScriptText(configRules[rule].getBizdomainValue(),null)); 
 }*/
} catch (err) {
	logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}