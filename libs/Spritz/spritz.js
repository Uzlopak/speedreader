// spritz.js
// A JavaScript Speed Reader
//
// a fork of
// rich@gun.io
// https://github.com/Miserlou/OpenSpritz

(function ( $ ) {
    $.fn.spritzify = function( action, options ) {
    	obj = this;
    	
    	switch (action){
    		case 'start':
    			start(options);
    			break;
    		case 'continue':
    			start(obj.data('current'))
    			break;
    		case 'stop':
    			stop();
    			break;
    		case 'restart':
    			restart();
    			break;
    		case 'rewind':
    			rewind();
    			break;
    		case 'val':
    			val(options);
    			break;
    		case 'setText':
    			setText(options);
    			break;
    		case 'setWordsPerMinute':
    			setWordsPerMinute(options);
    			break;
    		case 'create':
			default:
		    	var textContainer = null;
				text = '';
				create(this);
    			break;
    	}
    	return this;
    };
    
    
    function create (options){
    	options = $.extend({
    		notchPosition : 5
    	}, options);
    	//remove all child Elements
    	obj.empty();
        
    	obj.addClass("spritz_container");
        
        textContainer = $('<div class="spritz_text"></div>');
        obj.append('<div class="guide_top"></div>');
        obj.append(textContainer);
        obj.append(' <div class="guide_bottom"></div>');
        
        setWordsPerMinute(200);
    	obj.data('timerId', null);
    	obj.data('current', 0);
    	obj.data('end', 0);
    	setNotchPosition(options.notchPosition);
    	

        val('ready', options.notchPosition);
    };
    
    function setNotchPosition (position){
    	position = position || 5;
    	
    	switch (position){
    		case 5: 
    		case 6:
    		case 7: 
    			break;
    		default: 
    			position = 5;
    	}
    	obj.removeClass('notchPosition5 notchPosition6 notchPosition7');
    	obj.data('notchPosition', position);
    	obj.addClass('notchPosition' + position);
    }

    function setWordsPerMinute(wpm ) {
    	var wpm = parseInt(wpm, 10) || 200;
        obj.data('wpm', wpm);
        if (obj.data('timerId') != null){
        	stop();
        	start(obj.data('current'));
        }
    }

    function start(startPos) {
    	var startPos = parseInt(startPos,10) || 0;
    	
    	obj.data('current', startPos);
    	
    	if (obj.data('running') != null) {
    		debug('Error 0x0001 Already running');
    		return;
    	}
    	var ms_per_word = 60000/ obj.data('wpm');
    	
    	var timerId = setInterval(function() {
    		var current = obj.data('current');
    		var end = obj.data('end');
            if(current >= end) {
            	obj.data('current', 0);
                stop();
            }else{
            	val(all_words[current], obj.data('notchPosition'));
            	obj.data('current', ++current);
            }
        }, ms_per_word)
        
    	obj.data('timerId', timerId);
    }

    function rewind() {
    	obj.data('current', 0);
    }
    function stop() {
    	if (obj.data('timerId') != null) {
    		clearInterval(obj.data('timerId'));
    		obj.data('timerId', null);
    	}
    }
    
    function restart(){
    	stop();
    	start();
    }

    function val (word, notchPosition) {
    	word = word || '';
    	textContainer.empty();
    	textContainer.append(pivot(word, notchPosition));
    }
    
    function setText(text) {
        var all_words_temp = splitTextIntoWordQueue(text);
        var word = '';
        var result = '';

        // Preprocess words
        var temp_words = all_words_temp.slice(0); // copy Array
        var t = 0;

        for (var i=0; i<all_words_temp.length; i++){

            if(all_words_temp[i].indexOf('.') != -1){
                temp_words[t] = all_words_temp[i].replace('.', '&#8226;');
            }

            // Double up on long words and words with commas.
            if((all_words_temp[i].indexOf(',') != -1 || all_words_temp[i].indexOf(':') != -1 || all_words_temp[i].indexOf('-') != -1 || all_words_temp[i].indexOf('(') != -1|| all_words_temp[i].length > 8) && all_words_temp[i].indexOf('.') == -1){
                temp_words.splice(t+1, 0, all_words_temp[i]);
                temp_words.splice(t+1, 0, all_words_temp[i]);
                t++;
                t++;
            }

            // Add an additional space after punctuation.
            if(all_words_temp[i].indexOf('.') != -1 || all_words_temp[i].indexOf('!') != -1 || all_words_temp[i].indexOf('?') != -1 || all_words_temp[i].indexOf(':') != -1 || all_words_temp[i].indexOf(';') != -1|| all_words_temp[i].indexOf(')') != -1){
                temp_words.splice(t+1, 0, " ");
                temp_words.splice(t+1, 0, " ");
                temp_words.splice(t+1, 0, " ");
                t++;
                t++;
                t++;
            }

            t++;

        }

        all_words = temp_words.slice(0);
        obj.data('end', all_words.length);
    } 
    
	function getBestLetter(length) {
		"use strict";
		
		var length = length || 0;
	    var bestLetter = 1;
	    
	    switch (length) {
	        case 1:
	            bestLetter = 1; // first
	            break;
	        case 2:
	        case 3:
	        case 4:
	        case 5:
	            bestLetter = 2; // second
	            break;
	        case 6:
	        case 7:
	        case 8:
	            bestLetter = 3; // third
	            break;
	        case 9:
	        case 10:
	        case 11:
	        case 12:
	            bestLetter = 4; // fourth
	            break;
	        case 13:
	        default:
	            bestLetter = 5; // fifth
	    };
	    return bestLetter;
	}
	
	function splitTextIntoWordQueue(text){
		var text = text || '';
		
	    // Split on any spaces.
	    var all_words = text.split(/\s+/);

	    // The reader won't stop if the selection starts or ends with spaces
	    if (all_words[0] == "")
	    {
	        all_words = all_words.slice(1, all_words.length);
	    }

	    if (all_words[all_words.length - 1] == "")
	    {
	        all_words = all_words.slice(0, all_words.length - 1);
	    }
	    return all_words;
	}
	
	// Find the red-character of the current word.
	function pivot(word, notchPosition){
		word = word || '';
		notchPosition = notchPosition || 5;
	    var length = word.length;

	    var bestLetter = getBestLetter(length);

	    word = decodeEntities(word);
	    var start = '&nbsp;'.repeat((notchPosition-bestLetter)) + word.slice(0, bestLetter-1);
	    var middle = word.slice(bestLetter-1,bestLetter);
	    var end = word.slice(bestLetter, length) + '&nbsp;'.repeat((notchPosition-(word.length-bestLetter)));

	    var result = '';
	    
	    result += "<span class='spritz_begin'>" + start;
	    result += "</span><span class='spritz_pivot'>";
	    result += middle;
	    result += "</span><span class='spritz_end'>";
	    result += end;
	    result += "</span>";

	    return $(result);
	}
	
	function debug (options){
		console.log(options);
	}
	
}( jQuery ));

//////
//Helpers
//////

//Let strings repeat themselves,
//because JavaScript isn't as awesome as Python.
String.prototype.repeat = function( num ){
 if(num < 1){
     return new Array( Math.abs(num) + 1 ).join( this );
 }
 return new Array( num + 1 ).join( this );
};


function decodeEntities(s){
    var str, temp= document.createElement('p');
    temp.innerHTML= s;
    str= temp.textContent || temp.innerText;
    temp=null;
    return str;
}

//This is a hack using the fact that browers sequentially id the timers.
function clearTimeouts(){
	var id = window.setTimeout(function() {}, 0);
	
	while (id--) {
	    window.clearTimeout(id);
	}
}