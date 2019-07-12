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

// CLASSES

//

class Interface {
	constructor() {
		this.resultsDisplay = document.getElementById('results');
		this.resultsGif = document.getElementById('results-party');
		this.stacksDisplay = document.getElementsByClassName('stacks')[0];
		this.stackGroup = document.getElementsByClassName('stack');
		this.stackNodes = [
			this.stackGroup[0],
			this.stackGroup[1],
			this.stackGroup[2],
			this.stackGroup[3]
		];
		this.stackNodes.forEach(node =>
			node.addEventListener('click', handleStackClick)
		);
		this.stacksDisplay.style = 'visibility: visible';
		this.resultsDisplay.innerHTML = '';
		this.resultsGif.innerHTML = '';
	}
	renderCard(card, isActive) {
		let cardClass = isActive ? 'card' : 'card card-stub';
		let cardName = CARD_NAME_LOOKUP[card.value] || card.value;
		let cardSuitIcon = CARD_ICON_LOOKUP[card.suit];
		let cardLgIcon = CARD_ICON_LOOKUP[card.value] || '';
		let cardColor =
			card.suit === 'hearts' || card.suit === 'diamonds' ? 'red' : 'black';
		return `
		<div onclick="handleCardClick(event)" class="${cardClass}" style="color: ${cardColor};">
			<div class="card-top">${cardName} <i class="${cardSuitIcon}"></i></div>
			<div class="card-mid">
				<span class="${cardLgIcon} card-center" ${
			cardLgIcon ? '' : 'style="font-size: 9rem"'
		}>${cardLgIcon ? '' : cardName}</span>
			</div>
			<div class="card-bot">${cardName} <i class="${cardSuitIcon}"></i></div>
		</div>`;
	}
	renderStack(stack) {
		let html = '';
		stack.cards.forEach((card, i) => {
			let lastCard = false;
			if (i == stack.cards.length - 1) lastCard = true;
			html += lastCard
				? this.renderCard(card, true)
				: this.renderCard(card, false);
		});
		return html;
	}
	renderStacks(stacks) {
		stacks.forEach((stack, i) => {
			this.stackNodes[i].innerHTML = this.renderStack(stack);
		});
	}
}

class CardGroup {
	constructor() {
		this.cards = [];
	}
	get empty() {
		return this.cards.length ? false : true;
	}
	get activeCard() {
		return this.empty ? null : this.cards[this.cards.length - 1];
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
	transferCardsTo(recipient, numOfCards) {
		for (let i = 0; i < numOfCards; i++) {
			recipient.cards.push(this.cards.pop());
		}
	}
	receiveCardsFrom(provider, numOfCards) {
		for (let i = 0; i < numOfCards; i++) {
			this.cards.push(provider.cards.pop());
		}
	}
}

class Deck extends CardGroup {
	constructor() {
		super();
		this.cards = this.buildDeck();
		this.shuffle();
		this.discardPile = new DiscardPile();
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
}
class DiscardPile extends CardGroup {
	constructor() {
		super();
		this.cards = [];
	}
}
class CardStack extends CardGroup {
	constructor() {
		super();
		this.cards = [];
	}
	get canReceiveCard() {
		return this.empty ? true : false;
	}
	get canDestroyCard() {
		let activeCards = game.activeCards;
		return (
			activeCards.filter(card => {
				return (
					card.suit === this.activeCard.suit &&
					card.value > this.activeCard.value
				);
			}).length > 1
		);
	}
}
class Card {
	constructor(value, suit) {
		this.value = value;
		this.suit = suit;
	}
	beats(otherCard) {
		if (!otherCard) return false;
		console.log(
			`Checking if ${this.value} of ${this.suit} beats ${otherCard.value} of ${
				this.suit
			}`
		);
		return this.suit === otherCard.suit && this.value > otherCard.value;
	}
}

class Game {
	constructor() {
		this.deck = new Deck();
		this.stacks = this.buildStacks(DEF_STACKS);
		this.interface = new Interface();
		this.isTransferringCard = false;
		this.stackReceivingCard = null;
		this.resetting = false;
	}
	begin() {
		this.deal();
	}
	buildStacks(numOfStacks) {
		let stacks = [];
		for (let i = 0; i < numOfStacks; i++) {
			stacks.push(new CardStack());
		}
		return stacks;
	}

	deal() {
		if (this.deck.cards.length == 0) {
			this.checkGameOver();
		} else {
			for (let i = 0; i < DEF_STACKS; i++) {
				this.deck.transferCardsTo(this.stacks[i], 1);
			}
			this.interface.renderStacks(this.stacks);
		}
	}
	get activeCards() {
		return this.stacks.map(stack => stack.activeCard);
	}
	getCardsInPlay() {
		return 52 - (this.deck.cards.length + this.deck.discardPile.cards.length);
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
		this.interface.stacksDisplay.style = 'visibility: hidden';
		let gameOverMessage;
		let score = game.getCardsInPlay();
		if (score > 22) {
			gameOverMessage = `Woah buddy, you got absolutely wrecked. You scored ${score}. Check yourself first next time`;
			resultsGif.innerHTML = `<img src="https://media.giphy.com/media/ADr35Z4TvATIc/source.gif" alt="Most interesting man facepalm" />`;
		} else if (score > 17) {
			gameOverMessage = `${score}... Not the best, not the worst either. But very close to the worst. Go again?`;
			this.interface.resultsGif.innerHTML = `<img src="https://media.giphy.com/media/iA8jqAN2GXSTe/giphy.gif" alt="Lost character amazed" />`;
		} else if (score > 13) {
			gameOverMessage = `${score}, huh. Highly mediocre. Try again. Or don't.`;
			this.interface.resultsGif.innerHTML = `<img src="https://media.giphy.com/media/3w9EFfTjaLb7q/giphy.gif" alt="Charlie from IASIP" />`;
		} else if (score > 8) {
			gameOverMessage = `Nice. Nothing to write home about, but good. You scored ${score}.`;
			this.interface.resultsGif.innerHTML = `<img src="https://media.giphy.com/media/11ISwbgCxEzMyY/giphy.gif" alt="Thumbs up kid" />`;
		} else if (score > 4) {
			gameOverMessage = `You got robbed. If only things had gone a bit differently. You scored ${score}.`;
			this.interface.resultsGif.innerHTML = `<img src="https://media.giphy.com/media/xVT8eyqSZobZUxCknb/giphy-downsized.gif" alt="Bball player" />`;
		} else {
			gameOverMessage = `HOLY MOTHER OF GOD YOU'VE DONE IT. YOU'RE A LEGEND. IF I'D MADE A LEADERBOARD FOR THIS GAME YOU'D BE AT THE TOP! YOU SCORED A FLAWLESS ${score}!`;
			this.interface.resultsGif.innerHTML = `<img src="https://media.giphy.com/media/AVBo5eqFXd3SU/giphy.gif" alt="Lost character amazed" />`;
		}
		this.interface.resultsDisplay.innerHTML = `<h1 class='result-message'>${gameOverMessage}</h1>`;
		this.resetting = true;
	}
}

//

// CLICK EVENTS

//

// TODO: Refactor into multiple functions
function handleStackClick(e) {
	if (game.checkGameOver()) game.end();
	let stackNum;
	e.path.forEach(p => {
		if (p.id && p.id.includes('stack')) {
			stackNum = p.id.split('-')[1];
		}
	});
	let stack = game.stacks[parseInt(stackNum) - 1];
	if (stack.empty) {
		game.isTransferringCard = true;
		game.stackReceivingCard = stack;
		// player must select card to add to stack
		console.log('Selecting card to move to empty stack...');
		console.log('Stack receiving card:');
		console.log(game.stackReceivingCard);
	} else {
		if (game.isTransferringCard) {
			stack.transferCardsTo(game.stackReceivingCard, 1);
			game.interface.renderStacks(game.stacks);
			game.isTransferringCard = false;
		} else {
			// card is removed if beatable by other active card
			let currentCard = stack.activeCard;
			let activeCards = game.activeCards;
			// TODO: if more than one card beats the current card, only remove one card from stack, ending loop
			for (let i = 0; i < activeCards.length; i++) {
				if (activeCards[i].beats(currentCard)) {
					stack.transferCardsTo(game.deck.discardPile, 1);
					game.interface.renderStacks(game.stacks);
					console.log(
						`Card Removed: ${currentCard.value} of ${currentCard.suit}`
					);
					return;
				}
			}
		}
	}
	console.log('card clicked!');
}

function handleCardClick(e) {
	console.log(e);
}

function handleClickDeal() {
	if (game.resetting) {
		game = new Game();
		game.deal();
		console.log('Starting new game!');
	} else {
		game.deal();
		console.log('Dealing!');
	}
}

//

// INITIALIZE

//

let game = new Game();
