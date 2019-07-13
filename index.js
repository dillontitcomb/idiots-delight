//

// CONSTANTS

//

const CONFIG = {
	STACK_NUMBER: 4,
	CARD_VALUES: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
	CARD_SUITS: ['spades', 'clubs', 'hearts', 'diamonds'],
	CARD_NAME_LOOKUP: { 11: 'J', 12: 'Q', 13: 'K', 14: 'A' },
	CARD_ICON_LOOKUP: {
		hearts: 'fas fa-heart',
		diamonds: 'fas fa-diamond',
		spades: 'fas fa-spade',
		clubs: 'fas fa-club',
		11: 'fas fa-chess-knight',
		12: 'fas fa-chess-queen',
		13: 'fas fa-crown'
	}
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
		let cardName = CONFIG.CARD_NAME_LOOKUP[card.value] || card.value;
		let cardSuitIcon = CONFIG.CARD_ICON_LOOKUP[card.suit];
		let cardLgIcon = CONFIG.CARD_ICON_LOOKUP[card.value] || '';
		let cardColor =
			card.suit === 'hearts' || card.suit === 'diamonds' ? 'red' : 'black';
		return `
		<div class="${cardClass}" style="color: ${cardColor};">
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
	renderGameOver() {
		this.stacksDisplay.style = 'visibility: hidden';
		let gameOverMessage;
		let score = game.cardsInPlay;
		if (score > 22) {
			gameOverMessage = `Woah buddy, you got absolutely wrecked. You scored ${score}. Check yourself first next time`;
			resultsGif.innerHTML = `<img src="https://media.giphy.com/media/ADr35Z4TvATIc/source.gif" alt="Most interesting man facepalm" />`;
		} else if (score > 17) {
			gameOverMessage = `${score}... Not the best, not the worst either. But very close to the worst. Go again?`;
			this.resultsGif.innerHTML = `<img src="https://media.giphy.com/media/iA8jqAN2GXSTe/giphy.gif" alt="Lost character amazed" />`;
		} else if (score > 13) {
			gameOverMessage = `${score}, huh. Highly mediocre. Try again. Or don't.`;
			this.resultsGif.innerHTML = `<img src="https://media.giphy.com/media/3w9EFfTjaLb7q/giphy.gif" alt="Charlie from IASIP" />`;
		} else if (score > 8) {
			gameOverMessage = `Nice. Nothing to write home about, but good. You scored ${score}.`;
			this.resultsGif.innerHTML = `<img src="https://media.giphy.com/media/11ISwbgCxEzMyY/giphy.gif" alt="Thumbs up kid" />`;
		} else if (score > 4) {
			gameOverMessage = `You got robbed. If only things had gone a bit differently. You scored ${score}.`;
			this.resultsGif.innerHTML = `<img src="https://media.giphy.com/media/xVT8eyqSZobZUxCknb/giphy-downsized.gif" alt="Bball player" />`;
		} else {
			gameOverMessage = `HOLY MOTHER OF GOD YOU'VE DONE IT. YOU'RE A LEGEND. IF I'D MADE A LEADERBOARD FOR THIS GAME YOU'D BE AT THE TOP! YOU SCORED A FLAWLESS ${score}!`;
			this.resultsGif.innerHTML = `<img src="https://media.giphy.com/media/AVBo5eqFXd3SU/giphy.gif" alt="Lost character amazed" />`;
		}
		this.resultsDisplay.innerHTML = `<h1 class='result-message'>${gameOverMessage}</h1>`;
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
		return this.empty ? '' : this.cards[this.cards.length - 1];
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
		this.discardPile = new CardGroup();
	}
	buildDeck() {
		let cards = [];
		CONFIG.CARD_SUITS.forEach(suit => {
			CONFIG.CARD_VALUES.forEach(value => {
				let newCard = new Card(value, suit);
				cards.push(newCard);
			});
		});
		return cards;
	}
}

class CardStack extends CardGroup {
	constructor() {
		super();
		this.cards = [];
	}
	get canReceiveCard() {
		return this.empty;
	}
	get hasMultipleCards() {
		return this.cards.length > 1;
	}
	canDestroyCard(activeCards) {
		console.log(activeCards);
		return (
			activeCards.filter(card => {
				console.log(card);
				return card ? card.beats(this.activeCard) : false;
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
		// console.log(
		// 	`Checking if ${this.value} of ${this.suit} beats ${otherCard.value} of ${
		// 		this.suit
		// 	}`
		// );
		return this.suit === otherCard.suit && this.value > otherCard.value;
	}
}

class Game {
	constructor() {
		this.deck = new Deck();
		this.stacks = this.buildStacks(CONFIG.STACK_NUMBER);
		this.interface = new Interface();
		this.isTransferringCard = false;
		this.stackReceivingCard = null;
		this.resetting = false;
	}
	get activeCards() {
		return this.stacks.map(stack => stack.activeCard).filter(card => card);
	}
	get cardsInPlay() {
		return 52 - (this.deck.cards.length + this.deck.discardPile.cards.length);
	}
	get hasLayeredStacks() {
		return (
			this.stacks.filter(stack => {
				return stack.hasMultipleCards;
			}).length > 0
		);
	}
	get hasEmptyStack() {
		return this.activeCards.length !== CONFIG.STACK_NUMBER;
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
			this.isGameOver;
		} else {
			for (let i = 0; i < CONFIG.STACK_NUMBER; i++) {
				this.deck.transferCardsTo(this.stacks[i], 1);
			}
			this.interface.renderStacks(this.stacks);
		}
	}
	get isAnyCardRemovable() {
		let suits = this.activeCards.map(card => card.suit);
		// if unique set of suits is less than suits, there must be a duplicate (e.g ['diamonds', 'clubs'] from ['diamonds', 'clubs', 'clubs'])
		return [...new Set(suits)].length < suits.length;
	}
	get playable() {
		return (
			this.isAnyCardRemovable || (this.hasEmptyStack && this.hasLayeredStacks)
		);
	}
	get isGameOver() {
		if (game.deck.cards.length === 0 && !game.playable) {
			return true;
		}
		return false;
	}
	end() {
		this.interface.renderGameOver();
		this.resetting = true;
	}
}

//

// CLICK EVENTS

//

// TODO: Refactor into multiple functions
function handleStackClick(e) {
	if (game.isGameOver) game.end();
	let stackNum;
	e.path.forEach(p => {
		if (p.id && p.id.includes('stack')) {
			stackNum = p.id.split('-')[1];
		}
	});
	// found specific stack that was clicked
	let stack = game.stacks[parseInt(stackNum) - 1];

	if (stack.empty) {
		// game.prepareToTransfer()
		game.isTransferringCard = true;
		game.stackReceivingCard = stack;
	} else {
		if (game.isTransferringCard) {
			// Transfer has been initiated
			// game.transferToEmptyStack()
			stack.transferCardsTo(game.stackReceivingCard, 1);
			game.interface.renderStacks(game.stacks);
			game.isTransferringCard = false;
		} else {
			// No transfer, so do other behavior
			// card is removed if beatable by other active card
			// stack.beatable ? removeCard() : //do nothing
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
