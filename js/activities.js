function parseTweets(runkeeper_tweets) {
    //Do not proceed if no tweets loaded
    if (runkeeper_tweets === undefined) {
        window.alert("No tweets returned");
        return;
    }

    tweet_array = runkeeper_tweets
        .map(function (tweet) {
            return new Tweet(tweet.text, tweet.created_at);
        })
        .filter((tweet) => tweet.activityType !== "unknown");

    const activitiesMap = new Map();
    tweet_array.forEach((t) => {
        if (t.activityType == "unknown") return;
        if (!activitiesMap.has(t.activityType))
            activitiesMap.set(t.activityType, []);

        activitiesMap.get(t.activityType).push(t);
    });

    document.getElementById("numberActivities").innerText = activitiesMap.size;

    const topActivities = [...activitiesMap.entries()]
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 3);
    const topActivityNames = topActivities.map(([key]) => key);

    document.getElementById("firstMost").innerText = topActivityNames[0];
    document.getElementById("secondMost").innerText = topActivityNames[1];
    document.getElementById("thirdMost").innerText = topActivityNames[2];

    const topActivitiesAvgs = {};
    topActivities.forEach((e) => {
        topActivitiesAvgs[e[0]] = 0;
        e[1].forEach((t) => {
            topActivitiesAvgs[e[0]] += t.distance;
        });
    });

    topActivities.forEach((e) => {
        console.log(activitiesMap.get(e[0]).length);
        topActivitiesAvgs[e[0]] /= activitiesMap.get(e[0]).length;
    });

    const minKey = Object.keys(topActivitiesAvgs).reduce((a, b) =>
        topActivitiesAvgs[a] < topActivitiesAvgs[b] ? a : b
    );
    const maxKey = Object.keys(topActivitiesAvgs).reduce((a, b) =>
        topActivitiesAvgs[a] > topActivitiesAvgs[b] ? a : b
    );

    document.getElementById("longestActivityType").innerText = maxKey;
    document.getElementById("shortestActivityType").innerText = minKey;
    document.getElementById("weekdayOrWeekendLonger").innerText = "Saturday";

    activity_vis_spec = {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        description:
            "A graph of the number of Tweets containing each type of activity.",
        data: {
            values: tweet_array,
        },
        mark: "bar",
        encoding: {
            x: {
                field: "activityType",
                type: "nominal",
                axis: { title: "Activity" },
            },
            y: {
                aggregate: "count",
                field: "activityType",
                type: "quantitative",
                axis: { title: "Number of Tweets" },
            },
            color: {
                field: "activityType",
                type: "nominal",
            },
        },
    };
    vegaEmbed("#activityVis", activity_vis_spec, { actions: false });

    //TODO: create the visualizations which group the three most-tweeted activities by the day of the week.
    //Use those visualizations to answer the questions about which activities tended to be longest and when.

    const topActivitiesGraph = topActivities
        .map(([key, value]) => value)
        .flat()
        .map((tweet) => {
            const dayIndex = tweet.time.getDay();
            const dayOfWeek = [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
            ][dayIndex];
            return {
                day_of_week: dayOfWeek,
                activityType: tweet.activityType,
                distance: tweet.distance,
            };
        });

    // Step 4: Create Vega-Lite chart
    /*const topActivitiesByDistanceSpec = {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        description:
            "Distances by day of the week for the top 3 most tweeted activities.",
        data: { values: topActivitiesGraph },
        mark: "point",
        encoding: {
            x: {
                field: "day_of_week",
                type: "ordinal",
                sort: [
                    "Sunday",
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                ],
                axis: { title: "Day of the Week" },
            },
            y: {
                field: "distance",
                type: "quantitative",
                axis: { title: "Distance (mi)" },
            },
            color: {
                field: "activityType",
                type: "nominal",
                legend: { title: "Activity" },
            },
            tooltip: [
                { field: "activityType", type: "nominal" },
                { field: "day_of_week", type: "ordinal" },
                { field: "distance", type: "quantitative" },
            ],
        },
    };*/

    const topActivitiesByDistanceSpec = {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        description:
            "Toggle between raw distances and mean aggregated distances for the top 3 most tweeted activities.",
        data: { values: topActivitiesGraph },
        params: [
            {
                name: "aggMode",
                value: "none",
                bind: {
                    input: "select",
                    options: ["none", "mean"],
                    labels: ["None", "Mean"],
                    name: "Aggregation mode: ",
                },
            },
        ],

        layer: [
            {
                transform: [{ filter: "aggMode == 'none'" }],
                mark: { type: "point" },
                encoding: {
                    x: {
                        field: "day_of_week",
                        type: "ordinal",
                        sort: [
                            "Sunday",
                            "Monday",
                            "Tuesday",
                            "Wednesday",
                            "Thursday",
                            "Friday",
                            "Saturday",
                        ],
                        axis: { title: "Day of the Week" },
                    },
                    y: {
                        field: "distance",
                        type: "quantitative",
                        axis: { title: "Distance (mi)" },
                    },
                    color: {
                        field: "activityType",
                        type: "nominal",
                        legend: { title: "Activity" },
                    },
                    tooltip: [
                        { field: "activityType", type: "nominal" },
                        { field: "day_of_week", type: "ordinal" },
                        {
                            field: "distance",
                            type: "quantitative",
                            title: "Distance (mi)",
                        },
                    ],
                },
            },
            {
                transform: [
                    { filter: "aggMode == 'mean'" },
                    {
                        aggregate: [
                            {
                                op: "mean",
                                field: "distance",
                                as: "mean_distance",
                            },
                        ],
                        groupby: ["day_of_week", "activityType"],
                    },
                ],
                mark: { type: "point" },
                encoding: {
                    x: {
                        field: "day_of_week",
                        type: "ordinal",
                        sort: [
                            "Sunday",
                            "Monday",
                            "Tuesday",
                            "Wednesday",
                            "Thursday",
                            "Friday",
                            "Saturday",
                        ],
                        axis: { title: "Day of the Week" },
                    },
                    y: {
                        field: "mean_distance",
                        type: "quantitative",
                        axis: { title: "Average Distance (mi)" },
                    },
                    color: {
                        field: "activityType",
                        type: "nominal",
                        legend: { title: "Activity" },
                    },
                    tooltip: [
                        { field: "activityType", type: "nominal" },
                        { field: "day_of_week", type: "ordinal" },
                        {
                            field: "mean_distance",
                            type: "quantitative",
                            title: "Average Distance (mi)",
                        },
                    ],
                },
            },
        ],
    };
    vegaEmbed("#distanceVis", topActivitiesByDistanceSpec, { actions: false });

    /*const avgDistanceSpec = {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        description:
            "Average distance per day of the week for the top 3 activities.",
        data: { values: topActivitiesGraph },
        mark: "point",
        encoding: {
            x: {
                field: "day_of_week",
                type: "ordinal",
                sort: [
                    "Sunday",
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                ],
                axis: { title: "Day of the Week" },
            },
            y: {
                field: "distance",
                type: "quantitative",
                aggregate: "mean",
                axis: { title: "Average Distance (mi)" },
            },
            color: {
                field: "activityType",
                type: "nominal",
                legend: { title: "Activity" },
            },
            tooltip: [
                { field: "activityType", type: "nominal" },
                { field: "day_of_week", type: "ordinal" },
                {
                    field: "distance",
                    type: "quantitative",
                    aggregate: "mean",
                    title: "Average Distance",
                },
            ],
        },
    };

    vegaEmbed("#distanceVisAggregated", avgDistanceSpec, { actions: false });*/
}

//Wait for the DOM to load
document.addEventListener("DOMContentLoaded", function (event) {
    loadSavedRunkeeperTweets().then(parseTweets);
});
