function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}
	tweetsArray = runkeeper_tweets.map(tweet => new Tweet(tweet.text, tweet.created_at)).filter((tweet) => tweet.written);

	const searchBar = document.getElementById("textFilter");
	const tableBody = document.getElementById("tweetTable");
	searchBar.addEventListener('input', () => {
		// clear the table
		tableBody.innerHTML = "";
		const query = searchBar.value.toLowerCase();
		if (query == "")
			return;

		tweetsArray.filter(t => t.writtenText.toLowerCase().includes(query))
		.forEach(t => tableBody.innerHTML += t.getHTMLTableRow(1))
	});
	//tweetsArray.forEach(t => tableBody.innerHTML += t.getHTMLTableRow(1))
	//TODO: Filter to just the written tweets
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	//addEventHandlerForSearch();
	loadSavedRunkeeperTweets().then(parseTweets);
});