class Tweet {
    private text: string;
    time: Date;

    constructor(tweet_text: string, tweet_time: string) {
        this.text = tweet_text;
        this.time = new Date(tweet_time); //, "ddd MMM D HH:mm:ss Z YYYY"
    }

    //returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source(): string {
        const liveEventRegex = /^Watch my (.+?) right now with @Runkeeper Live/;
        if (liveEventRegex.test(this.text)) return "live_event";
        if (
            this.text.startsWith(
                "Achieved a new personal record with #Runkeeper"
            )
        )
            return "achievement";
        if (
            this.text.startsWith("Just completed a") ||
            this.text.startsWith("Just posted a")
        )
            return "completed_event";
        return "miscellaneous";
    }

    //returns a boolean, whether the text includes any content written by the person tweeting.
    get written(): boolean {
        //TODO: identify whether the tweet is written
        return (
            this.text.includes(" - ") &&
            !this.text.includes("TomTom MySports Watch")
        );
    }

    get writtenText(): string {
        if (this.written) {
            const match = this.text.match(/-\s*(.*?)\s+https?:\/\/\S+\s+#\w+$/);
            if (match) return match[1];
        }
        return "";
    }

    get activityType(): string {
        if (this.source != "completed_event") {
            return "unknown";
        }

        // Handle cases where it is a "workout"
        const sanitized = this.text.substring(0, this.text.indexOf("-"));
        const match = sanitized.match(/(\w+)\s+workout/i);
        if (match) return match[1];

        let words = sanitized.split(" ");
        for (var i = 3; i < words.length; i++) {
            if (words[i].length < 3) continue;
            if (!/^[A-Za-z]+$/.test(words[i])) continue;
            return words[i];
        }

        //TODO: parse the activity type from the text of the tweet
        return "unknown";
    }

    get distance(): number {
        if (this.source != "completed_event") {
            return 0;
        }
        const sanitized = this.text.substring(0, this.text.indexOf("-"));
        const match = sanitized.match(/(\d+(?:\.\d+)?)\s*(km|mi)/i);
        if (match) {
            const value = parseFloat(match[1]);
            const unit = match[2].toLowerCase();
            return unit == "km" ? value / 1.609 : value;
        }
        return 0;
    }

    getHTMLTableRow(rowNumber: number): string {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const hyperlinked = this.text.replace(
            urlRegex,
            (url) => `<a href="${url}">${url}</a>`
        );
        return `
        <tr id="row-${rowNumber}">
            <td>${rowNumber}</td>
            <td>${this.activityType}</td>
            <td>${hyperlinked}</td>
        </tr>`;
    }
}
