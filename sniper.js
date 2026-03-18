// ═══════════════════════════════════════════════════════════════
// Orbit Shield v3 — DOM Assassin (sniper.js)
//
// Three-pronged attack, all running on every page:
//
// 1. YOUTUBE 16x SPEED-KILL
//    MutationObserver watches #movie_player for .ad-showing.
//    Instant kill: playbackRate=16, seek to end, dispatch 'ended',
//    auto-click all skip buttons. Ad plays for ~0.3s total.
//
// 2. UNIVERSAL ANNOYANCE NUKE
//    Destroys cookie consent overlays (OneTrust, Cookiebot,
//    TrustArc, Quantcast, Didomi, GDPR banners, etc.) on
//    every website. Forces scroll unlock. Auto-clicks "Accept".
//
// 3. COSMETIC CLEANUP
//    Hides common leftover ad containers, empty ad slots,
//    companion banners, and sponsored content placeholders.
//
// Runs at document_start on all frames.
// ═══════════════════════════════════════════════════════════════

(function() {
    'use strict';

    if (window.__orbitShieldSniper) return;
    window.__orbitShieldSniper = true;

    // ═══════════════════════════════════════════════════════════════
    // SECTION 1: COSMETIC CSS — instant hide before DOM paints
    // ═══════════════════════════════════════════════════════════════

    var _isYT = location.hostname.indexOf('youtube') !== -1;

    // ── PART A: YouTube-specific ad elements (safe on all sites) ──
    var style = document.createElement('style');
    style.id = 'orbit-shield-sniper';
    style.textContent = [

        // YouTube feed/page ad elements (custom elements — safe to hide)
        'ytd-ad-slot-renderer',
        'ytd-in-feed-ad-layout-renderer',
        'ytd-promoted-sparkles-web-renderer',
        'ytd-promoted-video-renderer',
        'ytd-display-ad-renderer',
        'ytd-statement-banner-renderer',
        'ytd-banner-promo-renderer',
        'ytd-video-masthead-ad-v3-renderer',
        'ytd-primetime-promo-renderer',
        'ytm-promoted-video-renderer',
        'ytm-companion-ad-renderer',
        'ytm-ad-slot-renderer',
        'ytm-promoted-sparkles-web-renderer',
        'ytm-native-ad-renderer',
        '#masthead-ad',
        '#player-ads',
        '[layout*="IN_FEED_AD"]',
        '.sponsored-app-container',

        // YouTube companion banners
        'ytd-companion-slot-renderer',
        '#companion',
        '.ytd-companion-slot-renderer',
        'ytd-action-companion-ad-renderer',
        '.companion-ad-container',
        '[target-id="companion"]',
        '#below ytd-ad-slot-renderer',

        // YouTube player ad overlays — ONLY during ad playback (.ad-showing)
        // These MUST be scoped; hiding them permanently kills native controls
        '.ad-showing .ytp-ad-overlay-container',
        '.ad-showing .ytp-ad-overlay-slot',
        '.ad-showing .ytp-ad-player-overlay',
        '.ad-showing .ytp-ad-player-overlay-layout',
        '.ad-showing .ytp-ad-action-interstitial',
        '.ad-showing .ytp-ad-text',
        '.ad-showing .ytp-ad-badge',
        '.ad-showing .ytp-ad-preview-text',
        '.ad-badge-view-model',
        '.ad-button-view-model',

        // ── Cookie consent overlays (safe everywhere) ──
        '#onetrust-consent-sdk',
        '#onetrust-banner-sdk',
        '#onetrust-pc-sdk',
        '.onetrust-pc-dark-filter',
        '#CybotCookiebotDialog',
        '#CybotCookiebotDialogBodyUnderlay',
        '#CybotCookiebotDialogOverlay',
        '.fc-consent-root',
        '#fc-consent-root',
        '#truste-consent-track',
        '#trustarc-banner-overlay',
        '.qc-cmp2-container',
        '#didomi-host',
        '#didomi-popup',
        '.didomi-popup-backdrop',
        '.osano-cm-window',
        '.osano-cm-dialog',
        '#cookie-law-info-bar',
        '#cookieyes-container',
        '#cmplz-cookiebanner-container',
        '.termsfeed-com---nb',
        '#iubenda-cs-banner',
        '#BorlabsCookieBox',
        '#usercentrics-root',
        '#cookie-notice',
        '#moove_gdpr_cookie_modal',
        '.klaro',
        '[id^="sp_message_container"]',

        // Generic consent patterns (safe everywhere)
        '#cookie-banner', '#cookieBanner', '#cookie_banner',
        '#cookie-popup', '#cookiePopup', '#cookie_popup',
        '#cookie-modal', '#cookieModal', '#cookie_modal',
        '#cookie-consent', '#cookieConsent', '#cookie_consent',
        '#gdpr-banner', '#gdpr-popup', '#gdpr-consent',
        '#privacy-banner', '#consent-banner', '#consent-popup',
        '[class*="cookie-banner"]', '[class*="cookie-consent"]',
        '[class*="cookie-notice"]', '[class*="cookie-popup"]',
        '[class*="consent-banner"]', '[class*="consent-popup"]',
        '[class*="gdpr-banner"]', '[class*="privacy-banner"]',

        // Newsletter/subscribe popups
        '[class*="newsletter-popup"]', '[class*="subscribe-popup"]',
        '[class*="signup-popup"]', '[class*="email-popup"]',
        '[class*="app-banner"]', '[class*="smart-banner"]'

    ].join(',\n') + '{ display: none !important; visibility: hidden !important; ' +
        'height: 0 !important; overflow: hidden !important; }';

    (document.documentElement || document).appendChild(style);

    // ── PART B: Generic ad wildcards — SKIP on YouTube ──
    // YouTube's own DOM elements match these wildcards (class names
    // containing "ad-container", "ad-slot" etc.), which cascades to
    // hide native player controls (seek, settings, fullscreen).
    // YouTube ads are already handled by Part A + the speed-kill JS.
    if (!_isYT) {
        var genericStyle = document.createElement('style');
        genericStyle.id = 'orbit-shield-generic-ads';
        genericStyle.textContent = [
            '.ad-container', '.ad-slot', '.ad-wrapper', '.ad-banner',
            '.ad-unit', '.ad-block', '.ad-frame',
            '[class*="ad-container"]', '[class*="ad-slot"]',
            '[class*="ad-banner"]', '[class*="ad-wrapper"]',
            '[id*="ad-container"]', '[id*="ad-slot"]', '[id*="ad-banner"]',
            '.adthrive-ad', '.mediavine-ad'
        ].join(',\n') + '{ display: none !important; visibility: hidden !important; ' +
            'height: 0 !important; overflow: hidden !important; }';
        (document.documentElement || document).appendChild(genericStyle);
    }

    // ── Google Ad Selectors — only on non-search-engine sites ──
    // Sponsored shopping results on Google/Bing use these same containers,
    // so we skip search engine domains to keep whitelisted ads visible.
    var SEARCH_ENGINES = ['google.', 'bing.com', 'duckduckgo.com',
                          'yahoo.com', 'ecosia.org', 'search.'];
    var isSearchEngine = false;
    var hostname = location.hostname.toLowerCase();
    for (var s = 0; s < SEARCH_ENGINES.length; s++) {
        if (hostname.indexOf(SEARCH_ENGINES[s]) !== -1) {
            isSearchEngine = true;
            break;
        }
    }

    if (!isSearchEngine) {
        var googleAdStyle = document.createElement('style');
        googleAdStyle.id = 'orbit-shield-google-ads';
        googleAdStyle.textContent =
            'ins.adsbygoogle, [id^="google_ads"], [id^="div-gpt-ad"], ' +
            'div[data-google-query-id] ' +
            '{ display: none !important; visibility: hidden !important; ' +
            'height: 0 !important; overflow: hidden !important; }';
        (document.documentElement || document).appendChild(googleAdStyle);
    }


    // ═══════════════════════════════════════════════════════════════
    // SECTION 2: YOUTUBE 16x SPEED-KILL
    // ═══════════════════════════════════════════════════════════════

    if (_isYT) {
        console.log('[OrbitShield] YouTube detected — speed-kill armed');

        // ── Background play spoof ──
        try { Object.defineProperty(document, 'hidden', {
            get: function() { return false; }, configurable: true
        }); } catch(e) {}
        try { Object.defineProperty(document, 'visibilityState', {
            get: function() { return 'visible'; }, configurable: true
        }); } catch(e) {}
        document.addEventListener('visibilitychange', function(e) {
            e.stopImmediatePropagation();
        }, true);

        // ── Skip button selectors ──
        var SKIP_SEL =
            '.ytp-ad-skip-button, .ytp-ad-skip-button-modern, ' +
            '.ytp-skip-ad-button, button.ytp-ad-skip-button, ' +
            'button.ytp-ad-skip-button-modern, .ytm-skip-ad-button, ' +
            'button[id^="skip-button"], .ytp-ad-overlay-close-button, ' +
            '.ad-button-view-model button';

        var COMPANION_SEL =
            'ytd-companion-slot-renderer, #companion, ' +
            'ytd-action-companion-ad-renderer, ' +
            '.companion-ad-container, [target-id="companion"], ' +
            '#below ytd-ad-slot-renderer';

        var _adActive = false;
        var _killInterval = null;
        var _nukeTimer = null;

        function clickSkipButtons() {
            try {
                document.querySelectorAll(SKIP_SEL).forEach(function(btn) {
                    btn.click();
                });
            } catch(e) {}
        }

        function hideCompanionBanners() {
            try {
                document.querySelectorAll(COMPANION_SEL).forEach(function(el) {
                    el.style.display = 'none';
                });
            } catch(e) {}
        }

        function speedKillVideo() {
            var v = document.querySelector('video');
            if (!v) return;

            v.muted = true;
            v.volume = 0;
            try { v.playbackRate = 16.0; } catch(e) {}

            var dur = v.duration;
            if (dur && isFinite(dur) && dur > 0) {
                v.currentTime = dur;
            } else {
                v.currentTime = 9999;
            }

            try { v.dispatchEvent(new Event('ended', { bubbles: true })); } catch(e) {}
            try { v.play(); } catch(e) {}
        }

        function onAdDetected() {
            if (_adActive) return;
            _adActive = true;
            console.log('[OrbitShield] 🎯 AD DETECTED — 16x speed-kill engaging');

            speedKillVideo();
            clickSkipButtons();
            hideCompanionBanners();

            // Retry every 100ms while ad persists
            _killInterval = setInterval(function() {
                if (!_adActive) {
                    clearInterval(_killInterval);
                    _killInterval = null;
                    return;
                }
                speedKillVideo();
                clickSkipButtons();
                hideCompanionBanners();
            }, 100);

            // 1.5s hard nuke — force-clear ad state
            _nukeTimer = setTimeout(function() {
                if (!_adActive) return;
                console.log('[OrbitShield] ⚡ NUKE — forcing ad state clear');

                var player = document.querySelector('#movie_player, .html5-video-player');
                if (player) {
                    player.classList.remove('ad-showing', 'ad-interrupting', 'ad-created');
                }

                // Hide ad-specific modules (NOT the player overlay containers
                // which also hold native controls like seek/settings/fullscreen)
                document.querySelectorAll('.video-ads, .ytp-ad-module').forEach(function(el) {
                    el.style.display = 'none';
                });

                // Only hide ad interstitials, NOT the overlay containers
                document.querySelectorAll(
                    '.ytp-ad-action-interstitial'
                ).forEach(function(el) { el.style.display = 'none'; });

                hideCompanionBanners();
                onAdCleared();

                var v = document.querySelector('video');
                if (v) {
                    v.muted = false;
                    v.volume = 1;
                    v.playbackRate = 1.0;
                    try { v.play(); } catch(e) {}
                }
            }, 1500);
        }

        function onAdCleared() {
            if (!_adActive) return;
            _adActive = false;
            console.log('[OrbitShield] ✅ Ad cleared');

            if (_killInterval) { clearInterval(_killInterval); _killInterval = null; }
            if (_nukeTimer) { clearTimeout(_nukeTimer); _nukeTimer = null; }

            var v = document.querySelector('video');
            if (v) {
                v.muted = false;
                v.volume = 1;
                v.playbackRate = 1.0;
            }

            // CRITICAL: Restore any elements that the nuke timer may have
            // hidden via inline styles. Without this, native player controls
            // (seek bar, settings, forward/back) stay invisible after ads.
            document.querySelectorAll(
                '.video-ads, .ytp-ad-module, .ytp-ad-action-interstitial'
            ).forEach(function(el) {
                el.style.removeProperty('display');
            });
        }

        // ── MutationObserver — watches #movie_player for .ad-showing ──
        var ytObserver = new MutationObserver(function(mutations) {
            for (var i = 0; i < mutations.length; i++) {
                var mut = mutations[i];

                if (mut.type === 'attributes' && mut.attributeName === 'class') {
                    var target = mut.target;
                    if (target.id === 'movie_player' ||
                        (target.classList && target.classList.contains('html5-video-player'))) {
                        if (target.classList.contains('ad-showing') ||
                            target.classList.contains('ad-interrupting')) {
                            onAdDetected();
                        } else if (_adActive) {
                            onAdCleared();
                        }
                    }
                }

                if (mut.type === 'childList') {
                    for (var j = 0; j < mut.addedNodes.length; j++) {
                        var node = mut.addedNodes[j];
                        if (node.nodeType !== 1) continue;

                        // Player element added → start watching
                        if (node.id === 'movie_player' ||
                            (node.classList && node.classList.contains('html5-video-player'))) {
                            ytObserver.observe(node, { attributes: true, attributeFilter: ['class'] });
                            if (node.classList.contains('ad-showing') ||
                                node.classList.contains('ad-interrupting')) {
                                onAdDetected();
                            }
                        }

                        // Skip buttons → instant click
                        try {
                            if (node.matches && node.matches(SKIP_SEL)) node.click();
                        } catch(e) {}

                        // Companion banners → instant hide
                        try {
                            if (node.matches && node.matches(COMPANION_SEL)) {
                                node.style.display = 'none';
                            }
                        } catch(e) {}

                        // Deep scan children
                        if (node.querySelector) {
                            try {
                                var player = node.querySelector('#movie_player, .html5-video-player');
                                if (player) {
                                    ytObserver.observe(player, { attributes: true, attributeFilter: ['class'] });
                                    if (player.classList.contains('ad-showing') ||
                                        player.classList.contains('ad-interrupting')) {
                                        onAdDetected();
                                    }
                                }
                            } catch(e) {}
                            try {
                                node.querySelectorAll(SKIP_SEL).forEach(function(btn) { btn.click(); });
                            } catch(e) {}
                            try {
                                node.querySelectorAll(COMPANION_SEL).forEach(function(el) {
                                    el.style.display = 'none';
                                });
                            } catch(e) {}
                        }

                        if (node.tagName === 'VIDEO' && _adActive) {
                            node.muted = true;
                            node.volume = 0;
                        }
                    }
                }
            }
        });

        ytObserver.observe(document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class']
        });

        // Fallback interval — catches edge cases
        setInterval(function() {
            var player = document.querySelector('.html5-video-player');
            if (!player) return;
            var isAd = player.classList.contains('ad-showing') ||
                       player.classList.contains('ad-interrupting');
            if (isAd && !_adActive) onAdDetected();
            if (!isAd && _adActive) onAdCleared();
            // Only hide companions during active ads — not during normal playback
            if (isAd) hideCompanionBanners();
        }, 1000);

        // ── MediaSession metadata bridge ──
        var lastMetaTitle = '';
        setInterval(function() {
            try {
                if (!('mediaSession' in navigator)) return;
                var title = '';
                var yt = document.querySelector(
                    'h1.ytd-video-primary-info-renderer, #info-contents h1, ' +
                    '.slim-video-information-title');
                if (yt) title = yt.textContent.trim();
                if (!title && document.title) {
                    title = document.title.replace(/ - YouTube.*$/, '');
                }
                if (title && title !== 'YouTube' && title !== lastMetaTitle) {
                    lastMetaTitle = title;
                    var ch = document.querySelector(
                        '#channel-name .yt-formatted-string, .slim-owner-channel-name');
                    navigator.mediaSession.metadata = new MediaMetadata({
                        title: title,
                        artist: ch ? ch.textContent.trim() : '',
                        album: 'YouTube'
                    });
                }
            } catch(e) {}
        }, 3000);
    }


    // ═══════════════════════════════════════════════════════════════
    // SECTION 3: UNIVERSAL ANNOYANCE NUKE (all websites)
    //
    // PERFORMANCE NOTES:
    //   - MutationObserver uses 300ms debounce (no scan during fast scroll)
    //   - Overlay scan uses TARGETED selectors, NOT querySelectorAll('*')
    //   - Scroll unlock is CONDITIONAL (only after a banner is found)
    //   - Aggressive sweep phase is time-limited (5s, then observer only)
    // ═══════════════════════════════════════════════════════════════

    // ── Scroll-lock classes to remove ──
    var LOCK_CLASSES = [
        'no-scroll', 'noscroll', 'modal-open', 'has-overlay',
        'overflow-hidden', 'cookie-consent-visible',
        'qc-cmp2-showing', 'sp-message-open',
        'cli-barmodal-open', 'pum-open', 'cmplz-blocked',
        'ot-overflow-hidden', 'onetrust-overflow-hidden',
        'ot-sdk-no-scroll', 'consent-open', 'gdpr-open'
    ];

    // ── Accept button selectors ──
    var ACCEPT_SELECTORS = [
        '#onetrust-accept-btn-handler',
        '.onetrust-close-btn-handler',
        '#accept-recommended-btn-handler',
        '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
        '#CybotCookiebotDialogBodyButtonAccept',
        '.qc-cmp2-summary-buttons button[mode="primary"]',
        '#didomi-notice-agree-button',
        '[data-testid="uc-accept-all-button"]',
        '#uc-btn-accept-banner',
        '#cookie_action_close_header',
        '.cmplz-btn.cmplz-accept',
        '.iubenda-cs-accept-btn',
        'button[title="Accept All"]',
        'button[title="Accept all"]',
        '.klaro .cm-btn-accept',
        '.BorlabsCookie [data-cookie-accept]',
        'button[class*="accept-all"]',
        'button[class*="acceptAll"]',
        'button[class*="AcceptAll"]',
        'button[id*="accept"]',
        '[class*="cookie"] button[class*="primary"]',
        '[class*="consent"] button[class*="primary"]',
        'button[aria-label*="Accept"]',
        'button[aria-label*="accept"]',
        'button[aria-label*="Agree"]'
    ];

    // ── OneTrust deep destruction ──
    function nukeOneTrust() {
        var OT_IDS = [
            'onetrust-consent-sdk', 'onetrust-banner-sdk',
            'onetrust-pc-sdk', 'ot-sdk-btn-floating'
        ];
        OT_IDS.forEach(function(id) {
            var el = document.getElementById(id);
            if (el) el.remove();
        });

        ['.onetrust-pc-dark-filter', '.ot-fade-in', '.ot-floating-button',
         '[class*="onetrust"]', '[class*="ot-sdk"]'].forEach(function(sel) {
            try {
                document.querySelectorAll(sel).forEach(function(el) { el.remove(); });
            } catch(e) {}
        });

        if (document.body) {
            document.body.classList.remove('ot-overflow-hidden', 'ot-sdk-no-scroll');
            document.documentElement.classList.remove('ot-overflow-hidden', 'ot-sdk-no-scroll');
        }

        try {
            if (window.OneTrust) {
                window.OneTrust.Close = function() {};
                window.OneTrust.ToggleInfoDisplay = function() {};
                window.OneTrust.LoadBanner = function() {};
                window.OneTrust.Init = function() {};
            }
            if (window.OptanonWrapper) {
                window.OptanonWrapper = function() {};
            }
        } catch(e) {}
    }

    // ── Auto-accept consent ──
    function tryAutoAccept() {
        for (var i = 0; i < ACCEPT_SELECTORS.length; i++) {
            try {
                var btn = document.querySelector(ACCEPT_SELECTORS[i]);
                if (btn && btn.offsetParent !== null) {
                    btn.click();
                    return true;
                }
            } catch(e) {}
        }

        try {
            var buttons = document.querySelectorAll('button, a[role="button"]');
            for (var j = 0; j < buttons.length; j++) {
                var text = (buttons[j].textContent || '').trim().toLowerCase();
                if (text === 'accept all' || text === 'i accept' ||
                    text === 'accept cookies' || text === 'agree' ||
                    text === 'agree & close' || text === 'got it' ||
                    text === 'i agree' || text === 'allow all' ||
                    text === 'accept all cookies') {
                    var parent = buttons[j].closest(
                        '[class*="cookie"], [class*="consent"], [class*="banner"], ' +
                        '[class*="onetrust"], [id*="cookie"], [id*="consent"]');
                    if (parent) {
                        buttons[j].click();
                        return true;
                    }
                }
            }
        } catch(e) {}
        return false;
    }

    // ── Heuristic overlay detector (OPTIMIZED) ──
    // OLD: querySelectorAll('*') + getComputedStyle on EVERY element → main thread death
    // NEW: Targeted selectors for likely overlays only → 50-100x fewer elements scanned
    var BANNER_KEYWORDS = /cookie|consent|gdpr|privacy|tracking|datenschutz|rgpd|ccpa|cpra|tcf|onetrust|notice.*accept/i;

    var OVERLAY_SELECTORS = [
        '[class*="cookie"]', '[class*="consent"]', '[class*="gdpr"]',
        '[class*="privacy"]', '[class*="banner"]', '[class*="modal"]',
        '[class*="overlay"]', '[class*="popup"]', '[class*="notice"]',
        '[id*="cookie"]', '[id*="consent"]', '[id*="gdpr"]',
        '[id*="privacy"]', '[id*="banner"]',
        '[role="dialog"]', '[role="alertdialog"]',
        '[aria-modal="true"]'
    ].join(', ');

    function killBannerOverlays() {
        var removed = false;
        try {
            var candidates = document.querySelectorAll(OVERLAY_SELECTORS);
            for (var i = 0; i < candidates.length; i++) {
                var el = candidates[i];
                var computed = getComputedStyle(el);
                if (computed.position !== 'fixed' && computed.position !== 'sticky') continue;
                var zIndex = parseInt(computed.zIndex) || 0;
                if (zIndex < 999) continue;

                var rect = el.getBoundingClientRect();
                if (rect.width < 200 || rect.height < 30) continue;

                var content = ((el.className || '') + ' ' + (el.id || '') + ' ' +
                    (el.innerText || '').substring(0, 500)).toLowerCase();
                if (BANNER_KEYWORDS.test(content)) {
                    el.remove();
                    removed = true;
                }
            }
        } catch(e) {}
        return removed;
    }

    // ── Conditional scroll unlock ──
    // ONLY called when a banner was actually found and removed.
    function unlockScroll() {
        var html = document.documentElement;
        var body = document.body;
        if (!html || !body) return;

        [html, body].forEach(function(el) {
            if (el.style.overflow === 'hidden' || el.style.overflow === 'clip') {
                el.style.setProperty('overflow', 'auto', 'important');
            }
            if (el.style.position === 'fixed') {
                el.style.setProperty('position', 'static', 'important');
            }
            LOCK_CLASSES.forEach(function(cls) {
                el.classList.remove(cls);
            });
        });
    }

    // ── Full sweep (returns true if anything was found) ──
    function fullSweep() {
        var found = false;
        nukeOneTrust();
        if (tryAutoAccept()) found = true;
        if (killBannerOverlays()) found = true;
        if (found) unlockScroll();
        return found;
    }

    // ── Startup phase: 5 sweeps over 5s (was 30 over 15s) ──
    fullSweep();
    var sweepCount = 0;
    var sweepInterval = setInterval(function() {
        fullSweep();
        sweepCount++;
        if (sweepCount >= 5) clearInterval(sweepInterval);
    }, 1000);

    // ── Debounced MutationObserver (300ms settling window) ──
    // During fast scroll / lazy-load, DOM mutations fire continuously.
    // Without debounce, the overlay scan locks the main thread.
    var _consentDebounceTimer = null;

    if (document.body || document.documentElement) {
        var consentObserver = new MutationObserver(function(mutations) {
            var hasAdded = false;
            for (var i = 0; i < mutations.length; i++) {
                if (mutations[i].addedNodes.length > 0) {
                    hasAdded = true;
                    break;
                }
            }
            if (!hasAdded) return;

            // Debounce: cancel pending scan, reschedule after 300ms
            if (_consentDebounceTimer) clearTimeout(_consentDebounceTimer);
            _consentDebounceTimer = setTimeout(function() {
                _consentDebounceTimer = null;
                var accepted = tryAutoAccept();
                var killed = killBannerOverlays();
                if (accepted || killed) unlockScroll();
            }, 300);
        });

        var target = document.body || document.documentElement;
        consentObserver.observe(target, {
            childList: true,
            subtree: true
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            fullSweep();
        });
    }

    console.log('[OrbitShield] DOM Assassin v3 deployed — ' +
        (_isYT ? 'YouTube speed-kill + ' : '') +
        'universal annoyance nuke + cosmetic cleanup');
})();

