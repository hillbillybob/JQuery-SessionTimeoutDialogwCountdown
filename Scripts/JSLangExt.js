//this method is to enhance the string object to give it tokenized, multiple argument 
//string formatting functionality much like C#'s String.format("{0}", string) method
String.prototype.format = function () {
    var formatted = this;
    for (var arg in arguments) {
        formatted = formatted.replace("{" + arg + "}", arguments[arg]);
    }
    return formatted;
};