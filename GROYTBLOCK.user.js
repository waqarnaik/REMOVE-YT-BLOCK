// ==UserScript==
// @name         GROYTBLOCK
// @namespace    https://violentmonkey.github.io/
// @version      1.0
// @match        https://www.youtube.com/*
// @updateURL    https://github.com/waqarnaik/RemoveYTBlock/raw/main/GROYTBLOCK.user.js
// @downloadURL  https://github.com/waqarnaik/RemoveYTBlock/raw/main/GROYTBLOCK.user.js
// @grant        none
// @description  Get rid of YT block 
// ==/UserScript== 


(function() {
    const adblocker = true;
    const removePopup = true;
    const debug = true;

    const domainsToRemove = ['*.youtube-nocookie.com/*'];
    const jsonPathsToRemove = [
        'playerResponse.adPlacements',
        'playerResponse.playerAds',
        'adPlacements',
        'playerAds',
        'playerConfig',
        'auxiliaryUi.messageRenderers.enforcementMessageViewModel'
    ];

    const observerConfig = {
        childList: true,
        subtree: true
    };

    const keyEvent = new KeyboardEvent("keydown", {
        key: "k",
        code: "KeyK",
        keyCode: 75,
        which: 75,
        bubbles: true,
        cancelable: true,
        view: window
    });

    const mouseEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
    });

    let unpausedAfterSkip = 0;

    if (adblocker) addblocker();
    if (removePopup) popupRemover();
    if (removePopup) observer.observe(document.body, observerConfig);

    function popupRemover() {
        removeJsonPaths(domainsToRemove, jsonPathsToRemove);
        setInterval(() => {
            const fullScreenButton = document.querySelector(".ytp-fullscreen-button");
            const modalOverlay = document.querySelector("tp-yt-iron-overlay-backdrop");
            const popup = document.querySelector(".style-scope ytd-enforcement-message-view-model");
            const popupButton = document.getElementById("dismiss-button");

            const video1 = document.querySelector("#movie_player > video.html5-main-video");
            const video2 = document.querySelector("#movie_player > .html5-video-container > video");

            const bodyStyle = document.body.style;
            bodyStyle.setProperty('overflow-y', 'auto', 'important');

            if (modalOverlay) {
                modalOverlay.removeAttribute("opened");
                modalOverlay.remove();
            }

            if (popup) {
                if (debug) console.log("Popup detected, removing...");

                if (popupButton) popupButton.click();
                popup.remove();
                unpausedAfterSkip = 2;

                fullScreenButton.dispatchEvent(mouseEvent);

                setTimeout(() => {
                    fullScreenButton.dispatchEvent(mouseEvent);
                }, 500);

                if (debug) console.log("Popup removed");
            }

            if (!unpausedAfterSkip > 0) return;

            if (video1) {
                if (video1.paused) unPauseVideo();
                else if (unpausedAfterSkip > 0) unpausedAfterSkip--;
            }
            if (video2) {
                if (video2.paused) unPauseVideo();
                else if (unpausedAfterSkip > 0) unpausedAfterSkip--;
            }
        }, 1000);
    }

    function addblocker() {
        setInterval(() => {
            const skipBtn = document.querySelector('.videoAdUiSkipButton,.ytp-ad-skip-button');
            const ad = [...document.querySelectorAll('.ad-showing')][0];
            const sidAd = document.querySelector('ytd-action-companion-ad-renderer');
            const displayAd = document.querySelector('div#root.style-scope.ytd-display-ad-renderer.yt-simple-endpoint');
            const sparklesContainer = document.querySelector('div#sparkles-container.style-scope.ytd-promoted-sparkles-web-renderer');
            const mainContainer = document.querySelector('div#main-container.style-scope.ytd-promoted-video-renderer');
            const feedAd = document.querySelector('ytd-in-feed-ad-layout-renderer');
            const mastheadAd = document.querySelector('.ytd-video-masthead-ad-v3-renderer');
            const sponsor = document.querySelectorAll("div#player-ads.style-scope.ytd-watch-flexy, div#panels.style-scope.ytd-watch-flexy");

            if (ad) {
                const video = document.querySelector('video');
                video.playbackRate = 10;
                video.volume = 0;
                video.currentTime = video.duration;
                skipBtn?.click();
            }

            sidAd?.remove();
            displayAd?.remove();
            sparklesContainer?.remove();
            mainContainer?.remove();
            feedAd?.remove();
            mastheadAd?.remove();
            sponsor?.forEach(element => element.remove());
        }, 50);
    }

    function unPauseVideo() {
        document.dispatchEvent(keyEvent);
        unpausedAfterSkip = 0;
        if (debug) console.log("Unpaused video using 'k' key");
    }

    function removeJsonPaths(domains, jsonPaths) {
        const currentDomain = window.location.hostname;
        if (!domains.includes(currentDomain)) return;

        jsonPaths.forEach(jsonPath => {
            const pathParts = jsonPath.split('.');
            let obj = window;
            for (const part of pathParts) {
                if (obj.hasOwnProperty(part)) {
                    obj = obj[part];
                } else {
                    break;
                }
            }
            obj = undefined;
        });
    }

    const observer = new MutationObserver(() => {
        removeJsonPaths(domainsToRemove, jsonPathsToRemove);
    });
})();


