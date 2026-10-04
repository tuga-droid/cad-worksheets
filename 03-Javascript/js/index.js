var app = (function () {
    'use strict';

    // ==========================================
    // 1. MY FIRST JAVASCRIPT PAGE
    // ==========================================
    // Requirement 1.d: Use the alert function to show a "Hello World" message
    alert('Hello World');

    // ==========================================
    // 2. HOME SWEET HOME
    // ==========================================

    /**
     * Generates a random temperature formatted with one decimal place and " °C"
     * Requirement 2.e: Random value between 10 and 30 ºC
     */
    function getRandomTemperature(min, max) {
        var randomVal = Math.random() * (max - min) + min;
        return randomVal.toFixed(1) + ' °C';
    }

    /**
     * Requirement 2.e: Update the temperature values every 5 seconds
     */
    function updateTemperatures() {
        var kitchenTempEl = document.getElementById('kitchen-temperature');
        var livingTempEl = document.getElementById('living-temperature');

        if (kitchenTempEl) {
            kitchenTempEl.textContent = getRandomTemperature(10, 30);
        }
        if (livingTempEl) {
            livingTempEl.textContent = getRandomTemperature(10, 30);
        }
    }

    /**
     * Requirement 2.f: Update the date when the page is loaded (YYYY-MM-DD)
     */
    function updateDate() {
        var dateEl = document.getElementById('clock-date');
        if (!dateEl) return;

        var now = new Date();
        var year = now.getFullYear();
        var month = String(now.getMonth() + 1).padStart(2, '0');
        var day = String(now.getDate()).padStart(2, '0');

        dateEl.textContent = year + '-' + month + '-' + day;
    }

    /**
     * Requirement 2.f: Update hours, minutes, and seconds automatically, every second (HH:MM:SS)
     */
    function updateTime() {
        var timeEl = document.getElementById('clock-time');
        if (!timeEl) return;

        var now = new Date();
        var hours = String(now.getHours()).padStart(2, '0');
        var minutes = String(now.getMinutes()).padStart(2, '0');
        var seconds = String(now.getSeconds()).padStart(2, '0');

        timeEl.textContent = hours + ':' + minutes + ':' + seconds;
    }

    /**
     * Requirements 2.a, 2.b, 2.c, 2.d:
     * - Toggle buttons for lights and music
     * - Value toggles between on and off
     * - Change icon and color of lamp or music to reflect on/off state
     */
    function setupToggle(switchId, iconId, type) {
        var switchEl = document.getElementById(switchId);
        var iconEl = document.getElementById(iconId);

        if (!switchEl || !iconEl) return;

        function updateToggleDisplay() {
            var isOn = switchEl.checked;
            var stateValue = isOn ? 'on' : 'off';

            // Requirement 2.c: value toggles between on and off
            switchEl.value = stateValue;
            switchEl.setAttribute('value', stateValue);

            // Requirement 2.d: Change icon and color of lamp or music
            if (type === 'light') {
                if (isOn) {
                    iconEl.className = 'bi bi-lightbulb-fill text-warning me-2';
                } else {
                    iconEl.className = 'bi bi-lightbulb text-secondary me-2';
                }
            } else if (type === 'music') {
                if (isOn) {
                    iconEl.className = 'bi bi-volume-up-fill text-success me-2';
                } else {
                    iconEl.className = 'bi bi-volume-mute-fill text-danger me-2';
                }
            }
        }

        // Initialize display and value on load
        updateToggleDisplay();

        // Listen for user changes and clicks
        switchEl.addEventListener('change', updateToggleDisplay);
        switchEl.addEventListener('click', updateToggleDisplay);
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
    }

    // Initialize when DOM content is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Return public API for inspection or testing
    return {
        updateDate: updateDate,
        updateTime: updateTime,
        updateTemperatures: updateTemperatures,
        setupToggle: setupToggle,
        getRandomTemperature: getRandomTemperature
    };
})();
