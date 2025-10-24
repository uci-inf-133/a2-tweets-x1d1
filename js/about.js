function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	console.log('fghgfh')
	if (runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	const tweetsMap = [];
	tweetCount = 0;
	runkeeper_tweets
		.map(tweet => new Tweet(tweet.text, tweet.created_at))
		.forEach(element => {
			tweetCount += 1;
			if (!tweetsMap[element.source]) {
				tweetsMap[element.source] = [];
			}
			tweetsMap[element.source].push(element);
		});

	//This line modifies the DOM, searching for the tag with the numberTweets ID and updating the text.
	//It works correctly, your task is to update the text of the other tags in the HTML file!
	document.getElementById('numberTweets').innerText = tweetCount;
	document.querySelectorAll('.completedEvents').forEach(e => e.innerText = tweetsMap['completed_event'].length);

	document.querySelector('.liveEvents').innerText = tweetsMap['live_event'].length;

	document.querySelector('.achievements').innerText = tweetsMap['achievement'].length;

	document.querySelector('.miscellaneous').innerText = tweetsMap['miscellaneous'].length;



}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});