function handleClickCard(e) {
	let stackClicked = e.path[1].className.split(' ')[1].split('-')[1];
	console.log(stackClicked);
	console.log('card clicked!');
}

function handleClickDeal() {
	console.log('deal clicked!');
}

class Game {
	constructor() {
		this.deck = this.buildDeck();
	}
	buildDeck() {}
}
