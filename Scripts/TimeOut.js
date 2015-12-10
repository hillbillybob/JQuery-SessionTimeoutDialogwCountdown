/*jshint browser:true*/

//
// jquery.sessionTimeout.js
//
// After a set amount of time, a dialog is shown to the user with the option
// to either log out now, or stay connected. If log out now is selected,
// the page is redirected to a logout URL. If stay connected is selected,
// a keep-alive URL is requested through AJAX. If no options is selected
// after another set amount of time, the page is automatically redirected
// to a timeout URL.
//
// USAGE
//
//   1. Include jQuery
//   2. Include jQuery UI (for dialog)
//   3. Include JSLangExt.js (for string formatting function)
//   4. Include jquery.sessionTimeout.js
//   OPTIONAL - pass in options object
//   5. Call $.sessionTimeout(); after document ready
//
//
// OPTIONS
//
//   dialogText Object
//      Properties:
//          dialogTitle
//              Type: string
//              Description: Title for the dialog box
//              Default: Session Timeout
//          message
//              Type: string, formatted
//              Description: Message text, displayed in dialog box. format with {0}
//              Default: "Your session is about to expire in {0} seconds"
//          btnLogOutText
//              Type: string
//              Description: Text to display on logout button
//              Default: Log Out Now
//          btnKeepAliveText
//              Type: string
//              Description: Text to display on keep-alive button
//              Default: Stay In Session
//
//  httpValues Object
//      Properties:
//          keepAliveUrl
//              Type: string
//              Description: URL to call through AJAX to keep session alive. This resource should do something innocuous 
//                              that would keep the session alive, which will depend on your server-side platform.
//              Default: '/keep-alive'
//          keepAliveAjaxRequestType
//              Type: string
//              Description: How should we make the call to the keep-alive url? (GET/POST/PUT)
//              Default: 'POST'
//          logoutUrl
//              Type: string
//              Description: URL to take browser to if user clicks "Log Out Now"
//              Default: '/log-out'
//          appendTime
//              Type: Boolean 
//              Description: appends timestamp to postback
//              Default: true
//
//  timeValues Object
//      Properties:
//          warnAfter
//              Type: Int
//              Description: Time in milliseconds after page is opened until warning dialog is opened
//              Default: 1200000 (15 minutes)
//          countdown
//              Type: int
//              Description: Value in seconds for countdown dialog. If no countdown desired, leave null
//              Default: 30 seconds
//
//  options Object
//      Properties:
//          dialogText - Object
//          timeValues - Object
//          httpValues - Object

(function ($) {
    jQuery.sessionTimeout = function (options) {
        //Default Options
        var defaults = {
            dialogText: {
                dialogTitle: 'Session Timeout',
                message: 'Your session is about to expire in <span id="timeout-countdown">{0}</span> seconds',
                btnLogOutText: 'Log Out Now',
                btnKeepAliveText: 'Stay in Session',
            },
            timeValues: {
                countdown: 30,
                warnAfter: 1200000,
            },
            httpValues: {
                keepAliveUrl: '/keep-alive',
                keepAliveAjaxRequestType: 'POST',
                logoutUrl: '/Login.aspx',
                appendTime: true
            }
        };

        //container for dialog object names - not meant to be overridden, but div and span names
        //can be changed here
        var uiObjects = {
            dialogUI: {
                containerName: 'sessionTimeout-dialog',
                containerTimeout: 'timeout-countdown'
            }
        }

        // Extend user-set options over defaults
        var o = defaults,
				dialogTimer,
				counterTimer;

        if (options) { o = $.extend(defaults, options); }

        // Create timeout warning dialog
        $('body').append(
            '<div title="' + o.dialogText.dialogTitle + '" id="'+uiObjects.dialogUI.containerName +'">' +
              o.dialogText.message.format(o.timeValues.countdown) + '</div>');
        //create the dialog - https://jqueryui.com/dialog/ 
        $('#'+uiObjects.dialogUI.containerName).dialog({
            autoOpen: false,
            width: 400,
            modal: true,
            closeOnEscape: false,
            buttons: {
                // Button one - takes user to logout URL
                "Log-out-button": {
                    text: o.dialogText.btnLogOutText,
                    click: function () { logout(); }
                },
                // Button two - closes dialog and makes call to keep-alive URL
                "Stay-connected-button": {
                    text: o.dialogText.btnKeepAliveText,
                    click: function () { stayAlive(); }
                }
            }
        });
                
        //button click event handlers
        function logout() {
            window.location = o.httpValues.logoutUrl;
        }

        function stayAlive() {
            //DOES the dialog exhist yet, is it even open
            if($('#' + uiObjects.dialogUI.containerName).dialog("isOpen") && $('#' + uiObjects.dialogUI.containerName).dialog != null)
            {
                //Close dialog
                $('#' + uiObjects.dialogUI.containerName).dialog('close');
                //perform ajax call
                $.ajax({
                    type: o.httpValues.keepAliveAjaxRequestType,
                    url: o.httpValues.appendTime? updateQueryStringParameter(o.httpValues.keepAliveUrl, "_", new Date().getTime()): o.httpValues.keepAliveUrl
                });
                //reset timers
                controlCountdownTime('stop');
                controlDialogTimer('start');
            }
        }

        //Timer controllers
        function controlDialogTimer(action) {
            switch (action) {
                case 'start':
                    // After warning period, show dialog and start redirect timer
                    dialogTimer = setTimeout(function () {
                        $('#' + uiObjects.dialogUI.containerName).dialog('open');
                        controlCountdownTime('start');
                    }, o.timeValues.warnAfter);
                    break;

                case 'stop':
                    clearTimeout(dialogTimer);
                    break;
            }
        }

        function controlCountdownTime(action) {
            var self = this, counter = o.timeValues.countdown;
            
            switch (action) {
                case 'start':
                    //Dialog is shown, start the countdown
                    if (counter !== null) {
                        //Set the countdown value in the span.
                        $("#" + uiObjects.dialogUI.containerTimeout).html(counter);
                        //Set the interval (loop like function) for the countdown
                        counterTimer = window.setInterval(
                        function () {
                            counter -= 1;
                            $("#" + uiObjects.dialogUI.containerTimeout).html(counter);

                            if (counter == 0) {
                                //countdown complete, clear interval
                                window.clearInterval(counterTimer);
                                //redirect
                                logout();
                            }
                        }, 1000);
                    }
                    break;

                case 'stop':
                    counter = o.timeValues.countdown;
                    window.clearTimeout(counterTimer);
                    break;
            }
        }

        // Courtesy of http://stackoverflow.com/questions/5999118/add-or-update-query-string-parameter
        // Includes fix for angular ui-router as per comment by j_walker_dev
        function updateQueryStringParameter(uri, key, value) {
            var re = new RegExp("([?|&])" + key + "=.*?(&|#|$)", "i");

            if (uri.match(re)) {
                return uri.replace(re, '$1' + key + "=" + value + '$2');
            } else {
                var hash = '';

                if (uri.indexOf('#') !== -1) {
                    hash = uri.replace(/.*#/, '#');
                    uri = uri.replace(/#.*/, '');
                }

                var separator = uri.indexOf('?') !== -1 ? "&" : "?";
                return uri + separator + key + "=" + value + hash;
            }
        }

        $(document).ajaxComplete(function () {
            if (!$('#' + uiObjects.dialogUI.containerName).dialog("isOpen")) {
                //controlRedirTimer('stop');
                controlDialogTimer('stop');
                controlDialogTimer('start');
            }
        });
            
        // Begin warning period, kick this pig into action
        controlDialogTimer('start');

    };
})(jQuery);