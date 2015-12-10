<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="TrashApp.Default" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
</head>
<body>
    <link rel="stylesheet" type="text/css" href="Styles/TimeOutUI.css" />
    <script src="//code.jquery.com/jquery-1.11.3.min.js"></script>
    <script src="//code.jquery.com/ui/1.11.4/jquery-ui.js"></script>
    <script src="Scripts/JSLangExt.js"></script>
    <script src="Scripts/TimeOut.js"></script>
    <script type="text/javascript">
        $(document).ready(function () {

            //  =======================================================
            //      Note: there are a lot of little pieces here
            //      that are included in the link/script tags above
            //      While this can be a pain, I also wanted to ensure 
            //      seperation of concerns. 
            //  =======================================================

            var options = { timeValues: {warnAfter: 5000, countdown: 7 }};
            $.sessionTimeout(options);

                       
        })
    </script>
    <form id="form1" runat="server">
    <div>
        <h1> JS timeout test</h1>
        
    </div>
    </form>
</body>
</html>
