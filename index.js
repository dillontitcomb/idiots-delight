const DEF_STACKS = 4;
const renderedCards = document.getElementsByClassName('card');
const setupDisplay = document.getElementById('setup');
const gameDisplay = document.getElementById('game');
let game;

function updateInterface() {
	for (let i = 0; i < renderedCards.length; i++) {
		renderedCards[i].innerHTML = game.getActiveCards()[i].name;
	}
}

function handleClickCard(e) {
	// get stack from click event
	let stackNumber = e.path[1].className.split(' ')[1].split('-')[1];
	let stack = game.stacks[parseInt(stackNumber) - 1];
	// determine if stack is empty or has cards
	let empty = stack.isEmpty();
	if (empty) {
		// player must select card to add to stack
		console.log('There is no card to click!');
	} else {
		// card is removed if beatable by other active card
		let currentCard = stack.getActiveCard();
		let activeCards = game.getActiveCards();
		// TODO: if more than one card beats the current card, only remove one card from stack, ending loop
		activeCards.forEach(card => {
			if (currentCard.isBeatenBy(card)) {
				stack.removeCard();
				console.log(`Card Removed: ${currentCard.name}`);
				return;
			}
		});
	}
	console.log('card clicked!');
}

function handleClickDeal() {
	game.deal();
	console.log('deal clicked!');
}

function handleStartGame() {
	game = new Game();
	game.begin();

	setupDisplay.style = 'display: none';
	gameDisplay.style = 'display: inherit';
	console.log(game);
}

const cardValues = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
const cardSuits = ['spades', 'clubs', 'hearts', 'diamonds'];
const cardNameLookup = { 11: 'jack', 12: 'queen', 13: 'king', 14: 'ace' };

class Deck {
	constructor() {
		this.cards = this.buildDeck();
		this.discarded = [];
	}
	buildDeck() {
		let cards = [];
		cardSuits.forEach(suit => {
			cardValues.forEach(value => {
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
	}
	begin() {
		this.deck.shuffle();
		this.deal();
		updateInterface();
	}
	buildStacks(numOfStacks) {
		let stacks = [];
		for (let i = 0; i < numOfStacks; i++) {
			stacks.push(new CardStack());
		}
		return stacks;
	}
	deal() {
		for (let i = 0; i < DEF_STACKS; i++) {
			this.stacks[i].cards.push(this.deck.removeCard());
		}
	}
	getActiveCards() {
		let active = [];
		this.stacks.forEach(stack => active.push(stack.getActiveCard()));
		return active;
	}
}

class Card {
	constructor(value, suit) {
		this.value = value;
		this.suit = suit;
		this.name = `${cardNameLookup[value] || value} of ${suit}`;
	}
	isBeatenBy(card) {
		// make exception for card being undefined / null
		if (!card) return false;
		if (this.suit == card.suit && card.value > this.value) {
			return true;
		} else {
			return false;
		}
	}
}

class CardStack {
	constructor() {
		this.cards = [];
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
}
