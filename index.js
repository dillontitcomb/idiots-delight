//

// CONSTANTS

//

const DEF_STACKS = 4;
const CARD_VALUES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
const CARD_SUITS = ['spades', 'clubs', 'hearts', 'diamonds'];
const CARD_NAME_LOOKUP = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };

const CARD_ICON_LOOKUP = {
	hearts: 'fas fa-heart',
	diamonds: 'fas fa-diamond',
	spades: 'fas fa-spade',
	clubs: 'fas fa-club',

	11: 'fas fa-chess-knight',
	12: 'fas fa-chess-queen',
	13: 'fas fa-crown'
};
const CARD_COLOR_LOOKUP = {
	heart: 'red',
	diamond: 'red',
	spade: 'black',
	club: 'black'
};

//

// DOM NODES

//

const setupDisplay = document.getElementById('setup');
const gameDisplay = document.getElementById('game');
const resultsDisplay = document.getElementById('results');
const resultsGif = document.getElementById('results-party');
const stacksDisplay = document.getElementsByClassName('stacks')[0];
const stackNode1 = document.getElementById('stack-1');
const stackNode2 = document.getElementById('stack-2');
const stackNode3 = document.getElementById('stack-3');
const stackNode4 = document.getElementById('stack-4');
const stackNodes = [stackNode1, stackNode2, stackNode3, stackNode4];
stackNodes.forEach(node => node.addEventListener('click', handleClickStack));
let game;

//

// CLASSES

//

class Deck {
	constructor() {
		this.cards = this.buildDeck();
		this.discarded = [];
	}
	buildDeck() {
		let cards = [];
		CARD_SUITS.forEach(suit => {
			CARD_VALUES.forEach(value => {
				let newCard = new Card(value, suit);
				cards.push(newCard);
			});
		});
		return cards;
	}
	shuffle() {
		let currentIndex = this.cards.length,
			temporaryValue,
			randomIndex;
		while (currentIndex !== 0) {
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;
			temporaryValue = this.cards[currentIndex];
			this.cards[currentIndex] = this.cards[randomIndex];
			this.cards[randomIndex] = temporaryValue;
		}
	}
	removeCard() {
		return this.cards.pop();
	}
	empty() {
		return this.cards.length < 1;
	}
}
class Game {
	constructor() {
		this.deck = new Deck();
		this.stacks = this.buildStacks(DEF_STACKS);
		this.isTransferringCard = false;
		this.stackReceivingCard = null;
		this.resetting = false;
	}
	begin() {
		stacksDisplay.style = 'visibility: visible';
		resultsDisplay.innerHTML = '';
		resultsGif.innerHTML = '';
		this.deck.shuffle();
		this.deal();
	}
	buildStacks(numOfStacks) {
		let stacks = [];
		for (let i = 0; i < numOfStacks; i++) {
			stacks.push(new CardStack());
		}
		return stacks;
	}
	renderStacks() {
		this.stacks.forEach((stack, i) => {
			stackNodes[i].innerHTML = renderStack(stack);
		});
	}
	deal() {
		if (this.deck.cards.length == 0) {
			this.checkGameOver();
		} else {
			for (let i = 0; i < DEF_STACKS; i++) {
				this.stacks[i].cards.push(this.deck.removeCard());
			}
			this.renderStacks();
		}
	}
	getActiveCards() {
		let active = [];
		this.stacks.forEach(stack => active.push(stack.getActiveCard()));
		return active;
	}
	getCardsInPlay() {
		return 52 - (this.deck.cards.length + this.deck.discarded.length);
	}
	isOutOfMoves() {
		if (this.stacks.filter(stack => stack.isRemovable()).length === 0)
			return true;
		return false;
	}
	checkGameOver() {
		if (game.deck.cards.length === 0 && game.isOutOfMoves()) {
			return true;
		}
		return false;
	}

	end() {
		stacksDisplay.style = 'visibility: hidden';
		let gameOverMessage;
		let score = game.getCardsInPlay();
		if (score > 22) {
			gameOverMessage = `Woah buddy, you got absolutely wrecked. You scored ${score}. Check yourself first next time`;
			resultsGif.innerHTML = `<img src="https://media.giphy.com/media/ADr35Z4TvATIc/source.gif" alt="Most interesting man facepalm" />`;
		} else if (score > 17) {
			gameOverMessage = `${score}... Not the best, not the worst either. But very close to the worst. Go again?`;
			resultsGif.innerHTML = `<img src="https://media.giphy.com/media/iA8jqAN2GXSTe/giphy.gif" alt="Lost character amazed" />`;
		} else if (score > 13) {
			gameOverMessage = `${score}, huh. Highly mediocre. Try again. Or don't.`;
			resultsGif.innerHTML = `<img src="https://media.giphy.com/media/3w9EFfTjaLb7q/giphy.gif" alt="Charlie from IASIP" />`;
		} else if (score > 8) {
			gameOverMessage = `Nice. Nothing to write home about, but good. You scored ${score}.`;
			resultsGif.innerHTML = `<img src="https://media.giphy.com/media/11ISwbgCxEzMyY/giphy.gif" alt="Thumbs up kid" />`;
		} else if (score > 4) {
			gameOverMessage = `You got robbed. If only things had gone a bit differently. You scored ${score}.`;
			resultsGif.innerHTML = `<img src="https://media.giphy.com/media/xVT8eyqSZobZUxCknb/source.mp4" alt="Bball player" />`;
		} else {
			gameOverMessage = `HOLY MOTHER OF GOD YOU'VE DONE IT. YOU'RE A LEGEND. IF I'D MADE A LEADERBOARD FOR THIS GAME YOU'D BE AT THE TOP! YOU SCORED A FLAWLESS ${score}!`;
			resultsGif.innerHTML = `<img src="https://media.giphy.com/media/AVBo5eqFXd3SU/giphy.gif" alt="Lost character amazed" />`;
		}
		resultsDisplay.innerHTML = `<h1 class='result-message'>${gameOverMessage}</h1>`;
		this.resetting = true;
	}
}

class Card {
	constructor(value, suit) {
		this.value = value;
		this.suit = suit;
		this.name = `${CARD_NAME_LOOKUP[value] || value} of ${suit}`;
	}
	isBeatenBy(card) {
		if (!card) {
			console.log('Card is falsy');
			return false;
		}
		console.log(`Checking if ${card.name} beats ${this.name}`);
		if (this.suit == card.suit && card.value > this.value) {
			return true;
		} else {
			return false;
		}
	}
}

class CardStack {
	constructor(cards) {
		this.cards = cards || [];
	}
	getActiveCard() {
		return this.cards[this.cards.length - 1];
	}
	addCard(card) {
		this.cards.push(card);
	}
	removeCard() {
		let removed = this.cards.pop();
		game.deck.discarded.push(removed);
		return removed;
	}
	isEmpty() {
		return this.cards.length === 0;
	}
	transferCard(stack) {
		stack.addCard(this.cards.pop());
	}
	isRemovable() {
		if (this.isEmpty()) return false;
		let options = game.getActiveCards();
		return (
			options.filter(card => {
				return this.getActiveCard().isBeatenBy(card);
			}).length > 0
		);
	}
}

//

// DOM RENDERING

//

function renderCard(card, isActive) {
	let cardClass = isActive ? 'card' : 'card card-stub';
	let cardName = CARD_NAME_LOOKUP[card.value] || card.value;
	let cardSuitIcon = CARD_ICON_LOOKUP[card.suit];
	let cardLgIcon = CARD_ICON_LOOKUP[card.value] || '';
	let cardColor =
		card.suit === 'hearts' || card.suit === 'diamonds' ? 'red' : 'black';
	return `<div class="${cardClass}" style="color: ${cardColor};">
		<div class="card-top">${cardName} <i class="${cardSuitIcon}"></i></div>
		<div class="card-mid">
			<span class="${cardLgIcon} card-center" ${
		cardLgIcon ? '' : 'style="font-size: 9rem"'
	}>${cardLgIcon ? '' : cardName}</span>
		</div>
		<div class="card-bot">${cardName} <i class="${cardSuitIcon}"></i></div>
	</div>`;
}

function renderStack(stack) {
	let html = '';
	stack.cards.forEach((card, i) => {
		let lastCard = false;
		if (i == stack.cards.length - 1) lastCard = true;
		html += lastCard ? renderCard(card, true) : renderCard(card, false);
	});
	return html;
}

//

// CLICK EVENTS

//

// TODO: Refactor into multiple functions
function handleClickStack(e) {
	if (game.checkGameOver()) game.end();
	let stackNum;
	e.path.forEach(p => {
		if (p.id && p.id.includes('stack')) {
			stackNum = p.id.split('-')[1];
		}
	});
	let stack = game.stacks[parseInt(stackNum) - 1];
	let empty = stack.isEmpty();
	if (empty) {
		game.isTransferringCard = true;
		game.stackReceivingCard = stack;
		// player must select card to add to stack
		console.log('Selecting card to move to empty stack...');
		console.log('Stack receiving card:');
		console.log(game.stackReceivingCard);
	} else {
		if (game.isTransferringCard) {
			stack.transferCard(game.stackReceivingCard);
			game.renderStacks();
			game.isTransferringCard = false;
		} else {
			// card is removed if beatable by other active card
			let currentCard = stack.getActiveCard();
			let activeCards = game.getActiveCards();
			// TODO: if more than one card beats the current card, only remove one card from stack, ending loop
			for (let i = 0; i < activeCards.length; i++) {
				if (currentCard.isBeatenBy(activeCards[i])) {
					stack.removeCard();
					game.renderStacks();
					console.log(`Card Removed: ${currentCard.name}`);
					return;
				}
			}
		}
	}
	console.log('card clicked!');
}

function handleClickDeal() {
	console.log(game);
	if (game && !game.resetting) {
		game.deal();
		if (game.checkGameOver()) game.end();
		console.log('New cards dealt!');
	} else {
		game = new Game();
		game.begin();
		console.log('Begin game!');
	}
}

function handleStartGame() {
	game = new Game();
	game.begin();
	console.log('Begin game!');
}
