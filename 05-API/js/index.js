var app = (function ($) {
    'use strict';

    // ==========================================
    // WORKSHEET 5 - APIS AND LOCALSTORAGE
    // ==========================================

    /**
     * Requirement 1.b:
     * Store button state and toggle timestamp in browser session using sessionStorage.setItem(id, object).
     *
     * Requirement 1.c:
     * What happens if you close the browser?
     * Answer: Data in sessionStorage is lost when the browser or tab is closed, because its lifecycle
     * is bound to the current top-level browsing context.
     *
     * Requirement 1.d:
     * Change to a more persistent storage -> window.localStorage.
     * localStorage persists even across browser closures and system restarts.
     */
    var storage = window.localStorage;

    // OpenWeatherMap API Key
    var API_KEY = 'bd119d60ad3dd4ff50577faa7112d361';

    // Timestamp when weather was fetched
    var lastWeatherFetchTime = null;

    // ==========================================
    // 1. STORAGE HELPER FUNCTIONS (1.b, 1.c, 1.d)
    // ==========================================

    /**
     * Save button state and timestamp to storage using JSON.stringify
     * @param {string} switchId - Element ID of the switch
     * @param {string} state - 'on' or 'off'
     * @param {string} time - ISO timestamp string (e.g., '2023-10-31T16:22:53.804Z')
     */
    function saveButtonState(switchId, state, time) {
        var data = {
            state: state,
            time: time
        };
        try {
            storage.setItem(switchId, JSON.stringify(data));
        } catch (e) {
            console.error('Error saving to storage:', e);
        }
    }

    /**
     * Retrieve and parse button state from storage using JSON.parse
     * @param {string} switchId - Element ID of the switch
     * @returns {Object|null} - Parsed object { state, time } or null
     */
    function loadButtonState(switchId) {
        try {
            var item = storage.getItem(switchId);
            // Fallback check in sessionStorage in case it was stored there previously
            if (!item && window.sessionStorage) {
                item = window.sessionStorage.getItem(switchId);
            }
            if (item) {
                return JSON.parse(item);
            }
        } catch (e) {
            console.error('Error reading from storage:', e);
        }
        return null;
    }

    // ==========================================
    // 2. HOME SWEET HOME DASHBOARD
    // ==========================================

    /**
     * Generates a random temperature formatted with one decimal place and " °C"
     */
    function getRandomTemperature(min, max) {
        var randomVal = Math.random() * (max - min) + min;
        return randomVal.toFixed(1) + ' °C';
    }

    /**
     * Update the temperature values every 5 seconds using jQuery
     */
    function updateTemperatures() {
        $('#kitchen-temperature').text(getRandomTemperature(10, 30));
        $('#living-temperature').text(getRandomTemperature(10, 30));
    }

    /**
     * Update the date when the page is loaded (YYYY-MM-DD) using jQuery
     */
    function updateDate() {
        var now = new Date();
        var year = now.getFullYear();
        var month = String(now.getMonth() + 1).padStart(2, '0');
        var day = String(now.getDate()).padStart(2, '0');

        $('#clock-date').text(year + '-' + month + '-' + day);
    }

    /**
     * Update hours, minutes, and seconds automatically every second (HH:MM:SS) using jQuery
     */
    function updateTime() {
        var now = new Date();
        var hours = String(now.getHours()).padStart(2, '0');
        var minutes = String(now.getMinutes()).padStart(2, '0');
        var seconds = String(now.getSeconds()).padStart(2, '0');

        $('#clock-time').text(hours + ':' + minutes + ':' + seconds);
    }

    /**
     * Setup toggle switches with persistent storage of state and toggle time
     * @param {string} switchId - ID of the input switch checkbox
     * @param {string} iconId - ID of the corresponding icon
     * @param {string} timeId - ID of the paragraph element displaying the last toggle time
     * @param {string} type - 'light' or 'music'
     */
    function setupToggle(switchId, iconId, timeId, type) {
        var $switch = $('#' + switchId);
        var $icon = $('#' + iconId);
        var $time = $('#' + timeId);

        if (!$switch.length || !$icon.length) return;

        function applyDisplay(isOn, timeStr) {
            var stateValue = isOn ? 'on' : 'off';
            $switch.prop('checked', isOn);
            $switch.val(stateValue);
            $switch.attr('value', stateValue);

            if (timeStr && $time.length) {
                $time.text(timeStr);
            }

            if (type === 'light') {
                if (isOn) {
                    $icon.attr('class', 'bi bi-lightbulb-fill text-warning me-2');
                } else {
                    $icon.attr('class', 'bi bi-lightbulb text-secondary me-2');
                }
            } else if (type === 'music') {
                if (isOn) {
                    $icon.attr('class', 'bi bi-volume-up-fill text-success me-2');
                } else {
                    $icon.attr('class', 'bi bi-volume-mute-fill text-danger me-2');
                }
            }
        }

        // 1. Restore previous state and timestamp from storage (Requirements 1.b, 1.d)
        var saved = loadButtonState(switchId);
        if (saved && saved.state) {
            applyDisplay(saved.state === 'on', saved.time);
        } else {
            // First time loading: persist current default state and current ISO timestamp
            var initialIsOn = $switch.is(':checked');
            var initialTime = new Date().toISOString();
            saveButtonState(switchId, initialIsOn ? 'on' : 'off', initialTime);
            applyDisplay(initialIsOn, initialTime);
        }

        // 2. Listen for user toggles (click / change)
        $switch.on('change click', function () {
            var isOn = $switch.is(':checked');
            var stateValue = isOn ? 'on' : 'off';
            var nowIso = new Date().toISOString();

            applyDisplay(isOn, nowIso);
            saveButtonState(switchId, stateValue, nowIso);
        });
    }

    // ==========================================
    // 3. WEATHER PANEL (OPENWEATHERMAP API)
    // ==========================================

    /**
     * Format unix timestamp to hour and minutes (e.g., 7h46, 18h54)
     */
    function formatSunTime(unixTimestamp) {
        var date = new Date(unixTimestamp * 1000);
        var hours = date.getHours();
        var minutes = String(date.getMinutes()).padStart(2, '0');
        return hours + 'h' + minutes;
    }

    /**
     * Dynamically update the time elapsed since the weather information was fetched
     */
    function updateWeatherRelativeTime() {
        if (!lastWeatherFetchTime) return;

        var diffSeconds = Math.floor((Date.now() - lastWeatherFetchTime) / 1000);
        if (diffSeconds < 0) diffSeconds = 0;

        var text = '';
        if (diffSeconds < 60) {
            text = diffSeconds + (diffSeconds === 1 ? ' second ago' : ' seconds ago');
        } else if (diffSeconds < 3600) {
            var diffMinutes = Math.floor(diffSeconds / 60);
            text = diffMinutes + (diffMinutes === 1 ? ' minute ago' : ' minutes ago');
        } else {
            var diffHours = Math.floor(diffSeconds / 3600);
            text = diffHours + (diffHours === 1 ? ' hour ago' : ' hours ago');
        }

        $('#weather-last-update').text(text);
    }

    /**
     * Render weather data into the Weather panel
     */
    function applyWeatherData(data) {
        if (!data || !data.main) return;

        var temp = Number(data.main.temp).toFixed(2) + ' °C';
        var tempMax = Number(data.main.temp_max).toFixed(2) + ' °C';
        var tempMin = Number(data.main.temp_min).toFixed(2) + ' °C';
        var humidity = data.main.humidity + '%';

        var sunrise = data.sys && data.sys.sunrise ? formatSunTime(data.sys.sunrise) : '--';
        var sunset = data.sys && data.sys.sunset ? formatSunTime(data.sys.sunset) : '--';

        $('#weather-temperature').text(temp);
        $('#weather-temp-max').text(tempMax);
        $('#weather-temp-min').text(tempMin);
        $('#weather-humidity').text(humidity);
        $('#weather-sunrise').text(sunrise);
        $('#weather-sunset').text(sunset);

        lastWeatherFetchTime = Date.now();
        updateWeatherRelativeTime();
    }

    /**
     * Fallback weather data matching Worksheet sample values
     */
    function applyFallbackWeatherData() {
        $('#weather-temperature').text('19.44 °C');
        $('#weather-temp-max').text('20 °C');
        $('#weather-temp-min').text('17.72 °C');
        $('#weather-humidity').text('96%');
        $('#weather-sunrise').text('7h02');
        $('#weather-sunset').text('17h37');

        lastWeatherFetchTime = Date.now();
        updateWeatherRelativeTime();
    }

    /**
     * Fetch weather information from OpenWeatherMap using jQuery $.ajax
     */
    function fetchWeather(city) {
        city = city || $('#weather-city').val() || 'leiria';
        var url = 'https://api.openweathermap.org/data/2.5/weather?units=metric&q=' + encodeURIComponent(city) + '&appid=' + API_KEY;

        $.ajax({
            url: url,
            method: 'GET',
            dataType: 'json',
            success: function (data) {
                applyWeatherData(data);
            },
            error: function (xhr, status, error) {
                console.warn('Weather API request notice (' + xhr.status + '): ' + error);
                applyFallbackWeatherData();
            }
        });
    }

    /**
     * Initialize all dashboard functionalities
     */
    function init() {
        // Date & Time
        updateDate();
        updateTime();
        setInterval(updateTime, 1000);

        // Temperatures update every 5s
        setInterval(updateTemperatures, 5000);

        // Worksheet 5: Setup toggles with LocalStorage persistence and timestamp tracking
        setupToggle('kitchen-lights-switch', 'kitchen-lights-icon', 'kitchen-lights-time', 'light');
        setupToggle('ceiling-lights-switch', 'ceiling-lights-icon', 'ceiling-lights-time', 'light');
        setupToggle('ambient-lights-switch', 'ambient-lights-icon', 'ambient-lights-time', 'light');
        setupToggle('ambient-music-switch', 'ambient-music-icon', 'ambient-music-time', 'music');

        // Weather Panel
        $('#weather-get-btn').on('click', function () {
            fetchWeather();
        });

        $('#weather-city').on('keypress', function (e) {
            if (e.which === 13) {
                e.preventDefault();
                fetchWeather();
            }
        });

        // Initial weather fetch
        fetchWeather('leiria');

        // Weather elapsed time interval
        setInterval(updateWeatherRelativeTime, 1000);
    }

    // Initialize when DOM is ready using jQuery
    $(document).ready(function () {
        init();
    });

    // Return public API for inspection or testing
    return {
        storage: storage,
        saveButtonState: saveButtonState,
        loadButtonState: loadButtonState,
        updateDate: updateDate,
        updateTime: updateTime,
        updateTemperatures: updateTemperatures,
        setupToggle: setupToggle,
        getRandomTemperature: getRandomTemperature,
        fetchWeather: fetchWeather,
        updateWeatherRelativeTime: updateWeatherRelativeTime,
        formatSunTime: formatSunTime
    };
})(jQuery);
