class audioController {
    constructor() {
        this.flipSound = new Audio('assets/audio/84322__splashdust__flipcard.wav');
        this.matchSound = new Audio('assets/audio/362445__tuudurt__positive-response.wav');
        this.victorySound = new Audio('assets/audio/456966__funwithsound__success-fanfare-trumpets.mp3');
        this.gameOverSound = new Audio('assets/audio/159408__noirenex__life-lost-game-over.wav');
    }
    flip() {
        this.flipSound.play();
    }
    match() {
        this.matchSound.play();
    }
    victory() {
        this.victorySound.play();
    }
    gameOver() {
        this.gameOverSound.play();
    }
}

class mixOrMatch {
    constructor(totalTime, cards) {
        this.cardsArray = cards;
        this.totalTime = totalTime;
        this.timeRemaining = totalTime;
        this.timer = document.getElementById('timer');
        this.ticker = document.getElementById('current-score');
        this.highScore = document.getElementById('highest-score');
        this.audioController = new audioController();
    }

    startGame() {
        this.cardToCheck = null;
        this.currentScore = 100;
        this.timeRemaining = this.totalTime;
        this.matchedCards = [];
        this.hideCards();
        this.busy = true;
        setTimeout(() => {
            this.shuffleCards(this.cardsArray);
            this.countDown = this.startCountDown();
            this.busy = false;
        }, 500);
        this.timer.innerText = this.timeRemaining;
        this.ticker.innerText = this.currentScore;
    }

    hideCards() {
        this.cardsArray.forEach(card => {
            card.classList.remove('visible');
            card.classList.remove('matched');
        });
    }

    flipCard(card) {
        // If allowed to flip (no rule against flip returns true), then flip
        if (this.canFlipCard(card)) {
            this.audioController.flip();
            // Time-out 0.3 sec to match visibility and sound-effect
            setTimeout(() => {
                this.currentScore -= 5;
                this.ticker.innerText = this.currentScore;
                // Add 'visible'-class to show card-content
                card.classList.add('visible');
            }, 300);

            if (this.cardToCheck) {
                // If there already is a 'cardToCheck', then check for match   
                this.checkForCardMatch(card);
            } else {
                // If not, then this card will be the 'cardToCheck'
                this.cardToCheck = card;
            }
        }
    }

    checkForCardMatch(card) {
        if (card.getAttribute('data-type') === this.cardToCheck.getAttribute('data-type')) {
            this.cardMatch(card, this.cardToCheck);
        } else {
            this.cardMisMatch(card, this.cardToCheck);
        }
        this.cardToCheck = null;
    }

    cardMatch(card1, card2) {
        this.matchedCards.push(card1);
        this.matchedCards.push(card2);
        console.log("MatchedCards:", this.matchedCards.length, "of", (this.cardsArray.length - 3));
        card1.classList.add('matched');
        card2.classList.add('matched');
        this.audioController.match();
        this.currentScore += 20;
        if (this.matchedCards.length === (this.cardsArray.length - 3)) { // -3 because of 3 extra/moved game-card-divs to use on big screens
            setTimeout(() => {
                this.victory();
            }, 1200);
        }
    }

    cardMisMatch(card1, card2) {
        this.busy = true;
        setTimeout(() => {
            card1.classList.remove('visible');
            card2.classList.remove('visible');
            this.busy = false;
        }, 1000);
    }

    startCountDown() {
        return setInterval(() => {
            // Count down by 1 (--) every sec (1000)
            this.timeRemaining--;
            // Update timer
            this.timer.innerText = this.timeRemaining;
            if (this.timeRemaining === 0)
                this.gameOver();
        }, 1000);
    }

    // Add time-out here, so that quick click doesn't close and start new game prematurely?
    gameOver() {
        clearInterval(this.countDown);
        this.audioController.gameOver();
        document.getElementById('game-over-text').classList.add('visible');
        this.busy = true;
        setTimeout(() => {
            this.busy = false;
        }, 2000);
    }

    victory() {
        clearInterval(this.countDown);
        this.audioController.victory();
        document.getElementById('victory-text').classList.add('visible');
        this.updateHighestScore();
    }

    updateHighestScore() {
        if (this.currentScore > this.highScore.innerText) {
            console.log("New high score!");
            this.highScore.innerText = this.currentScore;
        }
    }

    shuffleCards(cardsArray) {
        // Fisher-Yates shuffle algorithm https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
        for (let i = cardsArray.length - 1; i > 0; i--) {
            let randIndex = Math.floor(Math.random() * (i + 1));
            // The following regards changing order of css-grid, copied from Halloween-game. Needs some ajustments?
            // The randomIndex should be applied to the index of the cards in the cardsArray.
            cardsArray[randIndex].style.order = i;
            cardsArray[i].style.order = randIndex;
        }
    }

    canFlipCard(card) {
        // If all instances that makes the card unflippable are false, then...
        return !this.busy && !this.matchedCards.includes(card) && card !== this.cardToCheck && !card.classList.contains('visible');
    }
}

$(document).ready(function() {
    $("#color-shaker").click(function() {
        // Credit: Random-color-function from AndreFelipeCL, found at "https://stackoverflow.com/questions/20553036/random-color-in-jquery"
        // Modified to only create lighter tones for improved readability (originally (Math.random() * 256))
        $(".game-card").each(function(index) {
            var colorR = Math.floor((Math.random() * 156) + 100);
            var colorG = Math.floor((Math.random() * 156) + 100);
            var colorB = Math.floor((Math.random() * 156) + 100);
            $(this).css("background-color", "rgb(" + colorR + "," + colorG + "," + colorB + ")");
        });
        $("body").each(function() {
            var colorR = Math.floor((Math.random() * 156) + 100);
            var colorG = Math.floor((Math.random() * 156) + 100);
            var colorB = Math.floor((Math.random() * 156) + 100);
            $(this).css("background-color", "rgb(" + colorR + "," + colorG + "," + colorB + ")");
        });

    });


    // Credit: PortEXE, How To Code A Card Game In Plain JavaScript - Spooky Halloween Edition, 
    //YouTube (https://www.youtube.com/watch?v=3uuQ3g92oPQ&t=2044s)

    let overlays = Array.from(document.getElementsByClassName('overlay-text'));
    // Make array of game-cards, just to number them, and use cards.length as how many we have...
    let cards = Array.from(document.getElementsByClassName('game-card')); //("card" in youtube-tutorial)
    let game = new mixOrMatch(60, cards);


    overlays.forEach(overlay => {
        overlay.addEventListener('click', () => {
            overlay.classList.remove('visible');
            game.startGame();
        });
    });
    cards.forEach(card => {
        card.addEventListener('click', () => {
            game.flipCard(card);
        });
    });

    // Credit: Modal Login Form from https://www.w3schools.com/howto/howto_css_login_form.asp
    // Get the modal
    var modal = document.getElementById('sign-in-modal');

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };

});