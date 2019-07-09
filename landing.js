const howToPlayNode = document.getElementById('how-to-play');

function handleStartGame() {
	console.log('Starting Game');
}

function handleHowToPlay() {
	let hidden = howToPlayNode.style.display == 'block' ? false : true;
	howToPlayNode.style = hidden ? 'display: block' : 'display: none';
}
