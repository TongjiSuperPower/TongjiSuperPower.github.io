#!/usr/bin/env python3
"""Refresh the repository covers used by this page (Python 3.9+ and curl)."""

import argparse
import base64
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from html import escape, unescape
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import subprocess
import unicodedata
from urllib.parse import urlsplit
from zoneinfo import ZoneInfo

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
PAGE = HERE / "openSource.html"
CACHE = HERE / "repo-stats.json"
ARTICLE = re.compile(r'<article\b[^>]*class="os-card"[^>]*>.*?</article>', re.S)
IMAGE = re.compile(r'                <div class="card-image(?: [^"]*)?">.*?</div>\n', re.S)


class RepositoryLinks(HTMLParser):
    def __init__(self):
        super().__init__()
        self.repos = []

    def handle_starttag(self, tag, attributes):
        attributes = dict(attributes)
        if tag != "a":
            return
        url = urlsplit(attributes.get("href", ""))
        parts = url.path.strip("/").removesuffix(".git").split("/")
        if url.hostname == "github.com" and len(parts) == 2:
            repo = "/".join(parts)
            if re.fullmatch(r"[\w.-]+/[\w.-]+", repo) and repo not in self.repos:
                self.repos.append(repo)


def discover(html):
    projects = {}
    for article in ARTICLE.findall(html):
        parser = RepositoryLinks()
        parser.feed(article)
        if not parser.repos:
            continue
        if len(parser.repos) != 1:
            raise ValueError("Each software card must identify one GitHub repository.")
        repo = parser.repos[0]
        title = re.search(r"<h3>(.*?)</h3>", article, re.S)
        if not title:
            raise ValueError(f"Missing title: {repo}")
        projects[repo] = {"title": unescape(title[1]), "article": article}
    return projects


def fetch_stats(repo):
    # Never read browser credentials or require a token for public repository data.
    result = subprocess.run(
        ["curl", "--fail", "--silent", "--show-error", "--location",
         "--max-time", "25", "--retry", "1",
         "--header", "Accept: application/vnd.github+json",
         f"https://api.github.com/repos/{repo}"],
        check=True, capture_output=True, text=True,
    )
    data = json.loads(result.stdout)
    for field in ("stargazers_count", "forks_count"):
        if type(data.get(field)) is not int or data[field] < 0:
            raise ValueError(f"Missing or invalid GitHub {field}: {repo}")
    return {
        "repository": repo,
        "source": f"https://api.github.com/repos/{repo}",
        "stars": data["stargazers_count"],
        "forks": data["forks_count"],
        "description": data.get("description") or "",
        "language": data.get("language") or "",
        "license": (data.get("license") or {}).get("spdx_id") or "",
        "checked_at": datetime.now(ZoneInfo("Asia/Shanghai")).isoformat(timespec="seconds"),
    }


def units(text):
    return sum(1 if unicodedata.east_asian_width(c) in "WF" else 0.58 for c in text)


def shorten(text, limit=43):
    if units(text) <= limit:
        return text
    while units(text + "…") > limit:
        text = text[:-1]
    return text + "…"


def filename(repo):
    return re.sub(r"[^a-z0-9]+", "-", repo.lower()).strip("-") + "-cover.svg"


def render(stats, title):
    owner, name = stats["repository"].split("/")
    logo = base64.b64encode((ROOT / "images/brand/favicon-180.png").read_bytes()).decode()
    date = stats["checked_at"][:10]
    description = shorten(stats["description"] or title, 29)
    size = min(55, 820 / max(units(name), 1))
    metadata = " · ".join(v for v in (stats["language"], stats["license"] if stats["license"] != "NOASSERTION" else "") if v)
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="1260" height="656" viewBox="0 0 1260 656" role="img" aria-labelledby="title desc">
  <title id="title">{escape(stats['repository'])}</title>
  <desc id="desc">{escape(title)}；Stars {stats['stars']}；Forks {stats['forks']}；统计日期 {date}</desc>
  <defs>
    <linearGradient id="background" x2="1" y2="1"><stop stop-color="#687ee9"/><stop offset="1" stop-color="#7953a9"/></linearGradient>
    <linearGradient id="glass" x2="1" y2="1"><stop stop-color="#fff" stop-opacity=".30"/><stop offset="1" stop-color="#fff" stop-opacity=".20"/></linearGradient>
    <clipPath id="avatar"><circle cx="178" cy="197" r="56"/></clipPath>
  </defs>
  <rect width="1260" height="656" fill="url(#background)"/>
  <rect x="70" y="65" width="1120" height="526" rx="34" fill="url(#glass)" stroke="#e2e8f0" stroke-opacity=".60" stroke-width="3"/>
  <image x="122" y="141" width="112" height="112" href="data:image/png;base64,{logo}" clip-path="url(#avatar)"/>
  <circle cx="178" cy="197" r="57" fill="none" stroke="#e2e8f0" stroke-opacity=".65" stroke-width="3"/>
  <g fill="#fff" font-family="'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei UI', 'Microsoft YaHei', sans-serif">
    <text x="270" y="156" font-size="29" font-weight="500" fill="#eef2ff">{escape(owner)} /</text>
    <text x="270" y="220" font-size="{size:.1f}" font-weight="800">{escape(name)}</text>
    <text x="270" y="274" font-size="28" font-weight="500">{escape(description)}</text>
    <g fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">
      <g transform="translate(300 356) scale(1.7)"><polygon points="12 2 15.1 8.3 22 9.3 17 14.2 18.2 21 12 17.8 5.8 21 7 14.2 2 9.3 8.9 8.3 12 2"/></g>
      <g transform="translate(682 356) scale(1.7)"><circle cx="6" cy="3" r="2"/><circle cx="18" cy="3" r="2"/><circle cx="12" cy="21" r="2"/><path d="M6 5v3a6 6 0 0 0 6 6m6-9v3a6 6 0 0 1-6 6v5"/></g>
    </g>
    <text x="362" y="394" font-size="52" font-weight="700">{stats['stars']:,}</text>
    <text x="744" y="394" font-size="52" font-weight="700">{stats['forks']:,}</text>
    <text x="362" y="433" font-size="25" fill="#eef2ff">Stars</text>
    <text x="744" y="433" font-size="25" fill="#eef2ff">Forks</text>
    <path d="M120 472h1020" stroke="#fff" stroke-opacity=".22"/>
    <text x="120" y="530" font-size="27" font-weight="500">{escape(metadata)}</text>
    <text x="1140" y="530" text-anchor="end" font-size="24" fill="#eef2ff">GitHub · {date}</text>
  </g>
</svg>
'''


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--offline", action="store_true", help="Re-render saved counts without fetching or changing their dates.")
    args = parser.parse_args()
    html = PAGE.read_text()
    projects = discover(html)
    if not projects:
        raise ValueError("No repository cards found; no files changed.")
    if args.offline:
        stats = json.loads(CACHE.read_text())
    else:
        with ThreadPoolExecutor(max_workers=4) as pool:
            stats = dict(zip(projects, pool.map(fetch_stats, projects)))
    outputs = {}
    # Resolve every repository before writing, so network errors leave the old cards intact.
    for repo, project in projects.items():
        data = stats[repo]
        if data["repository"] != repo:
            raise ValueError(f"Mismatched cached repository: {repo}")
        image_path = "/images/open-source/" + filename(repo)
        outputs[ROOT / image_path.lstrip("/")] = render(data, project["title"])
        alt = f"{repo}：{data['stars']} stars，{data['forks']} forks（{data['checked_at'][:10]}）"
        image = ('                <div class="card-image repo-cover">\n'
                 f'                    <img src="{image_path}" alt="{escape(alt, quote=True)}" loading="lazy" decoding="async" width="1260" height="656">\n'
                 '                </div>\n')
        old = project["article"]
        if IMAGE.search(old):
            new = IMAGE.sub(lambda _: image, old, count=1)
        else:
            new = old.replace('                <div class="card-content">', image + '                <div class="card-content">', 1)
        html = html.replace(old, new, 1)
    for path, svg in outputs.items():
        path.write_text(svg)
    PAGE.write_text(html)
    if not args.offline:
        CACHE.write_text(json.dumps(stats, ensure_ascii=False, indent=2) + "\n")
    print(f"Updated {len(outputs)} repository covers and their page references.")


if __name__ == "__main__":
    main()
