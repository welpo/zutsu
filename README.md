<p align="center">
    <a href="https://zutsu.osc.garden">
        <img src="https://raw.githubusercontent.com/welpo/zutsu/main/app/logo.webp" width="250" alt="zutsu logo">
    </a>
    <br>
    <a href="#contributing">
        <img src="https://img.shields.io/badge/prs-welcome-0?style=flat-square&labelcolor=202b2d&color=5b7463" alt="prs welcome"></a>
    <a href="https://zutsu.osc.garden">
        <img src="https://img.shields.io/website?url=https%3a%2f%2fzutsu.osc.garden&style=flat-square&label=app&labelcolor=202b2d" alt="app status"></a>
    <a href="#license">
        <img src="https://img.shields.io/github/license/welpo/zutsu?style=flat-square&labelcolor=202b2d&color=5b7463" alt="license"></a>
    <a href="https://github.com/welpo/git-sumi">
        <img src="https://img.shields.io/badge/clean_commits-git--sumi-0?style=flat-square&labelcolor=202b2d&color=5b7463" alt="clean commits"></a>
</p>

<p align="center">
    <a href="https://zutsu.osc.garden">try it now〜</a>
</p>

<h3 align="center">focus on one task at a time</h3>

i built ずつ to practice through time blocks, with the flexibility of pause/resume. the name comes from 一つずつ (hitotsu-zutsu), meaning "one at a time"

## demo

https://github.com/user-attachments/assets/c9575828-ea72-41be-b859-5b788fe7b23e

[try it now〜](https://zutsu.osc.garden)

## features

- clean, distraction-free interface with dark/light mode
- private:
  - no accounts, no tracking
  - works entirely offline
  - all data stored locally
- import/export task lists (json)
- extra utilities (pomodoro®, coin flip, counter, stopwatch…)
- browser and sound notifications on completion
- keyboard shortcuts:
  - <kbd>space</kbd>: pause/resume
  - <kbd>enter</kbd>: add task (when input is focused)

## contributing

please do! i'd appreciate bug reports, improvements (however minor), suggestions…

ずつ uses vanilla javascript, html, and css. to run locally:

1. clone the repository: `git clone https://github.com/welpo/zutsu.git`
2. navigate to the app directory: `cd zutsu/app`
3. start a local server: `python3 -m http.server`
4. visit `http://localhost:8000` in your browser

the important files are:

- `index.html`: basic structure
- `styles.css`: styles
- `app.js`: logic

## need help?

something not working? have an idea? let me know!

- questions or ideas → [start a discussion](https://github.com/welpo/zutsu/discussions)
- found a bug? → [report it here](https://github.com/welpo/zutsu/issues/new?&labels=bug&template=2_bug_report.yml)
- feature request? → [let me know](https://github.com/welpo/zutsu/issues/new?&labels=feature&template=3_feature_request.yml)

## license

ずつ is free software: you can redistribute it and/or modify it under the terms of the [GNU general public license as published by the free software foundation](./COPYING), either version 3 of the license, or (at your option) any later version.
