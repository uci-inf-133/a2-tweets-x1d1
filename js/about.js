function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if (runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	const tweetsMap = [];

	tweetCount = 0;
	writtenCompletedEventTweets = 0;
	minDate = maxDate = null;

	tweetsArray = runkeeper_tweets.map(tweet => new Tweet(tweet.text, tweet.created_at));
	
	tweetsArray.forEach(element => {
			tweetCount += 1;
			if (!tweetsMap[element.source]) {
				tweetsMap[element.source] = [];
			}
			tweetsMap[element.source].push(element);

			if (element.source == 'completed_event' && element.written)
				writtenCompletedEventTweets++;

			if (!minDate || element.time < minDate) minDate = element.time;
			if (!maxDate || element.time > maxDate) maxDate = element.time;
		});

	tweetsArray.forEach(t => console.log(t.activityType))

	document.getElementById('firstDate').innerText = minDate.toLocaleDateString("en-US", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric"
	});

	document.getElementById('lastDate').innerText = maxDate.toLocaleDateString("en-US", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric"
	});

	function calculatePercentageFromSource(source) {
		return calculatePercentage(countTweetsFromSource(source), tweetCount);
	}

	function calculatePercentage(a, b) {
		return ((a / b) * 100).toFixed(2) + '%'
	}

	function countTweetsFromSource(source) {
		return tweetsMap[source].length;
	}

	document.getElementById('numberTweets').innerText = tweetCount;
	document.querySelectorAll('.completedEvents').forEach(e => e.innerText = countTweetsFromSource('completed_event'));
	document.querySelector('.completedEventsPct').innerText = calculatePercentageFromSource('completed_event');

	document.querySelector('.liveEvents').innerText = countTweetsFromSource('live_event');
	document.querySelector('.liveEventsPct').innerText = calculatePercentageFromSource('live_event');

	document.querySelector('.achievements').innerText = countTweetsFromSource('achievement');
	document.querySelector('.achievementsPct').innerText = calculatePercentageFromSource('achievement');

	document.querySelector('.miscellaneous').innerText = countTweetsFromSource('miscellaneous');
	document.querySelector('.miscellaneousPct').innerText = calculatePercentageFromSource('miscellaneous');

	document.querySelector('.written').innerText = writtenCompletedEventTweets;
	document.querySelector('.writtenPct').innerText = calculatePercentage(writtenCompletedEventTweets, countTweetsFromSource('completed_event'));
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});