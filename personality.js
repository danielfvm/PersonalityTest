// Welcome to the secret sauce of this very serious website
(async () => {
	// get all elements
	const divActions = document.getElementById("actions").children;
	const divAnswersContainer = document.getElementById("answers");
	const divAnswers = document.getElementsByName("answer");
	const divQuestion = document.getElementById("question");
	const divBackground = document.getElementById("image-background");
	const divForeground = document.getElementById("image-foreground");
	const divTitle = document.getElementById("title");
	const divMessage = document.getElementById("message");
	
	// fetch questions
	const res = await fetch("./questions.json");
	const { questions, results } = await res.json();

	// variables
	const selected = Array.from(new Array(questions.length)).map(() => null);
	const mouse = [0.001, 0.001];
	const rotation = [0.001, 0.001];
	let currentPage = 0;

	const displayFinalPage = () => {
		const [ result ] = results;
		divBackground.src = result.image;
		divForeground.src = result.image;

		divQuestion.innerText = result.title;
		divActions[1].innerText = `${questions.length} of ${questions.length}`;
		divActions[0].disabled = false;
		divActions[2].disabled = true;
		divAnswersContainer.style.display = "none";
		divMessage.style.display = "block";
		divMessage.innerHTML = result.text;

		new Audio("./yay.mp3").play();
	};

	const displayQuestion = (questionId) => {
		divActions[0].style.display = questionId == 0 ? "none" : "block";
		divActions[1].style.display = questionId == questions.length ? "none" : "block";
		divActions[2].style.display = questionId == questions.length ? "none" : "block";

		if (questionId < 0 || questionId >= questions.length)
			return displayFinalPage();

		const page = questions[questionId];
		const len = Math.min(page.answers.length, divAnswers.length);
		const correctId = page.correct;

		for (let i = 0; i < len; ++i) {
			const select = selected[questionId] == i;
			const wrong = correctId != null && correctId != i;

			divAnswers[i].innerText = page.answers[i];
			divAnswers[i].classList.toggle("correct", (select && !wrong) || (selected[questionId] != null && correctId == i));
			divAnswers[i].classList.toggle("wrong", select && wrong);
			divAnswers[i].onclick = () => {
				selected[questionId] = i;
				let k = 0;
				for (const otherButton of divAnswers) {
					otherButton.classList.toggle("correct", (selected[questionId] != null && correctId == k));
					otherButton.classList.toggle("wrong", false);
					k++;
				}

				const wrong = correctId != null && correctId != i;

				divAnswers[i].classList.toggle("correct", !wrong);
				divAnswers[i].classList.toggle("wrong", wrong);
				divActions[2].disabled = false;
			};
		}

		divQuestion.innerText = page.question;
		divBackground.src = `https://source.unsplash.com/random/?${page.tags}`;
		divForeground.src = `https://source.unsplash.com/random/?${page.tags}`;
		divActions[2].innerText = questionId == questions.length-1 ? "Answer" : "Next";
		divActions[2].disabled = selected[questionId] == null;
		divActions[0].disabled = questionId == 0;
		divActions[1].innerText = `${questionId+1} of ${questions.length}`;
		divAnswersContainer.style.display = "block";
		divMessage.style.display = "none";
	};

	divActions[0].addEventListener("click", () => {
		displayQuestion(--currentPage);
	});
	divActions[2].addEventListener("click", () => {
		displayQuestion(++currentPage);
	});	

	window.addEventListener("mousemove", (ev) => {
		mouse[0] = (ev.clientX-window.innerWidth/2.0) / window.innerWidth;
		mouse[1] = (window.innerHeight/2.0-ev.clientY) / window.innerHeight;
	});

	(function update() {
		let dis = 50.0;
		rotation[0] += (mouse[0]*dis-rotation[0]) * 0.04;
		rotation[1] += (mouse[1]*dis-rotation[1]) * 0.04;

		divBackground.style.transform = `
			scale(${1.3})
			rotateY(${rotation[0]}deg)
			rotateX(${rotation[1]}deg)
		`;

		divTitle.style.transform = `scale(${Math.sin(Date.now()*0.004)*0.02+1})`;

		requestAnimationFrame(update);
	})();

	displayQuestion(0);
})();
