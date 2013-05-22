/**
 * Copyright eLearning Brothers LLC 2012 All Rights Reserved
 */
jQuery.fn.loadText = function (url, successFnc) {
    var el = $(this);
    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'text',
        success: function(data){
            if(el.size()>0) {
                el.val(data);
                successFnc.call(el.get(0), data);
            }
        }
    });
};


var path = window.location.pathname;
path = path.substring(0, path.lastIndexOf('/'));
path = path.substring(path.lastIndexOf('/'));
var suffix = "?cache="+(new Date()).getTime();
var designFile = "design.ini";
var questionsFile = "questions.ini";
var soundsFile = "sounds.ini";


if(!empty(GAMEPREFIX)) {
    soundsFile = GAMEPREFIX+"-sounds.ini"
    questionsFile = GAMEPREFIX+"-questions.ini";
    designFile = GAMEPREFIX+"-design.ini";
}

var keywords = {
    "body_color":"variable-non-mandratory",
    "body_texture":"variable-non-mandratory",
    "question_block_images_background":"variable-non-mandratory",
    "question_block_images_hover":"variable-non-mandratory",
    "question_block_images_correct":"variable-non-mandratory",
    "question_block_images_incorrect":"variable-non-mandratory",
    "question_block_images_big":"variable-non-mandratory"
};
for(var i=1;i<30;i++) {
    keywords['q'+i+'_path'] = "variable-non-mandratory";
}

/*******************************************************/
/*              codemirror modes and etc               */
/*******************************************************/
var tags_definition={};

CodeMirror.defineMode("properties", function () {
    return {
        token:function (stream, state) {
            var sol = stream.sol() || state.afterSection;
            var eol = stream.eol();

            state.afterSection = false;

            if (sol) {
                if (state.nextMultiline) {
                    state.inMultiline = true;
                    state.nextMultiline = false;
                } else {
                    state.position = "def";
                }
            }

            if (eol && !state.nextMultiline) {
                state.inMultiline = false;
                state.position = "def";
            }

            if (sol) {
                while (stream.eatSpace());
            }

            var ch = stream.next();

            if (sol && (ch === "#" || ch === "!" || ch === ";")) {
                state.position = "comment";
                stream.skipToEnd();
                return "comment";
            } else if (sol && ch === "[") {
                state.afterSection = true;
                stream.skipTo("]");
                stream.eat("]");
                return "header";
            } else if (ch === "=" || ch === ":") {
                state.position = "quote";
                if (stream.peek() == "@") {
                    state.position = "object";
                    var temp_tags=stream.string.split("=@");
                    tags_definition[temp_tags[0]]=temp_tags[1];
                }
                if (stream.peek() == "%") {
                    state.position = "tag";
                }
                return null;
            } else if (ch === "\\" && state.position === "quote") {
                if(stream.eol()) {
                    state.nextMultiline = true;
                }
                /*if (ch !== "u") {    // u = Unicode sequence \u1234
                    if(typeof(ch)==='undefined') {
                        state.nextMultiline = true;
                    };
                }*/
            } else if(ch==="/" || ch==="\\" && state.position==='tag') {
                state.position="quote";
            }

            var cur = stream.currentProperty();
            if (state.position=="def" && keywords.propertyIsEnumerable(cur)) return keywords[cur];

            return state.position;
        },

        startState:function () {
            return {
                position:"def", // Current position, "def", "quote" or "comment"
                nextMultiline:false, // Is the next line multiline value
                inMultiline:false, // Is the current line a multiline value
                afterSection:false    // Did we just open a section
            };
        }

    };
});

CodeMirror.defineMode("changes", function() {
    var headerSeperator = /^(Your core folder version|What's new:|Your browser information:).*/,
    errortext= /^Error.*!$/,
    versionText=/^ver [0-9]*:/,
    devVerText=/^dev_ver [0-9]*:/,
    sysinfoText=/^-.*: /,
    headerLine = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)  ?\d{1,2} \d{2}:\d{2}(:\d{2})? [A-Z]{3,4} \d{4} - /,
    simpleEmail = /^[\w+.-]+@[\w.-]+/;

    return {
        token: function(stream) {
            if (stream.sol()) {
                if (stream.match(headerSeperator)) { stream.skipToEnd(); return 'header'; }
                if (stream.match(headerLine)) { return 'tag'; }
                if (stream.match(errortext)) { return 'error'; }
                if (stream.match(versionText)) { return 'quote'; }
                if (stream.match(devVerText)) { return 'string-2'; }
                if (stream.match(sysinfoText)) { return 'comment'; }
            }
            if (stream.match(simpleEmail)) { return 'string'; }
            stream.next();
            return null;
        }
    };
});


CodeMirror.elbHint = function(cm){

    //console.log("elb",cm);


    var cursor = cm.getCursor(),
    this_line= cm.getRange({line: cursor.line, ch: 0}, cursor),
    this_line_half= this_line.slice(0,this_line.length-1),
    from;

    console.log(this_line, tags_definition);
    var hints = {"tag":[], "style":[],"return":[]};
    for (var key in tags_definition){
        if (key.indexOf(this_line)===0){
            hints["tag"].push(key);
        } else if (key.indexOf(this_line_half)===0){
            hints["style"].push(key);
        }
    }
    if (hints["style"].length != 0){
        console.log("style");
        for (var key in dynamicCssInstance.getStyles()){
            hints["return"].push(key);
        }
        from=cursor;
    } else {
        hints["return"]=hints["tag"];
        from= { line: cursor.line, ch: cursor.ch - this_line.length }
    }

    if (hints["return"].length === 1){
        hints["return"].push("");
    }

    return {
        list:  hints["return"],
        from: from,
        to: cursor
    };


};

ELB_hints={
    "needToShowHint": false,
    "cm": null
};

function passAndHint(cm) {
    ELB_hints.needToShowHint=true;
    ELB_hints.cm=cm;
    throw CodeMirror.Pass;
}

CodeMirror.commands.autocomplete = function(cm) {
    //TODO Autocomplete
    //CodeMirror.showHint(cm, CodeMirror.elbHint);
};



CodeMirror.defineMIME("text/x-properties", "properties");
CodeMirror.defineMIME("text/x-ini", "properties");
CodeMirror.defineMIME("text/x-rpm-changes", "changes");


/*******************************************************/
/*                          editor                     */
/*******************************************************/

var codeDesign,
    codeQuestions,
    codeSounds,
    codeSupport,
    codeResult,
    sysinfo="For support contact support@eLearningBrothers.com. \n\nYour browser information: \n\n-appCodeName: "+ navigator.appCodeName+
        "\n-appName: " + navigator.appName +
        "\n-appVersion: "+ navigator.appVersion +
        "\n-userAgent: " + navigator.userAgent +
        "\n-platform: " +navigator.platform;
    version_text="";

$.get("../core/version.info", function(data){
    core.version=parseInt(data)+1;
    version_text="Your core folder version:" + core.version + ". ";
    codeSupport.setValue(version_text +"\n\n"+ sysinfo );
});

$(document).ready(function () {
    $.ajaxSetup({
        dataType: 'text'
    });


    var location = ""+window.location.href;
    if(location.indexOf("elbgames.by")>0) {
        $('.productionHidden').css({display: 'inline-block'}).show();
    }
    $.get("../core/list_images.php?path="+path, function(result) {
        var data = $.parseJSON(result);
        var container = $('<div class="imageSelect productionHidden"></div>');
        var select = $('<select></select>');
        for(var k in data) {
            select.append("<option value='"+data[k].file+"' data-height='"+data[k].height+"' data-width='"+data[k].width+"'>"+data[k].file+"</option>");
        }
        container.append(select).append("<span></span>");
        select.change(function() {
            var opt = $(this).find('option:selected');
            var span = container.find('span');
            span.html("&nbsp;"+opt.val()+" "+opt.attr('data-width')+" "+opt.attr('data-height'));
            span.append("<img src='config/images/"+opt.val()+"'/>")
        });
        $('#editor-design .editor-buttons').append(container);
        var location = ""+window.location.href;
        if(location.indexOf("elbgames.by")>0) {
            $('.productionHidden').css({display: 'inline-block'}).show();
        }
    });

    $('textarea[name=design]').loadText('config/'+designFile+suffix, function () {
        var lines=$(this).val().split("\n");
        var RegAny = /\s*(\w*)\s*=(.*)/;
        var RegObject = /\s*(\w*)\s*=\s*@(.*)/;


        var objects = {};
        for(var i in lines) {
            var line = lines[i];
            var match = RegObject.exec(line);
            if(match) {
                objects[match[1]]=match[1];
            }
        }

        for(var i in lines) {
            var line = lines[i];
            var match = RegAny.exec(line);
            if(match) {
                var prop = match[1];
                var v=true;
                for(var k in objects) {
                    if(prop.indexOf(k)==0) v=false;
                }
                if(v) {
                    if(keywords[prop]) {

                    }else {
                        keywords[prop] = "variable-mandratory"
                    }
                }
            }
        }

        codeDesign = CodeMirror.fromTextArea(this, {
            extraKeys: {
                "'_'": passAndHint,
                "Ctrl-Space": "autocomplete"}
        });
        codeDesign.on("change", function(){
//            console.log("update",tags_definition);
            //TODO autocomplete
//            if (ELB_hints.needToShowHint){
//                ELB_hints.needToShowHint=false;
//                ELB_hints.cm.execCommand("autocomplete");
//            }
            $('#editor-design').addClass('changed');
            $('.save-all').addClass('changed');
        });
        CodeMirrorAdjust();
    });

    $('textarea[name=questions]').loadText('config/'+questionsFile+suffix, function () {
        codeQuestions = CodeMirror.fromTextArea(this);
        codeQuestions.on("change", function(){
            $('#editor-questions').addClass('changed');
            $('.save-all').addClass('changed');
        });
        CodeMirrorAdjust();

    });

    $('textarea[name=sounds]').loadText('config/'+soundsFile+suffix, function () {
        codeSounds = CodeMirror.fromTextArea(this);
        codeSounds.on("change",function () {
                $('#editor-sounds').addClass('changed');
                $('.save-all').addClass('changed');
        });
        CodeMirrorAdjust();

    });

    codeSupport = CodeMirror.fromTextArea($('textarea[name=support]').get(0),{
        readOnly: true,
        lineWrapping: true,
        mode:{name: "changes"}
    });
    CodeMirrorAdjust();
    codeSupport.setValue(version_text +"\n\n"+ sysinfo );

    $('#tab-questions').addClass('current');

    if ($("textarea[name=result]").is('*')){

    codeResult = CodeMirror.fromTextArea($('textarea[name=result]').get(0),{
        onChange:function () {
            $('#editor-design').addClass('changed');
            $('.save-all').addClass('changed');
        }
    });
    CodeMirrorAdjust();
    }



});

$('#reload-game').live('click', function () {
    window.location.reload();
});

$(document).on("click", '#check-new-version', function () {
    var query = "SELECT * FROM " +
        '1h5i3MvRcFOOtryEFwYbPAXkclu1URWNtmVznLcs' +
        ' WHERE "Version" > ' + core.version +
        ' ORDER BY "Version"';
    var encodedQuery = encodeURIComponent(query);
    // Construct the URL
    var url = ['https://www.googleapis.com/fusiontables/v1/query'];
    url.push('?sql=' + encodedQuery);
    url.push('&key=AIzaSyAODe_aJppmvReBY_VmttmBsketdKW4qTg');
    //
    var text=version_text+ " Checking new version...\n\n"+sysinfo;
    codeSupport.setValue(text);
    // Send the JSONP request using jQuery
    if (navigator.userAgent.toLowerCase().match(/msie/)){
        url.push('&callback=?');
    }
    $.ajax({
        url:url.join(''),
        dataType:'json',
        cache: false,
        error:function (xhr, err, err2) {
            codeSupport.setValue(version_text+ "Error checking update - " +xhr.statusText+"!\n\n"+sysinfo);
        },
        success:function (data) {
            if (data.rows) {
               text = version_text+ "Stable core version:" + data.rows[0][3] + ". Development core version:" + data.rows[data.rows.length-1][0] +" \n\nWhat's new: \n\n";
                for (var i = -1, len = data.rows.length; ++i < len;) {
                    if (data.rows[i][0] > data.rows[i][3]) {
                        text +="dev_"
                     }
//                    text += (data.rows[i][0] + "(" + data.rows[i][1] + "):" + data.rows[i][2] + "\n\n");
                    text += ("ver "+data.rows[i][0] +": "+ data.rows[i][2] + "\n");
                }
                text += "\n"+sysinfo;

            } else {
                text = version_text+ " You have newest core version!\n\n"+sysinfo;
            }
            codeSupport.setValue(text);
        }
    });
});

$('#reload-styles').live('click', function () {
    if (saving)return;
    if ($('#editor-design').hasClass('changed')) {
        saving = true;
        $.post('../core/config.php', {
            text:codeDesign.getValue(),
            path: path,
            file:designFile

        }, function () {
            $('#editor-design').removeClass('changed');
            game.reloadStyles();
            saving = false;
        });
    }
});

/* *************************** */
$('#save-design').live('click', function () {
    $.post('../core/config.php', {
        text:codeDesign.getValue(),
        path: path,
        file:designFile
    }, function () {
        $('#editor-design').removeClass('changed');
    });
});
$('#tab-design').live('click', function () {
    $('#editor-design').show();
    $('#editor-questions').hide();
    $('#editor-sounds').hide();
    $('#editor-support').hide();
    $('.editor-tabs a').removeClass('current');
    $(this).addClass('current');

    codeDesign.refresh();
});
/* *************************** */
$('#save-questions').live('click', function () {
    $.post('../core/config.php', {
        text:codeQuestions.getValue(),
        path: path,
        file:questionsFile
    }, function () {
        $('#editor-questions').removeClass('changed');
    });
});

$('#tab-questions').live('click', function () {
    $('#editor-design').hide();
    $('#editor-questions').show();
    $('#editor-sounds').hide();
    $('#editor-support').hide();
    $('.editor-tabs a').removeClass('current');
    $(this).addClass('current');

    codeQuestions.refresh();
});
/* *************************** */
$('#save-sounds').live('click', function () {
    $.post('../core/config.php', {
        text:codeSounds.getValue(),
        path: path,
        file:soundsFile
    }, function () {
        $('#editor-sounds').removeClass('changed');
    });
});
$('#tab-sounds').live('click', function () {
    $('#editor-design').hide();
    $('#editor-questions').hide();
    $('#editor-support').hide();
    $('#editor-sounds').show();

    $('.editor-tabs a').removeClass('current');
    $(this).addClass('current');

    codeSounds.refresh();
});


$('.save-all').live('click', function(){
    if ($('#editor-questions').hasClass('changed')){
        $('#save-questions').click();
    }
    if ($('#editor-design').hasClass('changed')){
        $('#save-design').click();
    }
    if ($('#editor-sounds').hasClass('changed')){
        $('#save-sounds').click();
    }
    $('.save-all').removeClass('changed');
});

$('.reset-all').live('click', function(){
    if(!confirm("Warning: You are about to load the default settings/text for this game. You will loose all edits that you'd done. If you want to keep your edits then you must make a copy of the game files before loading the defaults.")) {
        return false;
    }
    $.post('../core/config.php', {
        path: path,
        reset:questionsFile
    });
    $.post('../core/config.php', {
        path: path,
        reset:designFile
    });
    $.post('../core/config.php', {
        path: path,
        reset:soundsFile
    }, function () {
        window.location.reload();
    });
});

$('#tab-support').live('click', function () {
    $('#editor-design').hide();
    $('#editor-questions').hide();
    $('#editor-sounds').hide();
    $('#editor-support').show();

    $('.editor-tabs a').removeClass('current');
    $(this).addClass('current');
    codeSupport.refresh();
});



var saving = false;
setInterval(function () {
    if (saving)return;
    if ($('#editor-design').hasClass('changed') && $('#auto').is(':checked')) {
        saving = true;
        $.post('../core/config.php', {
            text:codeDesign.getValue(),
            path: path,
            file:designFile
        }, function () {
            $('#editor-design').removeClass('changed');
            game.reloadStyles();
            saving = false;
        });
    }
}, 3000);

var colorPalette = {};

$(document).live('color', function (e, data) {
    colorPalette[data.color] = data.color;
});
$(document).live('colorReset', function (e, data) {
    colorPalette = {};
});

function CodeMirrorAdjust() {
    $('.CodeMirror').each(function () {
        var td = $(this).closest('td');
        $(this).css('width', td.width() - 40);
    });
    $('.editor-help').each(function () {
        var td = $(this).closest('td');
        $(this).css('width', td.width() - 60);
    });
}
var oldWindowWidth = 0;
$(window).bind('resize', function () {
    if(oldWindowWidth!=$(window).width()) {
        CodeMirrorAdjust();
        oldWindowWidth = $(window).width();
    } else {
        /* We are on iPad */
    }
});

$(document).bind('gameLoaded', function () {


    var colors = [];
    for (var clr in colorPalette) {
        var n = new RGBColor(clr);
        if (n.ok) {
            colors[colors.length] = n.toHex();
        }
    }

    $('#ColorPicker').jPicker({
            widow:{
                alphaSupport:true
            },
            images:{
                clientPath:"../core/lib/images/"
            },
            color:{
                alphaSupport:true,
                quickList:colors
            }
        },
        function (color, context) {

        },
        function (color, context) {
            var all = color.val('all');
            $('#ColorPickerValueHex').val((all && '#' + all.hex || 'none'));
            $('#ColorPickerValueRgba').val("rgba(" + all.r + "," + all.g + "," + all.b + "," + (all.a / 255) + ")");

        });
});

$('#reset-questions').live('click', function () {
    if(!confirm("Warning: You are about to load the default settings/text for this game. You will loose all edits that you'd done. If you want to keep your edits then you must make a copy of the game files before loading the defaults.")) {
        return false;
    }
    $.post('../core/config.php', {
        path: path,
        reset:questionsFile
    }, function () {
       window.location.reload();
    });
});
$('#reset-design').live('click', function () {
    if(!confirm("Warning: You are about to load the default settings/text for this game. You will loose all edits that you'd done. If you want to keep your edits then you must make a copy of the game files before loading the defaults.")) {
        return false;
    }
    $.post('../core/config.php', {
        path: path,
        reset:designFile
    }, function () {
        window.location.reload();
    });
});
$('#reset-sounds').live('click', function () {
    if(!confirm("Warning: You are about to load the default settings/text for this game. You will loose all edits that you'd done. If you want to keep your edits then you must make a copy of the game files before loading the defaults.")) {
        return false;
    }
    $.post('../core/config.php', {
        path: path,
        reset:soundsFile
    }, function () {
        window.location.reload();
    });
});

$('.editor-append').live('click', function () {
   var src = codeDesign.getValue();
   for(var i=1;i<9;i++) {
       if(!empty($('input[name=src'+i+']').val())) {
           src = src.ReplaceAll($('input[name=src'+i+']').val(), $('input[name=trg'+i+']').val())
       }
   }
    codeResult.setValue(codeResult.getValue() + "\r\n\r\n"+src);
});
