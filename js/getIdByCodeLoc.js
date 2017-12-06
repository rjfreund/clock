define(function(){
    function getIdByCodeLocAs(context){
        var boundFunction = getIdByCodeLoc.bind(context)
        return boundFunction(context);
    }

    function getIdByCodeLoc(context){
        var location = getCodeLocation.bind(context)();
        return location;
    }

    function getCodeLocation(){
        var thisFileName = getThisFileName();
        var error = new Error;
        var callStack = error.stack.split("\n");
        callStack = callStack.filter(function(line){
            return !line.includes(thisFileName);
        });
        var callerLine = callStack[1];
        var slashParts = callerLine.split(")")[0].split("/");
        var location = slashParts[slashParts.length-1];
        return location;
    }

    function getThisFileName(){
        var error = new Error;
        var callStack = error.stack.split("\n");
        var slashParts = callStack[1].split(")")[0].split("/");
        var location = slashParts[slashParts.length-1];
        var colonParts = location.split(":");
        var filename = colonParts[0];
        return filename;
    }

    return getIdByCodeLocAs;
});