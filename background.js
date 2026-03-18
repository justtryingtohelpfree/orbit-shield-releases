// ═══════════════════════════════════════════════════════════════
// Orbit Shield v3 — Network Nuke (background.js)
//
// Universal ad/tracker network-level blocker.
// Uses chrome.webRequest.onBeforeRequest to cancel matching requests.
//
// CRITICAL: YouTube's ad VIDEO requests are WHITELISTED.
// If we block googlevideo.com or YouTube's ad pings at the network
// level, the player detects the missing response and shows a
// 10-second black screen penalty. Instead, we let those through
// and handle YouTube ads at the DOM level via sniper.js (16x speed-kill).
//
// Everything else (Amazon ads, DoubleClick, Meta pixels, analytics,
// native ads, SSPs, fingerprinting, push spam) is blocked here.
// ═══════════════════════════════════════════════════════════════

(function() {
    'use strict';

    // ── YOUTUBE PASSTHROUGH ──
    // These patterns are EXCLUDED from blocking.
    // Blocking them causes YouTube's player to throw a timeout error.
    var YOUTUBE_PASSTHROUGH = [
        'googlevideo.com',
        'youtube.com/pagead',
        'youtube.com/api/stats',
        'youtube.com/ptracking',
        'youtube.com/get_video_info',
        'youtubei.googleapis.com'
    ];

    function isYouTubeAdRequest(url) {
        for (var i = 0; i < YOUTUBE_PASSTHROUGH.length; i++) {
            if (url.indexOf(YOUTUBE_PASSTHROUGH[i]) !== -1) return true;
        }
        return false;
    }

    // ═══════════════════════════════════════════════════════════════
    // UNIVERSAL BLOCKLIST — ~300 patterns across 14 categories
    // ═══════════════════════════════════════════════════════════════
    var BLOCKED_PATTERNS = [

        // ── SECTION 1: SEARCH ENGINE ADS & DISPLAY NETWORKS ──
        "*://*.doubleclick.net/*",
        "*://*.googlesyndication.com/*",
        "*://*.googleadservices.com/*",
        "*://*.google-analytics.com/*",
        "*://*.googletagmanager.com/*",
        "*://*.googletagservices.com/*",
        "*://*.pagead2.googlesyndication.com/*",
        "*://*.adservice.google.com/*",
        "*://*.adservice.google.co.uk/*",
        "*://*.adservice.google.de/*",
        "*://*.adservice.google.fr/*",
        "*://*.adservice.google.ca/*",
        "*://*.adservice.google.com.au/*",
        "*://*.adsense.google.com/*",
        "*://*.tpc.googlesyndication.com/*",
        "*://*.pagead2.googlesyndication.com/pagead/*",
        "*://*.partner.googleadservices.com/*",
        "*://*.google.com/pagead/*",
        "*://*.google.com/adsense/*",
        "*://fundingchoicesmessages.google.com/*",
        "*://www.google.com/recaptcha/api2/aframe*",
        "*://*.googlesyndication.com/safeframe/*",

        // ── SECTION 2: E-COMMERCE ADS ──
        "*://*.amazon-adsystem.com/*",
        "*://*.aax.amazon.com/*",
        "*://*.z-na.amazon-adsystem.com/*",
        "*://*.fls-na.amazon-adsystem.com/*",
        "*://*.aan.amazon.com/*",
        "*://*.as-sec.casalemedia.com/*",
        "*://*.assoc-amazon.com/*",

        // ── SECTION 3: SOCIAL MEDIA ADS & TRACKING ──
        "*://*.facebook.net/signals/*",
        "*://*.facebook.com/tr/*",
        "*://*.facebook.com/tr?*",
        "*://*.connect.facebook.net/en_US/fbevents.js*",
        "*://*.pixel.facebook.com/*",
        "*://*.an.facebook.com/*",
        "*://*.ads.linkedin.com/*",
        "*://*.analytics.tiktok.com/*",
        "*://*.ads.tiktok.com/*",
        "*://*.analytics.twitter.com/*",
        "*://*.ads-api.twitter.com/*",
        "*://*.static.ads-twitter.com/*",
        "*://t.co/i/adsct*",
        "*://*.ads.pinterest.com/*",
        "*://*.snap.licdn.com/*",
        "*://*.tr.snapchat.com/*",

        // ── SECTION 4: CLICKBAIT / NATIVE ADS ──
        "*://*.taboola.com/*",
        "*://*.cdn.taboola.com/*",
        "*://*.trc.taboola.com/*",
        "*://*.outbrain.com/*",
        "*://*.widgets.outbrain.com/*",
        "*://*.revcontent.com/*",
        "*://*.mgid.com/*",
        "*://*.contentad.net/*",
        "*://*.zergnet.com/*",
        "*://*.nativo.com/*",
        "*://*.sharethrough.com/*",
        "*://*.triplelift.com/*",

        // ── SECTION 5: MAJOR AD EXCHANGES & SSPs ──
        "*://*.openx.net/*",
        "*://*.pubmatic.com/*",
        "*://*.rubiconproject.com/*",
        "*://*.criteo.com/*",
        "*://*.criteo.net/*",
        "*://*.indexexchange.com/*",
        "*://*.casalemedia.com/*",
        "*://*.appnexus.com/*",
        "*://*.adnxs.com/*",
        "*://*.smartadserver.com/*",
        "*://*.33across.com/*",
        "*://*.yieldmo.com/*",
        "*://*.media.net/*",
        "*://*.bidswitch.net/*",
        "*://*.sovrn.com/*",
        "*://*.lijit.com/*",
        "*://*.gumgum.com/*",
        "*://*.undertone.com/*",
        "*://*.kargo.com/*",
        "*://*.adform.net/*",
        "*://*.adsrvr.org/*",
        "*://*.demdex.net/*",
        "*://*.bluekai.com/*",
        "*://*.exelator.com/*",
        "*://*.eyeota.net/*",
        "*://*.everesttech.net/*",
        "*://*.mookie1.com/*",
        "*://*.turn.com/*",

        // ── SECTION 6: VIDEO ADS ──
        "*://*.springserve.com/*",
        "*://*.spotxchange.com/*",
        "*://*.spotx.tv/*",
        "*://*.teads.tv/*",
        "*://*.innovid.com/*",
        "*://*.aniview.com/*",
        "*://*.unruly.co/*",
        "*://*.connatix.com/*",
        "*://*.vidoomy.com/*",
        "*://*.adcolony.com/*",
        "*://*.vungle.com/*",
        "*://*.unity3d.com/ads/*",
        "*://*.unityads.unity3d.com/*",

        // ── SECTION 7: TRACKING / TELEMETRY / ANALYTICS ──
        "*://*.scorecardresearch.com/*",
        "*://*.quantserve.com/*",
        "*://*.omtrdc.net/*",
        "*://*.2o7.net/*",
        "*://*.chartbeat.com/*",
        "*://*.chartbeat.net/*",
        "*://*.newrelic.com/*",
        "*://*.nr-data.net/*",
        "*://*.segment.com/*",
        "*://*.segment.io/*",
        "*://*.mixpanel.com/*",
        "*://*.amplitude.com/*",
        "*://*.hotjar.com/*",
        "*://*.hotjar.io/*",
        "*://*.clarity.ms/*",
        "*://*.mouseflow.com/*",
        "*://*.fullstory.com/*",
        "*://*.crazyegg.com/*",
        "*://*.luckyorange.com/*",
        "*://*.inspectlet.com/*",
        "*://*.heap.io/*",
        "*://*.heapanalytics.com/*",
        "*://*.kissmetrics.com/*",
        "*://*.optimizely.com/*",
        "*://*.adobedtm.com/*",
        "*://*.assets.adobedtm.com/*",
        "*://*.omniture.com/*",
        "*://*.mparticle.com/*",
        "*://*.branch.io/*",
        "*://*.adjust.com/*",
        "*://*.appsflyer.com/*",
        "*://*.app.link/*",
        "*://*.braze.com/*",
        "*://*.onesignal.com/*",
        "*://*.pushwoosh.com/*",
        "*://*.leanplum.com/*",

        // ── SECTION 8: FINGERPRINTING / SURVEILLANCE ──
        "*://*.iovation.com/*",
        "*://*.threatmetrix.com/*",
        "*://*.permutive.com/*",
        "*://*.id5-sync.com/*",
        "*://*.liveinternet.ru/*",
        "*://*.liveramp.com/*",
        "*://*.tapad.com/*",
        "*://*.crwdcntrl.net/*",
        "*://*.loopme.com/*",
        "*://*.drawbridge.com/*",
        "*://*.distillery.com/*",
        "*://*.zeotap.com/*",

        // ── SECTION 9: POP-UNDERS / REDIRECTS / MALWARE ──
        "*://*.propellerads.com/*",
        "*://*.popads.net/*",
        "*://*.popcash.net/*",
        "*://*.adcash.com/*",
        "*://*.admaven.com/*",
        "*://*.hilltopads.com/*",
        "*://*.trafficjunky.com/*",
        "*://*.exoclick.com/*",
        "*://*.juicyads.com/*",
        "*://*.clickadu.com/*",

        // ── SECTION 10: SOCIAL WIDGETS / SHARE BUTTONS ──
        "*://platform.twitter.com/widgets.js*",
        "*://connect.facebook.net/*/sdk.js*",
        "*://connect.facebook.net/*/all.js*",
        "*://apis.google.com/js/plusone.js*",
        "*://*.addthis.com/*",
        "*://*.addtoany.com/*",
        "*://*.sharethis.com/*",

        // ── SECTION 11: PUSH NOTIFICATION SPAM ──
        "*://*.pushcrew.com/*",
        "*://*.subscribers.com/*",
        "*://*.webpushs.com/*",
        "*://*.pushly.com/*",
        "*://*.aimtell.com/*",
        "*://*.izooto.com/*",

        // ── SECTION 12: PAYWALL / ANTI-ADBLOCK DETECTORS ──
        "*://*.blockadblock.com/*",
        "*://*.fuckadblock.com/*",
        "*://*.admiral.com/*",
        "*://*.getadmiral.com/*",
        "*://*.pagefair.com/*",
        "*://*.pagefair.net/*",
        "*://*.detectadblock.com/*",

        // ── SECTION 13: CMPs (Cookie Consent) ──
        "*://*.onetrust.com/*",
        "*://*.cookielaw.org/*",
        "*://*.termsfeed.com/*",
        "*://*.cookiebot.com/*",
        "*://*.termly.io/*",
        "*://*.trustarc.com/*",
        "*://*.quantcast.com/choice/*",
        "*://*.consensu.org/*",
        "*://*.sourcepoint.com/*",

        // ── SECTION 14: MISC TRACKING PIXELS ──
        "*://*.bat.bing.com/*",
        "*://*.ct.pinterest.com/*",
        "*://*.px.ads.linkedin.com/*",
        "*://www.redditstatic.com/ads/*",
        "*://*.ads.reddit.com/*"
    ];

    // ═══════════════════════════════════════════════════════════════
    // NETWORK INTERCEPTOR
    // ═══════════════════════════════════════════════════════════════

    var blockCount = 0;

    chrome.webRequest.onBeforeRequest.addListener(
        function(details) {
            var url = details.url;

            // ── YouTube Passthrough ──
            // Let YouTube's own ad requests through — sniper.js handles them
            if (isYouTubeAdRequest(url)) {
                return { cancel: false };
            }

            blockCount++;
            return { cancel: true };
        },
        {
            urls: BLOCKED_PATTERNS,
            types: [
                "script", "image", "stylesheet", "xmlhttprequest",
                "sub_frame", "object", "ping", "beacon", "websocket",
                "font", "media", "other"
            ]
        },
        ["blocking"]
    );

    // ═══════════════════════════════════════════════════════════════
    // DYNAMIC BLOCKLIST — Steven Black's hosts (100K+ domains)
    // ═══════════════════════════════════════════════════════════════

    var HOSTS_URL = 'https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts';
    var CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
    var dynamicBlockSet = new Set();

    function parseHostsFile(text) {
        var set = new Set();
        var lines = text.split('\n');
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            if (!line || line[0] === '#') continue;
            var parts = line.split(/\s+/);
            if (parts.length >= 2 && (parts[0] === '0.0.0.0' || parts[0] === '127.0.0.1')) {
                var domain = parts[1].toLowerCase();
                if (domain !== 'localhost' && domain.indexOf('.') > 0) {
                    set.add(domain);
                }
            }
        }
        return set;
    }

    function loadDynamicBlocklist() {
        chrome.storage.local.get(['hosts_cache', 'hosts_ts'], function(data) {
            var now = Date.now();
            if (data.hosts_cache && data.hosts_ts && (now - data.hosts_ts < CACHE_TTL)) {
                dynamicBlockSet = new Set(JSON.parse(data.hosts_cache));
                console.log('[OrbitShield] Dynamic blocklist loaded from cache: ' +
                    dynamicBlockSet.size + ' domains');
                return;
            }

            fetch(HOSTS_URL)
                .then(function(r) { return r.text(); })
                .then(function(text) {
                    dynamicBlockSet = parseHostsFile(text);
                    console.log('[OrbitShield] Dynamic blocklist fetched: ' +
                        dynamicBlockSet.size + ' domains');

                    // Cache with size limit (store up to 80K entries)
                    var toCache = Array.from(dynamicBlockSet).slice(0, 80000);
                    chrome.storage.local.set({
                        hosts_cache: JSON.stringify(toCache),
                        hosts_ts: now
                    });
                })
                .catch(function(e) {
                    console.warn('[OrbitShield] Dynamic blocklist fetch failed:', e);
                });
        });
    }

    // Dynamic hostname blocking (supplements the static pattern list)
    chrome.webRequest.onBeforeRequest.addListener(
        function(details) {
            try {
                var hostname = new URL(details.url).hostname.toLowerCase();
                // Don't block YouTube-owned domains
                if (hostname.indexOf('youtube') !== -1 ||
                    hostname.indexOf('googlevideo') !== -1 ||
                    hostname.indexOf('ytimg') !== -1) {
                    return { cancel: false };
                }
                if (dynamicBlockSet.has(hostname)) {
                    blockCount++;
                    return { cancel: true };
                }
            } catch (e) {}
            return { cancel: false };
        },
        { urls: ["<all_urls>"] },
        ["blocking"]
    );

    // Load blocklist on startup
    loadDynamicBlocklist();
    // Refresh every 24 hours
    setInterval(loadDynamicBlocklist, CACHE_TTL);

    console.log('[OrbitShield] Network Nuke v3 active — ' +
        BLOCKED_PATTERNS.length + ' static patterns + dynamic hosts blocklist');
})();
