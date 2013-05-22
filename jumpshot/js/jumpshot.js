/**
 * Copyright eLearning Brothers LLC 2012 All Rights Reserved
 */

var game = new function () {
    var designFile = "design.ini";
    var questionsFile = "questions.ini";
    var soundsFile = "sounds.ini";

    if (!empty(GAMEPREFIX)) {
        soundsFile = GAMEPREFIX + "-sounds.ini";
        questionsFile = GAMEPREFIX + "-questions.ini";
        designFile = GAMEPREFIX + "-design.ini";
    }

    var questions;
    var questionCount = 0;
    var quiz_percent = 0;
    var design;
    var sounds;
    var validity = -3;
    var instance = this;
    var score = 0;
    var answers = {};
    var questionIndex = 0;
    var timerOn = false;
    var timerPrev = null;
    var timerCount = 0;
    var angle = 0;
    var gameScore = 0;
    var gameTime = 0;
    var timeout = 0; /* NO TIMEOUT */
    var currentQuestionSound = null;
    var statistic = {};
    var start_time;
    var current_time;
    var is_first_play=0;


    /* -----------------------  LOADING ------------------------- */
    this.reloadStyles = function () {
        $.get("config/" + designFile, function (iniData) {
            design = parseIni(iniData);
            loadStyles();
        });
    }

    this.readConfig = function () {
        $.get("config/" + questionsFile, function (iniData) {
            iniData+=prepareIni(iniData,standartQuestionPattern);
            questions = parseIni(iniData);
            setOriginalQuestions(questions); defaultQuestionPostProcesor(questions);
            validity++;
            if (validity == 0) {
                $(document).trigger('gameLoaded');
            }
        });
        $.get("config/" + designFile, function (iniData) {
            design = parseIni(iniData);
            validity++;
            if (validity == 0) {
                $(document).trigger('gameLoaded');
            }
        });
        $.get("config/" + soundsFile, function (iniData) {
            sounds = parseIni(iniData, function (val) {
                var media = createSound(val);

                return media;
            });
            validity++;
            if (validity == 0) {
                $(document).trigger('gameLoaded');
            }
        });

    };

    var loadStyles = function () {
        instance.loadStyles();
    }
    var bindSounds = function () {
        instance.loadSounds();
    }
    var fillData = function () {
        instance.loadData();
    }

    $(document).bind('gameLoaded', function () {
        loadStyles();
        bindSounds();
        fillData();

        $('div.game').addClass('step-1');

        //instance.onGameLoaded();

        setInterval(function () {
            if (timerOn) {
                var newTime = new Date().getTime();
                instance.onTimePassed((newTime - timerPrev));
                timerPrev = newTime;
            }
        }, 100);
    });


    /* -----------------------  FUNCTIONS ------------------------- */


    function recalculateScore() {
        var answeredCount = 0; var correctAnsweredCount = 0;
        var answeredScore = 0;
        for (var k in answers) {
            answeredCount++;
            answeredScore += answers[k]; if(answers[k]>0) correctAnsweredCount++;
        }
        gameScore = answeredScore;
        instance.onUpdateScore(gameScore);
        instance.updateQuizPercent(correctAnsweredCount);
        instance.updateProgressText();
    }

    this.updateQuizPercent = function(count) {
        statistic.game_percent = (100*statistic.correct_answers/(statistic.incorrect_answers+statistic.correct_answers)).toFixed(0);
        quiz_percent = (100*count/questionCount).toFixed(2);
        $('div.game .quiz-percent-value').html(quiz_percent+"%");
    };
    this.updateProgressText = function() {
        $('div.game .progress-text').html(questionIndex+" of "+questionCount);
    };

    function startTimer() {
        timerPrev = new Date().getTime();
        timerOn = true;
    }

    function stopTimer() {
        timerOn = false;
    }

    /* -----------------------  GAME FLOW START ------------------------- */

    /* -----------------------  STEP-0 game start, reset all ------------------------- */
    this.start = function () {
		 questions = getOriginalQuestions(); defaultQuestionPostProcesor(questions);
        instance.loadData();
        tRewind(sounds.finish);
        tRewind(sounds.conclusion);
        if (!onlyOneSound) {
            setTimeout(function () {
                tRewind(sounds.start);
                tPlay(sounds.start, PRIORITY_NORMAL);
            }, 10);
        }

        statistic.correct_answers=0;    //every correct answer
        statistic.incorrect_answers=0;  //every incorrect attempt
        statistic.fail_answers=0;       //when all attempts was incorrect
        statistic.questions_time={};
        statistic.questions_answers={};

        answers = {};
        questionIndex = 0;
        timerCount = 0;

        gameTime = 0;
        gameScore = 0;

        stopTimer();

        $('div.game div.score').html(0);
        $('div.game div.time').html(0);

        $('#game').removeClass('step-0').addClass('step-1');
        $(document).trigger('gameStarted');
    }

    /*this.onGameLoaded = function () {
        instance.prepareAnimationFrame();
    }*/

    /* -----------------------  STEP-1 Logo, Splash screen ------------------------- */

    liveFastClick('div.game a.button-game-start-1', function () {
        $('#game').removeClass('step-1').addClass('step-2');
        if (onlyOneSound) {
            tRewind(sounds.start);
            if (web_audio_api_player.init()){
                if (sounds.introduction!=null){
                    tPlay(sounds.start, PRIORITY_NORMAL);
                    if ($('#game').hasClass('step-2')){
                        tRewind(sounds.start, 3, 1);
                        tPlay(sounds.introduction, PRIORITY_NORMAL,4);
                    }
                }
                else {tPlay(sounds.start, PRIORITY_NORMAL);}
            }
            else {
                if (sounds.introduction!=null){
                    tPlay(sounds.introduction, PRIORITY_NORMAL);
                }
                else {tPlay(sounds.start, PRIORITY_NORMAL);}
            }
        } else {
            tRewind(sounds.start);
            if (sounds.introduction!=null){
                tPlay(sounds.introduction, PRIORITY_NORMAL);
            }
        }
    });

    /* -----------------------  STEP-2 Intro to game, it's description ------------------------- */

    liveFastClick('div.game #step2continuebutton', function() {
        tRewind(sounds.start);
        tRewind(sounds.introduction);
        $('#game').removeClass('step-2');
       // $('#animation').show();
        start_time= new Date().getTime();
        questionIndex = 0;
        instance.onQuestionChooseRequired();
    });

    this.onQuestionChooseRequired = function() {
        questionIndex++;
        onQuestionIndexApplied();
    }
    /* -----------------------  STEP-3 Questions choosing board ------------------------- */

    /**
     * New question index is set, show it and start timers
     */
    function onQuestionIndexApplied() {
        if (!empty(questions['q' + questionIndex])) {
            startTimer();
            $('#game').removeClass('step-3');
            questionShow(questionIndex);
        } else {
            $('#game').removeClass('step-3');
            $('#game').removeClass('step-4');
            if ($('div.game .score').html() != 0){
                $('#game').addClass('step-6');
                if (sounds.game_introduction!=null){
                    tPlay(sounds.game_introduction, PRIORITY_NORMAL);
                }
            } else {finishGame()}
            //finishGame();
        }
    };

    /**
     * On animation end
     */
    $(document).bind('endDraw', function () {
        questionIndex++;

       alert ('end draw');
        $('#game').addClass('step-3');
    });

    /**
     * On pressing continue button on question board screen
     */
    liveFastClick('div.game #step3continuebutton', function () {
        onQuestionIndexApplied();
    });

    /**
     * No more questions available, go to finish screen, send score to SCROM
     */
    function finishGame() {
        $('#game').removeClass('step-7');
        $('#game').addClass('step-5');
        $('div.game #step7continuebutton').hide();
        $('div.game .basket1').css({backgroundImage: 'none'});
        flashBackground('start');

        if (sounds.conclusion!=null){
            tPlay(sounds.conclusion, PRIORITY_NORMAL);
        }
        else {tPlay(sounds.finish, PRIORITY_NORMAL);}
        recalculateScore();
        try {
            SCOSetValue("time", gameTime);
            SCOSetValue("score", quiz_percent);
            SCOSetValue("completed", 1);
            SCOSetValue("balls", $('div.game .progressbar_ball').html());
            SCOCommit();
        } catch (e) {
            console.error("Scorm failed -", e);
        }
        if('undefined' !==  typeof gameloader ){
            gameloader.send_results(statistic);
        }
        quiz_percent = 0;
        $(document).trigger('gameFinished',[statistic]);

       // $('#animation').fadeOut();
    }

    /* -----------------------  STEP-4 Answers ------------------------- */

    /**
     * Show question board for index i
     * @param i
     */
    function questionShow(i) {
        $('#game').addClass('step-4');
        var question = questions['q' + i];

        var score = nvl(question.score,1); /* Question score is optional, default 1 per question */
        var wscore = nvl(question.wrong_score,1); /* Question wscore is optional, default 1 per question */
        current_time= (new Date().getTime());
        if (statistic.questions_answers['q' + i] != 0) statistic.questions_time['q' + i] = 0;//reset question time on start/correct/fail (don't reset on incorrect)
        $('#game').data('question', question).data('score', score).data('wscore', wscore);


        $('div.game .step-4').removeClass("type-multiple");
        conditionalShow($('.question-block h1'),question.title);
        $('div.game .question-block div').html(value(question.text));
        $('div.game .question-choose').html("");
        $('div.game div.progressbar').html("");
        $('div.game div.progressbar').append("<div>"+i+"/"+questionCount+"</div>");
        var correct = value(question.correct_answer).split(',');

        var i = 1;
        var order = [];

        while (!empty(value(question['answer_' + i]))) {

            var variant = $("<div class='variant'><div class='table'><div>" + value(question['answer_' + i]) + "</div></div></div>");
            variant.data('correct', false);
            for (var k in correct) {
                if (i == correct[k].trim()) {
                    variant.data('correct', true);
                }
            }
            order[order.length] = variant;
            i++;
        }
        if (questions.randomize_answer_order) {
            order.sort(function () {
                return 0.5 - Math.random()
            });
        }

        for (var k in order) {
            $('div.game .question-choose').append(order[k]);
        }

        if (!empty(question.type)) {
            $('div.game .step-4').addClass("type-" + value(question.type));
        }
        if(!empty(question.audio)) {
            currentQuestionSound = createSound(value(question.audio), true);
            tPlay(currentQuestionSound, PRIORITY_HI);
        } else {
            currentQuestionSound = null;
        }

        $('div.game .question-block-wrapper').removeClass('transparent');
        removeBackgroundApply($('div.game .question-block-wrapper'), question);
        if (!empty(question.image)) {
            var image = value(question.image);
            var removeBackground = true;
            if (!empty(question.removeBackground)) {
                removeBackground |= stringToBoolean(value(question.removeBackground));
            }
            $('div.game .question-block-wrapper>div.question-image').css('background-image', 'url("' + parseImgPath(image, true) + '")');
        } else {
            $('div.game .question-block-wrapper>div.question-image').css('background-image', 'none');

        }

       $('.question-block-wrapper').css({opacity:0}).animate({opacity:1}, 'slow');

        $('#game .step-4').removeClass('answered').addClass('unanswered').removeClass('correct').removeClass('incorrect');
       // instance.setupAnimationForQuestion(i);
    }

    function questionHide(i) {
        instance.onQuestionHide(i);
    }

    /**
     * Question is hidden, do custom actions
     */
    this.onQuestionHide = function(questionI) {
        onQuestionIndexApplied();
    }

    liveFastClick('div.game div.question-choose .variant', function () {
        $(this).toggleClass('choosed');
        answerChanged();
    });

    /**
     * Answer is changed
     */
    var answerChanged = function () {
        if (!$('div.game div.step-4').hasClass('type-multiple')) {
            answerConfirmed();
        }
    };


    liveFastClick('div.game a.button-question-confirm', function () {
        answerConfirmed();
    });

    /**
     * Answer is confirmed
     */
    var answerConfirmed = function () {
        if(currentQuestionSound) {
            tRewind(currentQuestionSound);
        }
        var question = $('#game').data('question');
        var lscore = $('#game').data('score');
        var wscore = $('#game').data('wscore');
        var answerIndex = -1;
        statistic.questions_time['q'+questionIndex]+= (new Date().getTime())-current_time;

        var allCorrectRequired = $('div.game div.step-4').hasClass('type-multiple');
        var correct = allCorrectRequired;

        $('div.game div.question-choose').find('.variant').each(function () {

            /* If required all correct answers to be choosed */
            if (allCorrectRequired && $(this).hasClass('choosed') != $(this).data('correct')) {
                correct = false;
            }

            /* If required one correct answers to be choosed */
            if (!allCorrectRequired && $(this).hasClass('choosed') && $(this).data('correct')) {
                correct = true;
            }

            if($(this).hasClass('choosed')) {
                answerIndex=$(this).index();
            }
        });

        if (correct) {
            stopTimer();

            tRewind(sounds.correct);
            tPlay(sounds.correct, PRIORITY_NORMAL);


            answers[questionIndex] = parseInt(lscore);
            score = parseInt($('div.game div.score').html()) + parseInt(lscore);
            statistic.questions_answers['q' + questionIndex] = 1;
            statistic.correct_answers++;

            $('div.game .question-answered-block div').html(value(question.correct_feedback_text));
            $('div.game .step-4').addClass('correct');
        } else {

            tRewind(sounds.incorrect);
            tPlay(sounds.incorrect, PRIORITY_NORMAL);

            if (score = parseInt($('div.game div.score').html()) + parseInt(wscore) < 0) {
                score=0;
                answers[questionIndex] =  -parseInt($('div.game div.score').html());
            } else {
                answers[questionIndex] = parseInt(wscore);
            }
            statistic.questions_answers['q' + questionIndex] = 0;
            statistic.incorrect_answers++;
            statistic.fail_answers++;

            $('div.game .question-answered-block div').html(value(question.incorrect_feedback_text));

            $('div.game .step-4').addClass('incorrect');
        }
        recalculateScore();
        $('div.game .step-4').removeClass('unanswered').addClass('answered');

       // instance.onAnswerConfirmed(correct, answerIndex);
    };

    /**
     * Answer is confirmed, run custom actions like animations
     * @param correct
     * @param answerIndex
     */
    /*this.onAnswerConfirmed = function(correct, answerIndex) {
        this.runAnimationToQuestion(questionIndex, {correct: correct, answer: answerIndex});
        $('div.progressbar').each(function(){$(this).find('div:eq('+(questionIndex-1)+')').addClass('answered');});

        if(correct) {
            $('div.progressbar').each(function(){$(this).find('div:eq('+(questionIndex-1)+')').addClass('correct').removeClass('incorrect');});
        } else {
            $('div.progressbar').each(function(){$(this).find('div:eq('+(questionIndex-1)+')').addClass('incorrect');});
        }
    }*/

    liveFastClick('div.game a.button-question-continue', function () {
        var ans_div=$('div.game .step-4');
        if (ans_div.hasClass('incorrect')){
            /* If we need to return to question if answer incorrectly do */
            /* questionShow(questionIndex); */

            /* Else go to next question */
            questionIndex++;
            questionHide(questionIndex);
            recalculateScore();
        } else if (ans_div.hasClass('correct')){
            questionIndex++;
            questionHide(questionIndex);
            recalculateScore();
        }
    });

    /* -----------------------  STEP-5 Results ------------------------- */

    liveFastClick('div.game a.button-result-continue', function () {
        $('#game').removeClass('step-5');
        flashBackground('stop');
        $('div.game .progressbar_ball').html(0);
        //game.resetAnimation();
        game.start();
    });


    /* -----------------------  STEP-6 Game_intro ------------------------- */
    var timer_ball_global
    liveFastClick('div.game #step6continuebutton', function() {
        tRewind(sounds.game_introduction);
        $('#game').removeClass('step-6').addClass('step-7');
        $('div.game .step-7-animation').show();
        if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)){
            $('div.game .step-7-animation').css ('cursor','pointer'); //fix for mobile browsers
        }
        timer_ball_global = setInterval(check_time, 1000);
        if ($('div.game .score').html() != 0){new_ball();}

    });

    /* -----------------------  STEP-7 Game_ball ------------------------- */

    var curr_bal_number = 0;
    var balls = [];
    var angle_of_ball= [];
    var angle_step=10;
    var new_ball_timer;
    function check_time(){ //if time is over - stop game
        var temp_score_link =$('div.game .score');

        if  (temp_score_link.html() == 0 ||temp_score_link.html() == 1) {
            clearInterval(timer_ball_global);
            temp_score_link.html('0');
            $('div.game #step7continuebutton').show();
           // $('.step-7-animation').die();
            $('div.game .animation').remove();
            clearInterval(new_ball_timer);
            $('div.game .step-7-animation').hide();
            setTimeout($('div.game .animation').remove(), 500);
            setTimeout($('div.game .animation').remove(), 1000);

        } else {
            temp_score_link.html(temp_score_link.html()-1);
        }
    }

    function new_ball() {
        var ball_move_left_time = parseInt(questions.ball_move_left_time);
        var ball_move_right_time = parseInt(questions.ball_move_right_time);
        balls[curr_bal_number]=$('<div class=animation></div>').appendTo('div.game .step-7');
        angle_of_ball[curr_bal_number]=0;
        for (i=0; i<120; i++){
        balls[curr_bal_number].css({top:355, left:95}).animate({left: 520},ball_move_right_time,'linear').animate({left: 95},ball_move_left_time,'linear');
        }
    }

    liveFastClick('div.game .step-7-animation', function(){
        if (onlyOneSound && !is_first_play) {
            if (web_audio_api_player.init()){
                tPlay(sounds.basket)
            } else {
                sounds.basket.play();
                sounds.basket.pause();
            }
                is_first_play=1;
        };
        var inside_ball = curr_bal_number;
        var i=0;
       balls[inside_ball].stop(true);
       balls[inside_ball].animate({top: 55, width:40, height:40},{
           duration:400,
           easing:'linear',
           step: function(){step_rotate(inside_ball)},
           complete: function (){
               var position_of_ball =balls[inside_ball].position();
               if (position_of_ball.left>303 && position_of_ball.left<378){
                   ball_in_center(inside_ball);
               } else if (position_of_ball.left>230 && position_of_ball.left<303){
                   ball_in_left(inside_ball);
               } else if (position_of_ball.left>378 && position_of_ball.left<450){
                   ball_in_right(inside_ball);
               } else {
                   ball_in_no_board(inside_ball);
               }
           }
       });
       curr_bal_number++;
        new_ball_timer=setTimeout(new_ball,  parseInt(questions.ball_new_time));
    });

    function step_rotate(inside_ball_step){
        balls[inside_ball_step].css({"-webkit-transform": "rotate("+angle_of_ball[inside_ball_step]+"deg)",
            "-moz-transform": "rotate("+angle_of_ball[inside_ball_step]+"deg)",
            "-ms-transform": "rotate("+angle_of_ball[inside_ball_step]+"deg)",
            "transform": "rotate("+angle_of_ball[inside_ball_step]+"deg)",
            "-o-transform": "rotate("+angle_of_ball[inside_ball_step]+"deg)"});
        angle_of_ball[inside_ball_step]+= angle_step;
   }


    function ball_in_center (inside_ball_center){
        var i=0;
        var n= [2,2,2,3,3,3,4,4,4,3,3,3,2,2,2];
        tPlay(sounds.basket, PRIORITY_NORMAL);
        balls[inside_ball_center].css({'z-index':4});
        balls[inside_ball_center].animate({top: 110, left:345},{
            duration:100,
            easing:'linear',
            step: function(){step_rotate(inside_ball_center)},
            complete: function (){
                balls[inside_ball_center].animate({top: 205},{
                    duration:150,
                    easing:'linear',
                    step: function(){
                         $('div.game .basket1').css({backgroundImage: 'url("../'+GAMEPREFIX+'/config/images/basket'+n[i]+'.png")'})
                        i++;
                    },
                    complete: function (){
                        var temp_div =$('div.game .progressbar_ball');
                        temp_div.html(parseInt(temp_div.html())+1);
                        balls[inside_ball_center].animate({top: 245},{
                            duration:150,
                            easing:'linear',
                            step: function(){step_rotate(inside_ball_center)},
                            complete: function (){
                                balls[inside_ball_center].animate({top: 150, width:15, height:15},{
                                    duration:300,
                                    easing:'linear',
                                    step: function(){step_rotate(inside_ball_center)},
                                    complete: function (){
                                        balls[inside_ball_center].remove();
                                    }

                                });

                            }
                        });
                    }
                });
            }
        });
    }


    function ball_in_left (inside_ball_left){
        balls[inside_ball_left].animate({top: 85, left:290, width:45, height:45},{
            duration:200,
            easing:'linear',
            step: function(){step_rotate(inside_ball_left)},
            complete: function (){
                balls[inside_ball_left].animate({top: 260, left:60, width:30, height:30},{
                    duration:300,
                    easing:'linear',
                    step: function(){step_rotate(inside_ball_left)},
                    complete: function (){
                        balls[inside_ball_left].animate({top: 280, left:-50, width:15, height:15},{
                            duration:300,
                            easing:'linear',
                            step: function(){step_rotate(inside_ball_left)},
                            complete: function (){
                                balls[inside_ball_left].remove();
                            }
                        });
                    }
                });
            }
        });
    }

    function ball_in_right (inside_ball_right){
        balls[inside_ball_right].animate({top: 85, left:395, width:45, height:45},{
            duration:200,
            easing:'linear',
            step: function(){step_rotate(inside_ball_right)},
            complete: function (){
                balls[inside_ball_right].animate({top: 260, left:630, width:30, height:30},{
                    duration:300,
                    easing:'linear',
                    step: function(){step_rotate(inside_ball_right)},
                    complete: function (){
                        balls[inside_ball_right].animate({top: 280, left:740, width:15, height:15},{
                            duration:300,
                            easing:'linear',
                            step: function(){step_rotate(inside_ball_right)},
                            complete: function (){
                                balls[inside_ball_right].remove();
                            }
                        });
                    }
                });
            }
      });
    }

    function ball_in_no_board(inside_ball_no_board){
        balls[inside_ball_no_board].animate({top: 25, width:25, height:25},{
            duration:200,
            easing:'linear',
            step: function(){step_rotate(inside_ball_no_board)},
            complete: function (){
                balls[inside_ball_no_board].animate({top: 150, width:15, height:15},{
                    duration:400,
                    easing:'linear',
                    step: function(){step_rotate(inside_ball_no_board)},
                    complete: function (){
                        balls[inside_ball_no_board].remove();
                    }
                });
            }
        });
    }

    liveFastClick('div.game #step7skipbutton, div.game #step7continuebutton', function (){
      clearTimeout(timer_ball_global);
        $('div.game .animation').remove();
      finishGame();
    });

    /* ----------------- ANIMATIONS ----------------- */


    /* ----------------- TIMER ------------------- */
    this.onTimePassed = function (deltaTime) {
        gameTime+=deltaTime;
        $('div.game div.time').html((parseFloat(gameTime)/1000).toFixed(2));
        if(timeout && gameTime>timeout) {
            this.onTimeOut();
        }
    }

    this.onTimeOut = function () {
        /* PUT TIMEOUT CODE HERE IF ANY */
    }

    /* ----------------- SCORE ------------------- */
    this.onUpdateScore = function(score) {
        $('div.game div.score').html(score);
    }

    /* -----------------------  GAME FLOW END ------------------------- */



    /* ----------------- GAME SPECIFIC LOADERS ------------------- */
    this.loadStyles = function () {
        applyDefaultStyles(design);
        /* Fill game DESIGN */

        if(!hoverDisable) {
         //   dynamicCssInstance.addRuleForImage('div.game .questions div.question:hover>div>div>div', design.question_block.images.hover, "background-image:url('$v')");
            dynamicCssInstance.addCompiled('div.game .question-choose .variant:hover', design.question_button_over);
            dynamicCssInstance.addCompiled('div.game a.button:hover', design.button_over);
        }

        dynamicCssInstance.addCompiled('div.game div.logo1', design.logo1);
        dynamicCssInstance.addCompiled('div.game div.logo2', design.logo2);
        dynamicCssInstance.addCompiled('div.game div.logo3', design.logo3);

        dynamicCssInstance.addCompiled('div.game a.button', design.button_up);
        dynamicCssInstance.addCompiled('div.game a.button:active', design.button_down);

        dynamicCssInstance.addCompiled('div.game .question-choose .variant', design.question_button_up);
        dynamicCssInstance.addCompiled('div.game .question-choose .variant:active', design.question_button_over);
        dynamicCssInstance.addCompiled('div.game .question-choose .variant.choosed', design.question_button_selected);

        dynamicCssInstance.addCompiled('div.game #step1continuebutton', design.splash_page_button_continue);
        dynamicCssInstance.addCompiled('div.game #step2continuebutton', design.intro_page_button_continue);
        dynamicCssInstance.addCompiled('div.game #step4continuebutton', design.question_page_button_continue);
        dynamicCssInstance.addCompiled('div.game #step4confirmbutton', design.question_page_button_confirm);
        dynamicCssInstance.addCompiled('div.game #step5replaybutton', design.result_page_button_replay);
        dynamicCssInstance.addCompiled('div.game #step6continuebutton', design.before_game_button_continue);
        dynamicCssInstance.addCompiled('div.game #step7continuebutton', design.in_game_button_continue);
        dynamicCssInstance.addCompiled('div.game #step7skipbutton', design.in_game_button_skip);
        dynamicCssInstance.addCompiled('div.game .quiz-percent-value', design.quiz_percent_value);
        dynamicCssInstance.addCompiled("div.game .question-choose .variant:active", design.question_button_down);

        //dynamicCssInstance.addCompiled('div.game .questions div.question>div>div>div>div', design.question_score);

        dynamicCssInstance.addCompiled('div.game div.step-2-description', design.description_panel);
        dynamicCssInstance.addCompiled('div.game div.step-6-description', design.step6_description);
        dynamicCssInstance.addCompiled('div.game div.step-7', design.basseball_field);
        dynamicCssInstance.addCompiled('div.game div.result-block-wrapper', design.result_panel);

        //  dynamicCssInstance.addCompiled('div.game .questions div.question>div', design.question_block);
        // dynamicCssInstance.addCompiled('div.game .questions div.question.answered>div', design.question_block.answered);

        dynamicCssInstance.addCompiled('div.game .question-block-wrapper', design.question_box);

        //dynamicCssInstance.addRuleForImage('div.game .questions div.question>div>div', design.question_block.images.background, "background-image:url('$v')");
        //dynamicCssInstance.addRuleForImage('div.game .question-block-wrapper>div.question-block-wrapper-inner', design.question_block.images.big, "background-image:url('$v')");
        //dynamicCssInstance.addRuleForImage('div.game .questions div.question.correct>div>div>div', design.question_block.images.correct, "background-image:url('$v')");
        //dynamicCssInstance.addRuleForImage('div.game .questions div.question.incorrect>div>div>div', design.question_block.images.incorrect, "background-image:url('$v')");


        dynamicCssInstance.addRule("div.game .step-4.answered.correct .question-answered-block-wrapper h1", design.question_answer_correct_color, "color: $v");
        dynamicCssInstance.addRule("div.game .step-4.answered.incorrect .question-answered-block-wrapper h1", design.question_answer_incorrect_color, "color: $v");

        //dynamicCssInstance.addCompiled('div.game .categories div.category', design.question_category);
        if(!empty(design.score_box)) {
            dynamicCssInstance.addCompiled("div.game div.scoreboard", design.score_box);
        }
        if(!empty(design.question_screen)) {
            var object = dozerMapper(design.question_screen, ["width", "height", "X", "Y", "padding", "paddingX", "paddingY","margin","marginX","marginY","marginTop","marginBottom","marginLeft","marginRight"]);
            dynamicCssInstance.addCompiled("div.game .question-choose-wrapper", object);
            dynamicCssInstance.addCompiled("div.game .question-block-wrapper", object);
            dynamicCssInstance.addCompiled("div.game .question-answered-block-wrapper", object);}
        dynamicCssInstance.addCompiled("div.game .progressbar", design.progressbar_container);
        dynamicCssInstance.addCompiled("div.game .progressbar_ball", design.progressbar_ball);
        dynamicCssInstance.addCompiled("div.game .ball_logo", design.small_ball);
        dynamicCssInstance.addCompiled("div.game div.score", design.score_text);
        dynamicCssInstance.addCompiled("div.game .question-choose-wrapper",design.question_choose_wrapper);
        dynamicCssInstance.addCompiled("div.game .question-answered-block-wrapper", design.question_feedback_box);
        dynamicCssInstance.flush();

        var qCount = defaultQuestionCount(questions);

        // var paddingTMP = design.progressbar_container.paddingX || design.progressbar_container.padding || 0;
        //  var totalWidth = 1*value(design.progressbar_container.width)-qCount*value(design.progressbar_container.spacing) - 2*paddingTMP;
        //  var elementWidth = Math.floor(totalWidth/qCount);
        // dynamicCssInstance.addRule("div.game .progressbar>div", elementWidth, "width: $vpx");
        //  dynamicCssInstance.addRule("div.game .progressbar>div", design.progressbar_item.width, "width: $vpx");

        dynamicCssInstance.flush();
    };
    this.loadSounds = function () {
        if (questions.introduction_audio != null){
            sounds.introduction = createSound(questions.introduction_audio, true);
        }
        if (questions.conclusion_audio != null){
            sounds.conclusion = createSound(questions.conclusion_audio, true);
        }
        if (questions.game_introduction_audio != null){
            sounds.game_introduction = createSound(questions.game_introduction_audio, true);
        }
        if (onlyOneSound) {
            liveFastClick('div.game  a:not(#step4confirmbutton)', function () {
                tPlay(sounds.select, PRIORITY_LOW);
            });
            liveFastClick('div.game  .questions div.question:not(.answered):not(.hasOwnSound)', function () {
                tPlay(sounds.select, PRIORITY_LOW);
            });
            liveFastClick('div.game .type-multiple .question-choose .variant', function () {
                tPlay(sounds.select, PRIORITY_LOW);
            });
        } else {
            liveFastClick('div.game a, div.game  .questions div.question:not(.answered), div.game .question-choose .variant', function () {
                tPlay(sounds.select, PRIORITY_LOW);
            });
            if (!hoverDisable) {
                $('.game a, .game .questions div.question:not(.answered), div.game .question-choose .variant').live('mouseenter', function () {
                    tPlay(sounds.hover, PRIORITY_LOW);
                });
            }
        }
    }
    this.loadData = function () {
        questions.randomize_question_order = stringToBoolean(questions.randomize_question_order);
        questions.randomize_answer_order = stringToBoolean(questions.randomize_answer_order);
        timeout = nvl(questions.timeout,0) * 1000;

        /* FILL GAME TEXT */
        $("div.game #step1continuebutton").html("" + value(questions.splash_page_button_continue_text));
        $("div.game #step2continuebutton").html("" + value(questions.intro_page_button_continue_text));
        $("div.game #step4continuebutton").html("" + value(questions.question_page_button_continue_text));
        $("div.game #step4confirmbutton").html("" + value(questions.question_page_button_confirm_text));
        $("div.game #step5replaybutton").html("" + value(questions.result_page_button_replay_text));
        $("div.game #step6continuebutton").html("" + value(questions.before_game_page_button_continue_text));
        $("div.game #step7continuebutton").html("" + value(questions.in_game_button_continue_text));
        $("div.game #step7skipbutton").html("" + value(questions.in_game_button_skip_text));
        $('div.game div.step-2-description div.description div').html("" + value(questions.introduction_text));

        $('div.game div.step-6-description div.description div').html("" + value(questions.introduction_step6));

        $('div.game div.result-block div.description').html("" + value(questions.conclusion_text));

        questionCount = defaultQuestionCount(questions);

        $('div.game div.progressbar').html("");
        for(i=0;i<questionCount;i++) $('div.game div.progressbar').append("<div></div>");

    }

};

$(document).ready(function () {
    game.readConfig();
    $('.game').css('opacity', 0.1);
});

$(window).load(function () {

});

$(document).bind('gameLoaded', function () {
    SCOPreInitialize();
    SCOInitialize();
    $('.game').css('opacity', 1);
    game.start();
});