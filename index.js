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
}
class Game {
	constructor() {
		this.deck = new Deck();
		this.stacks = this.buildStacks(DEF_STACKS);
		this.isTransferringCard = false;
		this.stackReceivingCard = null;
	}
	begin() {
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
			this.gameOver();
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
	gameOver() {}
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
	if (game) {
		game.deal();
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
