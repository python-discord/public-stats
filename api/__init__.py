import os

import httpx
from flask import Flask, jsonify, request

app = Flask(__name__, static_folder="../build", static_url_path="/")

GRAPHITE_HOST = (os.environ.get("GRAPHITE_HOST") or "http://graphite:80") + "/render"


TIME_FRAMES = {"day": "-24h", "week": "-1w", "month": "-1mon", "year": "-1y"}


@app.route("/")
def index():
    return app.send_static_file("index.html")


@app.route("/members/total")
def members_total():
    """Return the statistics for a 30 day period on the total members."""
    return jsonify(
        httpx.get(
            GRAPHITE_HOST,
            params={
                "target": "stats.gauges.bot.guild.total_members",
                "from": TIME_FRAMES[request.args.get("frame", "-24h")],
                "format": "json",
                "maxDataPoints": "300",
            },
        ).json()[0]["datapoints"]
    )


@app.route("/members/online")
def online_total():
    """Return the online members for a 30 day period."""
    return jsonify(
        httpx.get(
            GRAPHITE_HOST,
            params={
                "target": "stats.gauges.bot.guild.status.online",
                "from": TIME_FRAMES[request.args.get("frame", "-24h")],
                "format": "json",
                "maxDataPoints": "300",
            },
        ).json()[0]["datapoints"]
    )


@app.route("/messages/rate")
def message_total():
    """Return the statistics for a 30 day period on the total messages."""
    return jsonify(
        httpx.get(
            GRAPHITE_HOST,
            params={
                "target": "stats_counts.bot.messages",
                "from": TIME_FRAMES[request.args.get("frame", "-24h")],
                "format": "json",
                "maxDataPoints": "300",
            },
        ).json()[0]["datapoints"]
    )


@app.route("/messages/offtopic")
def messages_offtopic():
    """Return the statistics for a 30 day period on the total messages in off topic."""
    return jsonify(
        [
            x["datapoints"]
            for x in httpx.get(
                GRAPHITE_HOST,
                params={
                    "target": "keepLastValue(integral(stats_counts.bot.channels.off_topic_*), inf)",
                    "from": TIME_FRAMES[request.args.get("frame", "-24h")],
                    "format": "json",
                    "maxDataPoints": "300",
                },
            ).json()
        ]
    )


@app.route("/evals/perchannel")
def eval_perchannel():
    """Return the statistics for a 30 day period on the eval usage locations."""
    return jsonify(
        [
            x["datapoints"]
            for x in httpx.get(
                GRAPHITE_HOST,
                params={
                    "target": "keepLastValue(integral(stats_counts.bot.snekbox_usages.channels.*), inf)",
                    "from": TIME_FRAMES[request.args.get("frame", "-24h")],
                    "format": "json",
                    "maxDataPoints": "300",
                },
            ).json()
        ]
    )


@app.route("/help/in_use")
def help_in_use():
    """Return the statistics for a 30 day period on the total members."""
    return jsonify(
        httpx.get(
            GRAPHITE_HOST,
            params={
                "target": "stats.gauges.bot.help.total.in_use",
                "from": TIME_FRAMES[request.args.get("frame", "-24h")],
                "format": "json",
                "maxDataPoints": "100",
            },
        ).json()[0]["datapoints"]
    )
