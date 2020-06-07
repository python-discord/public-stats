import os
from collections import defaultdict
from datetime import datetime
from functools import wraps

import httpx
from flask import Flask, make_response, Response, request

app = Flask(__name__, static_folder="../build", static_url_path="/")

GRAPHITE_HOST = (os.environ.get("GRAPHITE_HOST") or "http://graphite:80") + "/render"


TIME_FRAMES = {"day": "-24h", "week": "-1w", "month": "-1mon", "year": "-1y"}
SUMMARIZE = {"day": "15minute", "week": "2hour", "month": "12hour", "year": "7day"}

CACHE_THRESHOLD = 300
CACHED = defaultdict(lambda: (datetime.fromtimestamp(0), None))


def cached(func):
    @wraps(func)
    def wrapped(*args, **kwargs):
        frame = request.args.get("frame", "day")

        last_access, resp = CACHED[(func.__name__, frame)]

        if (datetime.utcnow() - last_access).total_seconds() > CACHE_THRESHOLD:
            resp = func(*args, **kwargs)
            CACHED[(func.__name__, frame)] = (
                datetime.utcnow(),
                resp,
            )

            response = make_response(resp)

            response.headers["X-Python-Discord-Cache"] = "MISS"

            return response
        else:
            response = make_response(resp)
            response.headers["X-Python-Discord-Cache"] = "HIT"
            return response

    return wrapped


def single_graphite(
    target: str, summarize: bool = True, sum_times: dict = SUMMARIZE, func: str = "avg"
) -> Response:
    if summarize:
        time = sum_times[request.args.get("frame", "day")]
        target = f'summarize({target}, "{time}", "{func}")'

    return {
        "data": httpx.get(
            GRAPHITE_HOST,
            params={
                "target": target,
                "from": TIME_FRAMES[request.args.get("frame", "day")],
                "until": "-30minute",
                "format": "json",
            },
        ).json()[0]["datapoints"]
    }


def multi_graphite(
    target: str, summarize: bool = True, sum_times: dict = SUMMARIZE, func: str = "avg"
) -> Response:
    if summarize:
        time = sum_times[request.args.get("frame", "day")]
        target = f'summarize({target}, "{time}", "{func}")'

    return {
        "data": [
            x["datapoints"]
            for x in httpx.get(
                GRAPHITE_HOST,
                params={
                    "target": target,
                    "from": TIME_FRAMES[request.args.get("frame", "day")],
                    "until": "-30minute",
                    "format": "json",
                },
            ).json()
        ]
    }


@app.after_request
def add_header(response):
    response.cache_control.max_age = 300
    response.cache_control.public = True
    return response


@app.route("/")
def index():
    return app.send_static_file("index.html")


@app.route("/members/total")
@cached
def members_total():
    """Total member count statistic."""
    return single_graphite("stats.gauges.bot.guild.total_members")


@app.route("/members/online")
@cached
def online_total():
    """Average online members over time."""
    return single_graphite("stats.gauges.bot.guild.status.online")


@app.route("/messages/rate")
@cached
def message_total():
    """Rate of messages over a time frame."""
    return single_graphite("stats_counts.bot.messages", func="sum")


@app.route("/messages/offtopic")
@cached
def messages_offtopic():
    """Cumulative off topic messages over a time frame."""
    custom_sum_times = {
        "day": "1hour",
        "week": "2hour",
        "month": "12hour",
        "year": "7day",
    }
    return multi_graphite(
        "integral(stats_counts.bot.channels.off_topic_*)", sum_times=custom_sum_times
    )


@app.route("/evals/perchannel")
@cached
def eval_perchannel():
    """Eval usage per channel over time."""
    custom_sum_times = {
        "day": "1hour",
        "week": "2hour",
        "month": "12hour",
        "year": "7day",
    }
    return multi_graphite(
        "integral(stats_counts.bot.snekbox_usages.channels.*)",
        sum_times=custom_sum_times,
    )


@app.route("/help/in_use")
@cached
def help_in_use():
    """Average in use help channels over a time frame."""
    # We want less data points for in use help
    custom_sum_times = {
        "day": "1hour",
        "week": "12hour",
        "month": "1day",
        "year": "7day",
    }

    return single_graphite(
        "stats.gauges.bot.help.total.in_use", sum_times=custom_sum_times
    )
