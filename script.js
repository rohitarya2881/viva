let questions = [];
let currentQuestionIndex = 0;
let reviewMode = false;

// Handle file upload (for JSON questions)
document.getElementById('upload-json').addEventListener('change', handleFileUpload);

// Handle review start button click
document.getElementById('start-review').addEventListener('click', startReview);

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) {
        alert("No file selected!");
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            questions = JSON.parse(e.target.result);
            document.getElementById('file-message').textContent = "Questions loaded successfully!";
        } catch (error) {
            alert("Invalid JSON file. Please upload a valid file.");
        }
    };
    reader.readAsText(file);
}

function startReview() {
    if (questions.length === 0) {
        alert("No questions loaded! Please upload a JSON file.");
        return;
    }

    reviewMode = true;
    currentQuestionIndex = 0;
    displayNextQuestion();
}

function displayNextQuestion() {
    if (currentQuestionIndex < questions.length) {
        const currentQuestion = questions[currentQuestionIndex];
        document.getElementById("question").textContent = currentQuestion.question;
        speakAndListen(currentQuestion);
    } else {
        speak("You've completed all the questions. Well done!");
        reviewMode = false;
    }
}

function speakAndListen(currentQuestion) {
    // Speak the question
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(currentQuestion.question);
        utterance.onend = () => {
            // Start listening after the question is spoken
            startRecognition(currentQuestion);
        };
        window.speechSynthesis.speak(utterance);
    } else {
        alert("Speech synthesis not supported in this browser.");
    }
}

function startRecognition(currentQuestion) {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
        alert("Speech recognition not supported in this browser.");
        return;
    }

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.start();

    recognition.onresult = function(event) {
        const userAnswer = event.results[0][0].transcript.toLowerCase();
        checkAnswer(userAnswer, currentQuestion);
    };

    recognition.onerror = function() {
        speak("Sorry, I didn't catch that. Please try again.");
    };
}

function checkAnswer(userAnswer, currentQuestion) {
    const correctAnswer = currentQuestion.answer.toLowerCase();

    if (userAnswer === correctAnswer) {
        speak("You are right!");
    } else {
        speak(`You are wrong. The correct answer is ${currentQuestion.answer}.`);
    }

    // Move to the next question
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        setTimeout(displayNextQuestion, 2000); // Delay to allow user to process feedback
    }
}

function speak(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
    }
}
