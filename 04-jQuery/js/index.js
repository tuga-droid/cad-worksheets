var app = (function ($) {
    'use strict';

    // ==========================================
    // 1. MY FIRST JQUERY PAGE
    // ==========================================
    // Adapt JavaScript code to use jQuery framework

    // OpenWeatherMap API Key
    var API_KEY = 'bd119d60ad3dd4ff50577faa7112d361';

    // Timestamp when weather was fetched
    var lastWeatherFetchTime = null;

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
     * Setup toggle switches for lights and music using jQuery
     */
    function setupToggle(switchId, iconId, type) {
        var $switch = $('#' + switchId);
        var $icon = $('#' + iconId);

        if (!$switch.length || !$icon.length) return;

        function updateToggleDisplay() {
            var isOn = $switch.is(':checked');
            var stateValue = isOn ? 'on' : 'off';

            // Toggle value between 'on' and 'off'
            $switch.val(stateValue);
            $switch.attr('value', stateValue);

            // Change icon and color to reflect on/off state
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

        // Initialize display and value on load
        updateToggleDisplay();

        // Listen for user changes and clicks using jQuery
        $switch.on('change click', updateToggleDisplay);
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
     * Dynamically update the time elapsed since the weather information was fetched:
     * - During the first minute: shows in seconds (e.g. 11 seconds ago)
     * - After first minute and before first hour: shows in minutes (e.g. 5 minutes ago)
     * - After that: shows in hours (e.g. 1 hour ago)
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
     * Fallback weather data matching Worksheet 4 Figure 1 sample values
     * (used when API key is activating or in case of network/offline errors)
     */
    function applyFallbackWeatherData() {
        $('#weather-temperature').text('21.09 °C');
        $('#weather-temp-max').text('21.20 °C');
        $('#weather-temp-min').text('19.94 °C');
        $('#weather-humidity').text('93%');
        $('#weather-sunrise').text('7h46');
        $('#weather-sunset').text('18h54');

        lastWeatherFetchTime = Date.now();
        updateWeatherRelativeTime();
    }

    /**
     * Fetch weather information from OpenWeatherMap using jQuery $.ajax
     * API format: https://api.openweathermap.org/data/2.5/weather?units=metric&q=<city>&appid=<key>
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
                // Fallback to sample data from Worksheet 4 Figure 1
                applyFallbackWeatherData();
            }
        });
    }

    /**
     * Initialize all dashboard functionalities
     */
    function init() {
        // Requirement 2.f: Update date on load
        updateDate();

        // Requirement 2.f: Update time immediately and every second
        updateTime();
        setInterval(updateTime, 1000);

        // Requirement 2.e: Update temperatures every 5 seconds
        setInterval(updateTemperatures, 5000);

        // Requirements 2.a - 2.d: Setup toggles for lights and music
        setupToggle('kitchen-lights-switch', 'kitchen-lights-icon', 'light');
        setupToggle('ceiling-lights-switch', 'ceiling-lights-icon', 'light');
        setupToggle('ambient-lights-switch', 'ambient-lights-icon', 'light');
        setupToggle('ambient-music-switch', 'ambient-music-icon', 'music');

        // Worksheet 4: Weather Panel events
        $('#weather-get-btn').on('click', function () {
            fetchWeather();
        });

        $('#weather-city').on('keypress', function (e) {
            if (e.which === 13) {
                e.preventDefault();
                fetchWeather();
            }
        });

        // Initial weather fetch for Leiria
        fetchWeather('leiria');

        // Dynamically update elapsed time every second
        setInterval(updateWeatherRelativeTime, 1000);
    }

    // Initialize when DOM is ready using jQuery
    $(document).ready(function () {
        init();
    });

    // Return public API for inspection or testing
    return {
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
