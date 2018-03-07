/**
* n: Mahesh K.S.
* e: mahesh25242@gmail.com
*/
(function ( $ ) {
 const VERSION = '0.3.1-alpha';
    $.fn.jQquiz = function( options ) {
        // This is the easiest way to have default options.
        var settings = $.extend({
            // These are the defaults.
            dataSource: [],
			loadingGif: null,
			dom: 'quiz',
			randomise: true,  
        }, options );
		
	let quizDomDataArr = [];
	

	function isValid(data) {		
		return typeof data =='object';
	}

	function getQuizData(url){		
			return $.ajax( url )			  
			  .fail(function() {
			    alert( "error" );
			  })
			  .always(function() {
			    
			  });	
	}

	function getRandomSource(arr, n) { 
		var result = new Array(n),
			len = arr.length,
			taken = new Array(len);
		if (n > len)
			throw new RangeError("getRandom: more elements taken than available");
		while (n--) {
			var x = Math.floor(Math.random() * len);
			result[n] = arr[x in taken ? taken[x] : x];
			taken[x] = --len in taken ? taken[len] : len;
		}
		return result;
	}

	function randomiseQuestions(i) {
		questions = quizDomDataArr[i].data[0].questions;
		let qs = questions.length;
		let item, temp;
		while (qs) {
			item = Math.floor(Math.random() * qs--);
			temp = questions[qs];
			questions[qs] = questions[item];
			questions[item] = temp;
		}
		
		quizDomDataArr[i].data[0].questions = questions;		
	}

	function questionTemplate(questionStr, options, i) {
		
		const isLastQuestion = (quizDomDataArr[i].question.count === (quizDomDataArr[i].question.current + 1));
		let quesNo = quizDomDataArr[i].question.current + 1;
		var template = `<div >                
								<p>${quesNo}. ${questionStr}</p>`;

		options ? options.forEach((option, index) => {
			template += `<div class="radio">
					<label>
						<input type="radio" name="quizAnswer" required value="${index + 1}">
						${option}
					</label>
				</div>`;
		}) : template += `<div>Error! No options provided!</div>`;

		template += `<button id="nextQuestion" type="submit" class="btn btn-default">
				${ isLastQuestion ? "Finish Quiz" : "Next" }
				</button>
			</div>`;

		return template;
	}

	function updateScore(i,userAnswer) {
		quizDomDataArr[i].answers.push(userAnswer);
	}
	function getScore(i) { 
		answers = quizDomDataArr[i].answers;
		if (answers && answers.length > -1) {
			return answers.reduce((acc, val) => parseFloat(acc) + parseFloat(val), 0);
		} else {
			return 0;
		}
	}

	function nextQuestion(i) { 
		const questions = quizDomDataArr[i].data[0].questions;
		const currentQ = quizDomDataArr[i].question.current;
		const template = getTemplate(questions, currentQ, i);
		// increment current question:
		quizDomDataArr[i].question.current += 1;
		renderTemplate(template, i);
		quizDomDataArr[i].dom.children(".quizFrm").attr("data-index",i);		
	}
	function start(i) {		
		try {
			if(isNaN(i)) throw "not a number";
			if(typeof quizDomDataArr[i] == 'undefined') throw "quizDomDataArr is not defined.";
			if(typeof quizDomDataArr[i].data == 'undefined') throw "quizDomDataArr[i] data is not defined.";
			if(typeof quizDomDataArr[i].data[0] == 'undefined') throw "quizDomDataArr[i] data[0] not defined.";
			if(typeof quizDomDataArr[i].data[0].questions == 'undefined') throw "quizDomDataArr[i] data[0] questions not defined.";
			if(typeof quizDomDataArr[i].data[0].questions.length == 'undefined') throw "quizDomDataArr[i] data[0] questions length not defined.";
			
			if (isValid(quizDomDataArr[i].data) === false) {
				 renderTemplate('<p>The JSON data provided is not valid! Please check this and retry</p>', i);				
			}
			// should be moved.
	    
			
			quizDomDataArr[i].question.count = quizDomDataArr[i].data[0].questions.length;
			if (settings.randomise === true) {
				 randomiseQuestions(i);
			}

			
			nextQuestion(i);
		}catch(err) {
			console.log(err);
		}
	}

	function end(i) {
		let score = getScore(i);
		let message = resultMessage(score, i);
		let queCount = quizDomDataArr[i].question.count;
		return `<h3>Quiz Complete</h3><h4>${message.title}</h4><p>${message.description}</p>
		  <p>Your score was: ${score} questions: ${queCount}</p>`;
	}

	function resultMessage(score, i) {
		result = quizDomDataArr[i].data[1].results;
		let message = {};
		result.forEach((data) => {
			if (score >= data.minScore) {
				message = data;
			}
		});
		return message;
	}

	

	function renderTemplate(html, i) {				
	 	const form = document.createElement('form');
		form.setAttribute('class', 'quizFrm');
		form.innerHTML = html;		
		$(quizDomDataArr[i].dom).html(form);    
	}
	
	function getTemplate(questions, currentQuestion, i) {
		// End of Quiz?
		if (quizDomDataArr[i].question.count === currentQuestion) {
			return end(i);
		// Next Question
		} else {
			let question = questions[currentQuestion];
			return questionTemplate(question.question, question.options, i);
		}
	}

	let ajaxArr = [];
        // Greenify the collection based on the settings variable.
	let pageSource = getRandomSource(settings.dataSource,this.filter( "div" ).length);

         this.filter( "div" ).each(function(i) {
	    var quizDom = $( this );	    
	    ajaxArr.push(getQuizData(pageSource[i]));
	    ajaxArr[i].done(function( msg ) { 
			try{													
				quizDomDataArr.push({
						question: {
							current: 0,
							count: 0
						},
						answers: [],
						data: msg,
						'dom' : quizDom
					});				
			}catch (err) {
				console.log(err);
			}
			start( i );
					
		});
           
           // link.append( " (" + link.attr( "href" ) + ")" );
        });
 		
		
		$('body').on('submit', 'form.quizFrm', function(event) {			
			// do something			
			event.preventDefault();			
			dataIndex  = $(event.target).data("index");
			
			const answer = $(event.target).find('input[name="quizAnswer"]:checked').val();	
			
			updateScore(dataIndex,answer);
			nextQuestion(dataIndex); 
		});
	
        return this;
 
    };
 
}( jQuery ));
