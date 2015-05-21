'use strict';

var appControllers = angular.module('app.controllers', []);

//settings and state
var app = {
    name: 'qorio',
    title: 'Qorio - Dashboard',
    version: '1.0.0',
    /**
     * Whether to print and alert some log information
     */
    debug: true,
    /**
     * In-app constants
     */
    settings: {
        colors: {
            'white': '#fff',
            'black': '#000',
            'gray-light': '#999',
            'gray-lighter': '#eee',
            'gray': '#666',
            'gray-dark': '#343434',
            'gray-darker': '#222',
            'gray-semi-light': '#777',
            'gray-semi-lighter': '#ddd',
            'brand-primary': '#5d8fc2',
            'brand-success': '#64bd63',
            'brand-warning': '#f0b518',
            'brand-danger': '#dd5826',
            'brand-info': '#5dc4bf'
        },
        screens: {
            'xs-max': 767,
            'sm-min': 768,
            'sm-max': 991,
            'md-min': 992,
            'md-max': 1199,
            'lg-min': 1200
        },
        navCollapseTimeout: 2500
    },

    /**
     * Application state. May be changed when using.
     * Synced to Local Storage
     */
    state: {
        /**
         * whether navigation is static (prevent automatic collapsing)
         */
        'nav-static': false
    }
};

var Helpers = function(){
    this._initResizeEvent();
    this._initOnScreenSizeCallbacks();
};
Helpers.prototype = {
    _resizeCallbacks: [],
    _screenSizeCallbacks: {
        xs:{enter:[], exit:[]},
        sm:{enter:[], exit:[]},
        md:{enter:[], exit:[]},
        lg:{enter:[], exit:[]}
    },

    /**
     * Checks screen size according to Bootstrap default sizes
     * @param size screen size  ('xs','sm','md','lg')
     * @returns {boolean} whether screen is <code>size</code>
     */
    isScreen: function(size){
        var screenPx = window.innerWidth;
        return (screenPx >= app.settings.screens[size + '-min'] || size == 'xs') && (screenPx <= app.settings.screens[size + '-max'] || size == 'lg');
    },

    /**
     * Returns screen size Bootstrap-like string ('xs','sm','md','lg')
     * @returns {string}
     */
    getScreenSize: function(){
        var screenPx = window.innerWidth;
        if (screenPx <= app.settings.screens['xs-max']) return 'xs';
        if ((screenPx >= app.settings.screens['sm-min']) && (screenPx <= app.settings.screens['sm-max'])) return 'sm';
        if ((screenPx >= app.settings.screens['md-min']) && (screenPx <= app.settings.screens['md-max'])) return 'md';
        if (screenPx >= app.settings.screens['lg-min']) return 'lg';
    },

    /**
     * Specify a function to execute when window entered/exited particular size.
     * @param size ('xs','sm','md','lg')
     * @param fn callback(newScreenSize, prevScreenSize)
     * @param onEnter whether to run a callback when screen enters `size` or exits. true by default @optional
     */
    onScreenSize: function(size, fn, /**Boolean=*/ onEnter){
        onEnter = typeof onEnter !== 'undefined' ? onEnter : true;
        this._screenSizeCallbacks[size][onEnter ? 'enter' : 'exit'].push(fn)
    },

    /**
     * Change color brightness
     * @param color
     * @param ratio
     * @param darker
     * @returns {string}
     */
    //credit http://stackoverflow.com/questions/1507931/generate-lighter-darker-color-in-css-using-javascript
    changeColor: function(color, ratio, darker) {
        var pad = function(num, totalChars) {
            var pad = '0';
            num = num + '';
            while (num.length < totalChars) {
                num = pad + num;
            }
            return num;
        };
        // Trim trailing/leading whitespace
        color = color.replace(/^\s*|\s*$/, '');

        // Expand three-digit hex
        color = color.replace(
            /^#?([a-f0-9])([a-f0-9])([a-f0-9])$/i,
            '#$1$1$2$2$3$3'
        );

        // Calculate ratio
        var difference = Math.round(ratio * 256) * (darker ? -1 : 1),
        // Determine if input is RGB(A)
            rgb = color.match(new RegExp('^rgba?\\(\\s*' +
                    '(\\d|[1-9]\\d|1\\d{2}|2[0-4][0-9]|25[0-5])' +
                    '\\s*,\\s*' +
                    '(\\d|[1-9]\\d|1\\d{2}|2[0-4][0-9]|25[0-5])' +
                    '\\s*,\\s*' +
                    '(\\d|[1-9]\\d|1\\d{2}|2[0-4][0-9]|25[0-5])' +
                    '(?:\\s*,\\s*' +
                    '(0|1|0?\\.\\d+))?' +
                    '\\s*\\)$'
                , 'i')),
            alpha = !!rgb && rgb[4] != null ? rgb[4] : null,

        // Convert hex to decimal
            decimal = !!rgb? [rgb[1], rgb[2], rgb[3]] : color.replace(
                /^#?([a-f0-9][a-f0-9])([a-f0-9][a-f0-9])([a-f0-9][a-f0-9])/i,
                function() {
                    return parseInt(arguments[1], 16) + ',' +
                        parseInt(arguments[2], 16) + ',' +
                        parseInt(arguments[3], 16);
                }
            ).split(/,/),
            returnValue;

        // Return RGB(A)
        return !!rgb ?
            'rgb' + (alpha !== null ? 'a' : '') + '(' +
            Math[darker ? 'max' : 'min'](
                    parseInt(decimal[0], 10) + difference, darker ? 0 : 255
            ) + ', ' +
            Math[darker ? 'max' : 'min'](
                    parseInt(decimal[1], 10) + difference, darker ? 0 : 255
            ) + ', ' +
            Math[darker ? 'max' : 'min'](
                    parseInt(decimal[2], 10) + difference, darker ? 0 : 255
            ) +
            (alpha !== null ? ', ' + alpha : '') +
            ')' :
            // Return hex
            [
                '#',
                pad(Math[darker ? 'max' : 'min'](
                        parseInt(decimal[0], 10) + difference, darker ? 0 : 255
                ).toString(16), 2),
                pad(Math[darker ? 'max' : 'min'](
                        parseInt(decimal[1], 10) + difference, darker ? 0 : 255
                ).toString(16), 2),
                pad(Math[darker ? 'max' : 'min'](
                        parseInt(decimal[2], 10) + difference, darker ? 0 : 255
                ).toString(16), 2)
            ].join('');
    },
    lightenColor: function(color, ratio) {
        return this.changeColor(color, ratio, false);
    },
    darkenColor: function(color, ratio) {
        return this.changeColor(color, ratio, true);
    },

    max: function(array) {
        return Math.max.apply(null, array);
    },

    min: function(array) {
        return Math.min.apply(null, array);
    },

    /**
     * Triggers sn:resize event. sn:resize is a convenient way to handle both window resize event and
     * sidebar state change.
     * Fired maximum once in 100 millis
     * @private
     */
    _initResizeEvent: function(){
        var resizeTimeout;

        $(window).on('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function(){
                $(window).trigger('sn:resize');
            }, 100);
        });
    },

    /**
     * Initiates an array of throttle onScreenSize callbacks.
     * @private
     */
    _initOnScreenSizeCallbacks: function(){
        var resizeTimeout,
            helpers = this,
            prevSize = this.getScreenSize();

        $(window).resize(function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function(){
                var size = helpers.getScreenSize();
                if (size != prevSize){ //run only if something changed
                    //run exit callbacks first
                    helpers._screenSizeCallbacks[prevSize]['exit'].forEach(function(fn){
                        fn(size, prevSize);
                    });
                    //run enter callbacks then
                    helpers._screenSizeCallbacks[size]['enter'].forEach(function(fn){
                        fn(size, prevSize);
                    });
                    console.log('screen changed. new: ' + size + ', old: ' + prevSize);
                }
                prevSize = size;
            }, 100);
        });
    }
};

app.helpers = new Helpers();

appControllers.controller('SingAppController', ['$scope', '$localStorage',function ($scope, $localStorage){
    $scope.app = app;
    if (angular.isDefined($localStorage.state)){
        $scope.app.state = $localStorage.state;
    } else {
        $localStorage.state = $scope.app.state;
    }

    $scope.print = function(){
        window.print();
    };

    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
        $scope.loginPage = toState.name == 'login';
        $scope.errorPage = toState.name == 'error';
        $(document).trigger('sn:loaded', [event, toState, toParams, fromState, fromParams]);
    })
}]);

appControllers.controller('LoginController', ['$scope', '$location', 'user', function($scope, $location, user) {
    if (user.isAuthed()) {
        $location.path('/app/dashboard');
        return;
    }

    $scope.userCredentials = {
        login: '',
        password: ''
    };

    $scope.startLoginAnimation = function() {
        //$('#loginButton').button('loading');
    }

    $scope.stopLoginAnimation = function() {
        $('#loginButton').button('reset');
    }

    $scope.showErrorMessage = function(message) {
        alert(message);
    }

    $scope.login = function() {
        $scope.startLoginAnimation();
        user.login($scope.userCredentials.login, $scope.userCredentials.password)
            .success(function(response) {
                window.location.reload();
            })
            .error(function(e) {
                if (!e) {
                    e = {'error': 'unknown'};
                }
                switch (e.error) {
                    case 'error-account-not-found':
                        $scope.showErrorMessage('Account fot found');
                        break;
                    case 'error-bad-credentials':
                        $scope.showErrorMessage('Bad credentials');
                        break;
                    default:
                        $scope.showErrorMessage('Unknown server error')
                        break;
                }

                $scope.stopLoginAnimation();
            });
    }

}]);


appControllers.controller(createAuthorizedController('DashboardController', ['$scope', '$rootScope', function($scope, $rootScope) {

}]));

appControllers.controller(createAuthorizedController('TerminalController', ['$scope', '$rootScope', 'terminal', function($scope, $rootScope, terminal) {

    // Initialize terminal
    //todo rewrite in an angular way. implement $terminal service
    var terminal = terminal.initTerminalById('terminal', {greetings: false}, send);

    function send(c,t) {
        debugger;
    }

    $scope.openedLogId = '___';

    // Get WebSocket url from attribute
    var ws = new WebSocket($scope.wsUrl);

    ws.onmessage = function (event) {
        var data = parseInput(event.data);
        if (data) {
            terminal.echo(data);
        }
    };


    function parseInput(input) {
        var result = input.split(',');

        switch (result[0]) {
            case '****':
                return result[3];
            break;
            case '????':
                return '[[;#7f7f00;]' + result[3] + ']';
            break;
            case '!!!!':
                return '[[;#7f0000;]' + result[3] + ']';
            break;
            default:
                return input;
        }
    }

}]));

appControllers.controller(createAuthorizedController('LiveTimelineController', ['$scope', '$rootScope', function($scope, $rootScope) {
    // List of all events
    $scope.events = [];


    // Get WebSocket url from attribute
    var ws = new WebSocket($scope.wsUrl);

    ws.onmessage = function (event) {
        parseInput(event.data);
    };

    var createEvent = function(input, event_icon_class) {
        return {
            title: input[3],
            timestamp: input[2],
            text: input[4],
            event_icon_class: event_icon_class,
            id: btoa(input[3])
        }
    };

    var updateCard = function(title, eventIconClass, time) {
        var card = $('#' + btoa(title).substr(0, 7));
        card.children('span').removeClass('event-icon-primary').addClass(eventIconClass);
        var timeLabel = card.children('section').children('footer').children('ul').children('li').children('a');
        timeLabel.text((time - timeLabel.attr('data-original')) + ' seconds');
    };

    // To store all messages
    $scope.allMessages = {};

    var currentId = '';

    function parseInput(input) {
        var result = input.split(',');

        switch (result[0]) {
            case '****':
                if (result[1] == '[') {
                    currentId = result[3];
                    $scope.$apply(function () {
                        $scope.events.push(createEvent(result, 'event-icon-primary'));
                    });
                } else if (result[1] == ']') {
                    updateCard(result[3], 'event-icon-primary', result[2]);
                    currentId = '';
                }
                break;
            case '????':
                if (result[1] == '[') {
                    currentId = result[3];
                    $scope.$apply(function () {
                        $scope.events.push(createEvent(result, 'event-icon-warning'));
                    });
                } else {
                    updateCard(result[3], 'event-icon-warning', result[2]);
                }
                break;
            case '!!!!':
                if (result[1] == '[') {
                    currentId = result[3];
                    $scope.$apply(function () {
                        $scope.events.push(createEvent(result, 'event-icon-danger'));
                    });
                } else {
                    updateCard(result[3], 'event-icon-danger', result[2]);
                }
                break;
            default:
                if (input) {
                    // Prevent undefined string
                    if (!$scope.allMessages[currentId]) {
                        $scope.allMessages[currentId] = '';
                    }
                    $scope.allMessages[currentId] += input + '\n';
                }
        }

        var elem = document.getElementById('timeline');
        elem.scrollTop = elem.scrollHeight;
    }

    var showDetails = function(){
        console.log($scope.allMessages[title]);
    };

    $scope.openTerminal = function(title) {
        console.log($scope.allMessages[title]);
    };
}]));



appControllers.controller(createAuthorizedController('TreeViewController', ['$scope', '$rootScope', function($scope, $rootScope) {
    debugger;
    $scope.my_data = [{
        label: 'Languages',
        children: ['Jade','Less','Coffeescript']
    }];
}]));

/**
 * Create controller with automatic authorization check
 * @param controllerName
 * @param controllerDef
 * @returns {{}}
 */
function createAuthorizedController (controllerName, controllerDef) {
    var oldControllerFunc = controllerDef[controllerDef.length - 1];

    controllerDef[controllerDef.length - 1] = 'dataLoader';
    controllerDef.push('user');

    controllerDef.push(function() {
        var dataLoader = arguments[arguments.length - 2];
        var user = arguments[arguments.length - 1];

        if (!user.hasAccessTo(controllerName) && !user.hasAccessTo(controllerName.replace('Controller', ''))) {
            throw 'Access exception in ' + arguments[0];
        }

        var self = this,
            selfArguments = arguments;
        dataLoader.init(controllerName).then(function(){
            oldControllerFunc.apply(self, selfArguments)
        });
    });

    var result = {};
    result[controllerName] = controllerDef;

    return result;
}