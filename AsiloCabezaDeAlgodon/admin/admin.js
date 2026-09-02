
    function updateGreeting() {
        const greetingElement = document.getElementById('greeting');
        const currentHour = new Date().getHours();

        if (currentHour >= 5 && currentHour < 12) {
            greetingElement.textContent = '¡Buenos días!';
        } else if (currentHour >= 12 && currentHour < 18) {
            greetingElement.textContent = '¡Buenas tardes!';
        } else {
            greetingElement.textContent = '¡Buenas noches!';
        }
    }

    updateGreeting();
