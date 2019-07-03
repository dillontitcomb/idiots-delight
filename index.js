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

const renderedCards = document.getElementsByClassName('card');
const setupDisplay = document.getElementById('setup');
const gameDisplay = document.getElementById('game');
const testStack = document.getElementById('stack-5');
const testStack1 = document.getElementById('stack-6');
const testStack2 = document.getElementById('stack-7');
const testStacks = [testStack, testStack1, testStack2];
console.log(testStacks);

let game;

function updateInterface() {
	for (let i = 0; i < renderedCards.length; i++) {
		renderedCards[i].innerHTML = game.getActiveCards()[i].name;
	}
}

function handleClickCard(e) {
	let stackNum;
	// Check path for stack number
	e.path.forEach(p => {
		if (p.id && p.id.includes('stack')) {
			stackNum = p.id.split('-')[1];
		}
	});
	console.log(stackNum);
	let stack = game.stacks[parseInt(stackNum) - 1];
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
		this.name = `${CARD_NAME_LOOKUP[value] || value} of ${suit}`;
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
}

function renderCard(card, isActive) {
	let cardClass = isActive ? 'card' : 'card card-stub';
	let cardName = CARD_NAME_LOOKUP[card.value] || card.value;
	let cardSuitIcon = CARD_ICON_LOOKUP[card.suit];
	let cardLgIcon = CARD_ICON_LOOKUP[card.value] || '';
	let cardColor =
		card.suit === 'hearts' || card.suit === 'diamonds' ? 'red' : 'black';
	return `<div onclick="handleClickCard(event)" class="${cardClass}" style="color: ${cardColor};">
		<div class="card-top">${cardName} <i class="${cardSuitIcon}"></i></div>
		<div class="card-mid">
			<span class="${cardLgIcon} card-center" ${
		cardLgIcon ? '' : 'style="font-size: 9rem"'
	}>${cardLgIcon ? '' : cardName}</span>
		</div>
		<div class="card-bot">${cardName} <i class="${cardSuitIcon}"></i></div>
	</div>`;
}

const a = new Card(2, 'clubs');
const b = new Card(5, 'diamonds');
const c = new Card(12, 'hearts');
const stack = new CardStack([a, b, c]);
console.log(stack);
const d = new Card(4, 'spades');
const e = new Card(5, 'clubs');
const f = new Card(13, 'clubs');
const stack2 = new CardStack([d, e, f]);

const g = new Card(4, 'diamonds');
const stack3 = new CardStack([g]);
const stackObjs = [stack, stack2, stack3];

function renderStack(stack) {
	let html = '';
	stack.cards.forEach((card, i) => {
		let lastCard = false;
		if (i == stack.cards.length - 1) lastCard = true;
		html += lastCard ? renderCard(card, true) : renderCard(card, false);
	});
	return html;
}
console.log(testStacks);
testStacks.forEach((stack, i) => {
	stack.innerHTML = renderStack(stackObjs[i]);
});
