/**
 * Copyright eLearning Brothers LLC 2012 All Rights Reserved
 */

/**
 * Spiral/tools 1.0 **CORE**
 * Compilation of usefull jQuery plugins
 **/


String.prototype.ReplaceAll = function(stringToFind,stringToReplace){

    var temp = this;

    var index = temp.indexOf(stringToFind);

        while(index != -1){

            temp = temp.replace(stringToFind,stringToReplace);

            index = temp.indexOf(stringToFind);

        }

        return temp;

    }

/**
 * Overrides properties of source with non-null overrider options
 * @param {Object} mixed_var_source source object
 * @param {Object} mixed_var_overrider overriding object
 * @param {boolean} null_override [default=false] if null should override values
 */
function override(mixed_var_source, mixed_var_overrider, null_override) {
    var null_override = ((typeof null_override === 'undefined') ? false : null_override);
    var mixed_var_source = mixed_var_source;
    if ((typeof mixed_var_source == 'object') && (typeof mixed_var_overrider == 'object')) {
        for (key in mixed_var_overrider) {
            if (null_override || mixed_var_overrider[key] != null) {
                mixed_var_source[key] = mixed_var_overrider[key];
            }
        }
    }
    return mixed_var_source;
}
/**
 * Ignite the context. Fires dynamic behavior for context
 * @param {string} context
 * @param {string} debug optional interface
 */
function ignite(context, debug) {
    $(document).trigger('dynamic', {context:context, debug: nvl(debug, "IGNITE")});
}

/**
 * Ignite the context with single behavior
 * @param {string} context
 * @param {string} behaviorId
 * @param {string} debug optional interface
 */
function igniteSingle(context, behaviorId, debug) {
    $(document).trigger('dynamicSingle', {context:context, behaviorId: behaviorId, debug: nvl(debug, "SINGLE")});
}

/**
 * Ignite the context with behavior group
 * @param {string} context
 * @param {string} group
 * @param {string} debug optional interface
 */
function igniteGroup(context, group, debug) {
    $(document).trigger('dynamicGroup', {context:context, group: group, debug: nvl(debug, "IGNITE")});

}

/**
 * Ensures some value is object with field defined existing. If not - wraps in object{field->value}
 * @param {mixed} mixed_var
 * @param {string} field
 * @param {mixed} defaults default fields for object created
 */
function wrap(mixed_var, field, defaults) {
    var defaults = (typeof defaults === 'undefined') ? {} : defaults;
    if (typeof mixed_var == 'object') {
        for (key in mixed_var) {
            if (key == field) {
                return $.extend({}, defaults, mixed_var);
            }
        }
    }
    var obj = {};
    obj[field] = mixed_var;
    return $.extend({}, defaults, obj);
}

var timers = {};
function delayedStart(str, timeout) {
    if (!empty(timers[str])) {
        clearTimeout(timers[str]);
        delete timers[str];
    }
    timers[str] = setTimeout(str, timeout);
}
/**
 * Checks if URL has either &param either ?param and returns NULL if yes, if not returns URL with that params appended
 * @param url
 * @param param
 */
function ensureUrlParam(url, param) {
    if (empty(url)) return null;
    if (url.indexOf("?" + param) >= 0) return null;
    if (url.indexOf("&" + param) >= 0) return null;

    var question = (url.indexOf('?') >= 0);
    if (question) {
        return url + "&" + param;
    } else {
        return url + "?" + param;
    }
}

function ensureTypeIsObject(v) {
    if (typeof(v) !== 'object') {
        return {1: v};
    } else return v;
}

function ensureTypeIsArray(v) {
    if (typeof(v) !== 'object') {
        return [v];
    } else return v;
}

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

/**
 * @returns {string} d_Month_yyyy
 */
function getDate() {
    var month_names = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");
    var d = new Date();
    var current_date = d.getDate();
    var current_month = d.getMonth();
    var current_year = d.getFullYear();

    return current_date + " " + month_names[current_month] + " " + current_year;
}

/**
 * @returns {string} H:mm
 */
function getTime() {
    var currentTime = new Date();
    var hours = currentTime.getHours();
    var minutes = currentTime.getMinutes();

    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    return hours + ":" + minutes;
}

/**
 * @returns {string} H:mm
 */
function getFullTime() {
    var currentTime = new Date();
    var hours = currentTime.getHours();
    var minutes = currentTime.getMinutes();
    var seconds = currentTime.getSeconds();
    var mseconds = currentTime.getMilliseconds();

    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    return hours + ":" + minutes + ":" + seconds + " " + mseconds;
}

/**
 * Registeres variable within document
 * @param {string} name variable name
 * @param value variable value
 */
function register_variable(name, value) {
    $.data(document, "WJDData." + name, value);

    if (typeof value != "object") {
        $('.global-var-' + name).html(value);
        $('.global-var-input-' + name).val(value);
    }
}

/**
 * Resolves variable from document
 * @param {string} variable variable name
 * @returns {mixed} value
 */
function resolve_variable(variable) {
    var $dom = $.data(document, "WJDData." + variable);
    if ($dom == null) {
        $dom = $("input.global[name='" + variable + "']").val();
        if ($dom == null) {
            try {
                $dom = eval(variable);
                if (typeof($dom) == 'object') {
                    $dom = null;
                }
            }
            catch(err) {
                return null;
            }
            if (empty($dom)) {
                return null;
            } else {
                return $dom;
            }
        } else {
            return $dom;
        }
    } else {
        return $dom;
    }
}

/**
 * Checks variable exists in body
 * @param {string} variable variable name
 * @returns {boolean}
 */
function exists_variable(variable) {
    var $dom = $.data(document, "WJDData." + variable);
    if ($dom == null) {
        return false;
    } else {
        return true;
    }
}


/**
 * Checks if 'what' is an element of array 'where'
 * @param what
 * @param {Array} where
 */
function in_array(what, where) {
    for (var i = 0; i < where.length; i++)
        if (what == where[i])
            return true;
    return false;
}

/**
 * Checks if mixed_var is empty. This applies for empty stings, false booleans & zero values
 * @param mixed_var
 */
function empty(mixed_var) {
    var key;

    if (mixed_var === "" ||
            mixed_var === 0 ||
            mixed_var === "0" ||
            mixed_var === null ||
            mixed_var === false ||
            typeof mixed_var === 'undefined'
            ) {
        return true;
    }

    if (typeof mixed_var == 'object') {
        for (key in mixed_var) {
            return false;
        }
        return true;
    }

    return false;
}

/**
 * Returns mixed_var1 if it is not empty, else returns mixed_var2
 * @param mixed_var1
 * @param mixed_var2
 */
function nvl(mixed_var1, mixed_var2) {
    return empty(mixed_var1) ? mixed_var2 : mixed_var1;
}

/**
 * Loops for millis milliseconds
 * @param millis
 */
function delay(millis) {
    var date = new Date();
    var curDate = null;

    do {
        curDate = new Date();
    }
    while (curDate - date < millis);
}




new function($) {
    /**
     * Ensures DOM element exists withing other DOM element. Creates, if not.
     * @param {string} selector selector to check
     * @param {string} html HTML code of element, that will be created
     * @param {Array()} css array of css properties to attach
     * @param {boolean} noDynamic (default=true) Don't fire "dynamic" event to execute dynamic functions when creating element
     * @param {boolean} prepend (default=false) Prepend DOM element, instead of appending
     * @returns {jqueryObject} DOM Created or existing DOM element
     */
    $.fn.ensure = function(selector, html, css, noDynamic, prepend) {
        var $container = this;
        var noDynamic = (typeof(noDynamic) === 'undefined') ? true : noDynamic;
        var prepend = (typeof(prepend) === 'undefined') ? false : prepend;

        if ($container.find(selector).size() == 0) {
            var $html = $(html);
            $html.css(css);
            if (prepend) {
                $container.prepend($html);
            } else {
                $container.append($html);
            }
            if (!noDynamic) {
                ignite($container, "$.fn.ensure");
            }
        }
        return $container.find(selector);
    }
}(jQuery);



new function($) {
    /**
     * Ensures Jquery object has an id. Creates random unique id if element hasn't any
     * @returns {string} DOM element ID
     */
    $.fn.ensureId = function() {
        if (this.attr('id') == null || this.attr('id') == "") {
            var newId = Math.floor(Math.random() * 9000) + 1000;
            while ($('#uni_' + newId).size() > 0) {
                newId = Math.floor(Math.random() * 9000) + 1000;
            }
            this.attr('id', 'uni_' + newId);

        }
        return this.attr('id');
    }

    /**
     * Получает id оформеленный в стиле #буквы-ID у ближайшего родительского элемента selector
     * Например $('a.class').resolveId('div.item') найдет ближайший родитель a.class являющийся div.item, возьмет у него id и вернет часть после дефиса
     * @param selector
     */
    $.fn.resolveId = function(selector) {
        var id = this.closest(selector).attr('id');
        id = id.substr(id.indexOf('-') + 1);
        return id;
    }
}(jQuery);

var behaviorClasses = {};

new function($) {

    $.fn.nonTemplated = function() {

        return this.filter(function() {
            return $(this).parents("#templates").length == 0;
        });
    };

    /**
     * Ensures tail jquery calls are called once for DOM element for 'behaveId'. Once behave is called for DOM element, element is excluded from 'behave' filter.
     * @param {string} behaveId OPTIONAL string identifier, required for DOM elements having more than one behavior attached
     */
    $.fn.behave = function(behaveId) {
        var cl = 'initialized';
        var id = "undefined";
        if (typeof(behaveId) !== 'undefined') {
            if (typeof(behaviorClasses[behaveId]) === 'undefined') {
                behaviorClasses[behaveId] = 'bh-' + Object.size(behaviorClasses);
            }
            cl = behaviorClasses[behaveId];
            id = behaveId;
        } else {

        }
        if (typeof(DEBUG) !== 'undefined' && DEBUG) {
            return this.nonTemplated().filter(":not(." + cl + ")").addClass(cl).attr('behavior-' + cl, id);
        }

        return this.nonTemplated().filter(":not(." + cl + ")").addClass(cl);
    }


}(jQuery);

new function($) {
    /**
     * Declares css element can have one of listed classes. To use with cssState function
     * @param states comma separated list of classes
     */
    $.fn.declareStates = function(states, def) {

        var def = (typeof(def) === 'undefined') ? null : def;
        var states = states.split(",");
        var statesA = [];
        for (var s in states) {
            var st = $.trim(states[s]);
            if (st != null && st != "" && !in_array(st, statesA)) {
                statesA[statesA.length] = st;
            }
        }

        return this.each(function() {
            $(this).data("cssStates", statesA);
            if (def) {
                $(this).cssState(def);
            } else if (statesA.length > 0) {
                $(this).cssState(statesA[0]);
            }
        });
    };

    $.fn.cssState = function(state) {

        return this.each(function() {
            var statesA = $(this).data("cssStates");
            if (in_array(state, statesA)) {
                for (var s in statesA) {
                    $(this).removeClass(statesA[s]);
                }
                $(this).addClass(state);
            }
        });
    };
    /**
     * Declares css element can have one of listed classes. To use with cssNameState function
     * @param states comma separated list of classes
     */
    $.fn.declareNamedStates = function(name, states, def) {

        var def = (typeof(def) === 'undefined') ? null : def;
        var states = states.split(",");
        var statesA = [];
        for (var s in states) {
            var st = $.trim(states[s]);
            if (st != null && st != "" && !in_array(st, statesA)) {
                statesA[statesA.length] = st;
            }
        }

        return this.each(function() {
            $(this).data("cssStates-" + name, statesA);
            if (def) {
                $(this).cssNamedState(name, def);
            } else if (statesA.length > 0) {
                $(this).cssNamedState(name, statesA[0]);
            }
        });
    };

    $.fn.cssNamedState = function(name, state) {

        return this.each(function() {
            var statesA = $(this).data("cssStates-" + name);
            if (in_array(state, statesA)) {
                for (var s in statesA) {
                    $(this).removeClass(statesA[s]);
                }
                $(this).addClass(state);
            }
        });
    };
    /**
     * Locks control with some method to prevent it's usage during AJAX requests
     * @param {string['default','fade','beauty','opacity']} lock_type
     */
    $.fn.lock = function(lock_type, header, description) {

        if (this.size() == 1) {

            if (lock_type == 'default' || lock_type == 'fade' || lock_type == 'opacity' || lock_type == 'opacity-animation') {
                var $selLock = this.ensure('.lock', '<div class=lock></div>', {position: 'absolute'}, true, true);
                var $sel = this;
                var pdleft = parseInt($sel.css('padding-left'));
                var pdtop = parseInt($sel.css('padding-top'));
                var width = $sel.outerWidth();
                var height = $sel.outerHeight();

                if (lock_type == 'fade') {
                    $selLock.addClass('fade');
                }
                if (lock_type == 'opacity') {
                    $selLock.addClass('opacity');
                    $sel.addClass('lock-with-opacity');
                }

                if (lock_type == 'opacity-animation') {
                    $selLock.addClass('opacity');
                    $sel.addClass('lock-with-opacity-animation');
                }

                var p = $sel.css('position');
                if ((p == 'absolute') || (p == 'relative') || (p == 'fixed')) {

                    $selLock.css('top', '0px');
                    pdleft = 0;
                    pdtop = 0;
                    width = $sel.width();
                    height = $sel.height();
                }
                if ($sel.ensureId() == $('body').ensureId()) {
                    height = $(document).height();
                }
                $selLock.css({'z-index': 2000, width: width, height: height, 'margin-left': -pdleft + "px",'margin-top': -pdtop + "px"});

                $sel.data('lockedwith', lock_type);
            }
            if (lock_type == 'beauty') {
                this.beautifullLock(description, header);
                this.data('lockedwith', lock_type);
            }


        }
        return this;
    };

    $.fn.beautifullLock = function(description, header) {
        var header = (typeof(header) === 'undefined') ? 'Please wait' : header;
        var description = (typeof(description) === 'undefined') ? 'Your request is being processed' : description;
        var templ = '<div class="lock-message"><h1 class="title">'+header+'</h1><span class="description">'+description+'</span></div>';
        popup.popup({
            content: templ,
            fireDynamic: false,
            shadowBackground : true,
            shadowClose : false,
            width : 400
        });
        return this;
    };

    $.fn.beautifullUnLock = function() {
        if (typeof(popup) === 'undefined') {
            $('#popup').hide();
            $('#popup_shadow').hide();
        } else {
            popup.close();
        }
        return this;
    };

    $.fn.unlock = function() {
        if (this.size() == 1) {
            var type = this.data('lockedwith');
            if (type == 'default' || type == 'fade' || type == 'opacity' || type == 'opacity-animation') {
                this.children(".lock").remove();
                if (type == 'opacity') {
                    this.removeClass('lock-with-opacity');
                }
                if (type == 'opacity-animation') {
                    this.removeClass('lock-with-opacity-animation');
                }
            }
            if (type == 'beauty') {
                this.beautifullUnLock();
            }

        }
        return this;

    };

    $.fn.matchParentWidth = function(parentSelector) {
        this.each(function() {
            var parent = $(this).closest(parentSelector);
            var t = $(this);
            t.width(parent.width() - t.outerWidth() + t.width());
        });

        return this;

    };

    /**
     * Resolved associated array of element data- HTML5 attributes and their values
     */
    $.fn.resolveData = function() {

        var $el = this.get(0);
        var result = {};
        for (var i = 0; i < $el.attributes.length; i++) {

            var key = $el.attributes[i].nodeName;

            var value = $el.attributes[i].nodeValue;

            if (key.indexOf('data-') == 0) {
                result[key.substring(5)] = value;
            }
        }


        return result;

    };


    /**
     * Turn input in a specific autocomplete
     */


}(jQuery);


