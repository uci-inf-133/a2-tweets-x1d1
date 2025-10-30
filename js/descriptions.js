function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if (runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}
	tweetsArray = runkeeper_tweets.map(tweet => new Tweet(tweet.text, tweet.created_at)).filter((tweet) => tweet.written);

	const searchBar = document.getElementById("textFilter");
	// Clear since browser seems to cache on reload
	searchBar.value = "";

	const tableBody = document.getElementById("tweetTable");
	const checkboxUserWritten = document.getElementById("writtenTextOnly");
	checkboxUserWritten.checked = false;

	searchBar.addEventListener("input", () => {
		updateTable();
	});

	checkboxUserWritten.addEventListener("change", () => {
		updateTable();
	});

	const searchCount = document.getElementById("searchCount");
	const searchText = document.getElementById("searchText");
	function updateTable() {
		const query = searchBar.value.toLowerCase();

		searchText.innerHTML = query;
		if (query == "") {
			searchText.innerHTML = "???";
			searchCount.innerHTML = "???";
			tableBody.innerHTML = "";
			return;
		}

		function getText(tweet) {
			return checkboxUserWritten.checked ? tweet.writtenText : tweet.text;
		}
		const filtered = tweetsArray.filter(t => getText(t).toLowerCase().includes(query));
		row = 0;
		tableBody.innerHTML = filtered
			.map(t => t.getHTMLTableRow(++row))
			.join("");

		searchCount.innerHTML = filtered.length;
	}
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	//addEventHandlerForSearch();
	loadSavedRunkeeperTweets().then(parseTweets);
});