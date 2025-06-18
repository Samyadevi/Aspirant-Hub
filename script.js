document.addEventListener('DOMContentLoaded', () => {
    const navButtons = document.querySelectorAll('.nav-button');
    const appSections = document.querySelectorAll('.app-section'); // Get all sections once here

    // --- Navigation Logic ---
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetSectionId = button.dataset.section;

            // 1. Deactivate ALL navigation buttons
            navButtons.forEach(btn => btn.classList.remove('active'));

            // 2. Hide ALL app sections explicitly
            appSections.forEach(section => {
                section.classList.remove('active'); // Remove the active class
                section.style.display = 'none';    // Explicitly set display to none for ALL sections
            });

            // 3. Activate clicked navigation button
            button.classList.add('active');

            // 4. Show ONLY the target section explicitly
            const targetSection = document.getElementById(targetSectionId);
            targetSection.classList.add('active');
            // Use the display type that matches the section's intended layout
            // For #calendar-todo, #pomodoro, and #quiz, 'flex' is generally good
            // because your internal content uses flex or benefits from it.
            targetSection.style.display = 'flex'; // Or 'block' if it's a simple block layout

            // --- IMPORTANT: QUIZ INITIALIZATION FIX (Keep this) ---
            const quizSubjectSelection = document.getElementById('quiz-subject-selection');
            const quizLevelSelection = document.getElementById('quiz-level-selection');
            const quizArea = document.getElementById('quiz-area');

            if (targetSectionId === 'quiz') {
                showQuizScreen('subject'); // Ensure subject selection is shown when quiz tab is active
            } else {
                // If switching away from quiz, ensure its hidden parts are reset
                quizSubjectSelection.style.display = 'none';
                quizLevelSelection.style.display = 'none';
                quizArea.style.display = 'none';
            }
            // --- END OF QUIZ FIX ---
        });
    });

    // ... rest of your script.js (calendar, pomodoro, quiz logic) ...

    // IMPORTANT: Initial load logic. Ensure only one section is visible on page load.
    // The calendar-todo section starts with 'active' in HTML, so make sure it's 'flex'
    // and others are 'none' initially.
    const initialActiveSection = document.querySelector('.app-section.active');
    if (initialActiveSection) {
        initialActiveSection.style.display = 'flex'; // Or 'block'
    }
    // All other sections will automatically be `display: none` because they lack the `active` class,
    // and the JS will explicitly hide them all initially.
});

    // --- Calendar & Integrated To-Do List Logic ---
    const currentMonthYearDisplay = document.getElementById('current-month-year');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const calendarGrid = document.querySelector('.calendar-grid');
    const selectedDateText = document.getElementById('selected-date-text');
    const newTodoInput = document.getElementById('new-todo-input');
    const addTodoButton = document.getElementById('add-todo-button');
    const todoList = document.getElementById('todo-list');

    let currentCalendarDate = new Date(); // Date object for calendar display
    let selectedTodoDate = formatDate(new Date()); // Date string for currently displayed todo list

    // Store todos as an object where keys are date strings (YYYY-MM-DD)
    let allTodos = JSON.parse(localStorage.getItem('aspirantTodos')) || {};

    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function saveTodos() {
        localStorage.setItem('aspirantTodos', JSON.stringify(allTodos));
    }

    function renderCalendar() {
        calendarGrid.innerHTML = `
            <div class="day-name">Sun</div>
            <div class="day-name">Mon</div>
            <div class="day-name">Tue</div>
            <div class="day-name">Wed</div>
            <div class="day-name">Thu</div>
            <div class="day-name">Fri</div>
            <div class="day-name">Sat</div>
        `;

        const year = currentCalendarDate.getFullYear();
        const month = currentCalendarDate.getMonth(); // 0-indexed

        currentMonthYearDisplay.textContent = new Date(year, month).toLocaleString('en-US', {
            month: 'long',
            year: 'numeric'
        });

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Add empty days
        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.classList.add('calendar-day', 'empty');
            calendarGrid.appendChild(emptyDay);
        }

        // Add actual days
        for (let day = 1; day <= daysInMonth; day++) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('calendar-day');
            dayDiv.textContent = day;
            dayDiv.dataset.date = formatDate(new Date(year, month, day));

            const today = new Date();
            const currentDayDateStr = formatDate(today);

            if (dayDiv.dataset.date === currentDayDateStr) {
                dayDiv.classList.add('current-day');
            }
            if (dayDiv.dataset.date === selectedTodoDate) {
                dayDiv.classList.add('selected-day');
            }

            // Check if this day has tasks
            if (allTodos[dayDiv.dataset.date] && allTodos[dayDiv.dataset.date].length > 0) {
                dayDiv.classList.add('has-tasks');
            }

            dayDiv.addEventListener('click', () => {
                // Remove 'selected-day' from previously selected
                const prevSelected = document.querySelector('.calendar-day.selected-day');
                if (prevSelected) {
                    prevSelected.classList.remove('selected-day');
                }
                dayDiv.classList.add('selected-day');
                selectedTodoDate = dayDiv.dataset.date;
                renderTodosForSelectedDate();
            });
            calendarGrid.appendChild(dayDiv);
        }
        renderTodosForSelectedDate(); // Render todos for the initially selected date (today)
    }

    function renderTodosForSelectedDate() {
        todoList.innerHTML = '';
        // Format the display text for the selected date
        const dateParts = selectedTodoDate.split('-');
        // Note: Month is 0-indexed in Date constructor, so -1 from month part
        const displayDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        if (formatDate(displayDate) === formatDate(today)) {
            selectedDateText.textContent = "Today";
        } else if (formatDate(displayDate) === formatDate(tomorrow)) {
            selectedDateText.textContent = "Tomorrow";
        } else {
            selectedDateText.textContent = displayDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
        }


        const todosForDate = allTodos[selectedTodoDate] || [];

        if (todosForDate.length === 0) {
            const li = document.createElement('li');
            li.textContent = "No tasks for this day yet. Add one above!";
            li.style.fontStyle = 'italic';
            li.style.color = '#78909C';
            li.style.textAlign = 'center';
            li.style.padding = '20px';
            li.style.border = 'none';
            li.style.boxShadow = 'none';
            li.style.backgroundColor = 'transparent';
            todoList.appendChild(li);
        } else {
            todosForDate.forEach((todo, index) => {
                const li = document.createElement('li');
                li.className = todo.completed ? 'completed' : '';
                li.innerHTML = `
                    <span>${todo.text}</span>
                    <div>
                        <button class="toggle-complete" data-index="${index}" title="${todo.completed ? 'Mark Incomplete' : 'Mark Complete'}">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="delete-task" data-index="${index}" title="Delete Task">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                `;
                todoList.appendChild(li);
            });
        }
    }

    addTodoButton.addEventListener('click', () => {
        const todoText = newTodoInput.value.trim();
        if (todoText) {
            if (!allTodos[selectedTodoDate]) {
                allTodos[selectedTodoDate] = [];
            }
            allTodos[selectedTodoDate].push({ text: todoText, completed: false });
            newTodoInput.value = '';
            saveTodos();
            renderTodosForSelectedDate();
            renderCalendar(); // Re-render calendar to show 'has-tasks' for the date
        }
    });

    todoList.addEventListener('click', (e) => {
        const target = e.target.closest('button'); // Use closest to handle icon clicks
        if (target) {
            const index = parseInt(target.dataset.index);
            const todosForCurrentDate = allTodos[selectedTodoDate];

            if (!todosForCurrentDate || isNaN(index) || index < 0 || index >= todosForCurrentDate.length) {
                return; // Invalid index or no todos
            }

            if (target.classList.contains('toggle-complete')) {
                todosForCurrentDate[index].completed = !todosForCurrentDate[index].completed;
            } else if (target.classList.contains('delete-task')) {
                todosForCurrentDate.splice(index, 1);
                // If no tasks left for the day, remove the date key from allTodos
                if (todosForCurrentDate.length === 0) {
                    delete allTodos[selectedTodoDate];
                }
            }
            saveTodos();
            renderTodosForSelectedDate();
            renderCalendar(); // Re-render calendar to update 'has-tasks' class
        }
    });

    prevMonthBtn.addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
        renderCalendar();
    });

    renderCalendar(); // Initial render for calendar and today's todos

    // --- Pomodoro Timer Logic (Remains largely the same, minor refactoring) ---
    const timerDisplay = document.getElementById('timer-display');
    const startTimerBtn = document.getElementById('start-timer');
    const pauseTimerBtn = document.getElementById('pause-timer');
    const resetTimerBtn = document.getElementById('reset-timer');
    const workDurationInput = document.getElementById('work-duration');
    const breakDurationInput = document.getElementById('break-duration');

    let timerInterval;
    let isTimerPaused = true;
    let timeLeftInSeconds;
    let isWorkSessionActive = true;
    let workDurationDefault = parseInt(workDurationInput.value) * 60;
    let breakDurationDefault = parseInt(breakDurationInput.value) * 60;

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }

    function updateTimerDisplay() {
        timerDisplay.textContent = formatTime(timeLeftInSeconds);
    }

    function startPomodoroTimer() {
        if (!isTimerPaused) return; // Prevent multiple intervals
        isTimerPaused = false;
        startTimerBtn.innerHTML = '<i class="fas fa-play"></i> Continue';
        timerInterval = setInterval(() => {
            if (timeLeftInSeconds > 0) {
                timeLeftInSeconds--;
                updateTimerDisplay();
            } else {
                clearInterval(timerInterval);
                const sessionType = isWorkSessionActive ? "Work" : "Break";
                // Play a simple sound notification (optional)
                // const audio = new Audio('path/to/your/sound.mp3');
                // audio.play();
                alert(`${sessionType} session complete! Time for a ${isWorkSessionActive ? 'break' : 'work'}!`);
                isWorkSessionActive = !isWorkSessionActive;
                timeLeftInSeconds = isWorkSessionActive ? workDurationDefault : breakDurationDefault;
                updateTimerDisplay();
                startPomodoroTimer(); // Auto-start next session
            }
        }, 1000);
    }

    function pausePomodoroTimer() {
        isTimerPaused = true;
        clearInterval(timerInterval);
        startTimerBtn.innerHTML = '<i class="fas fa-play"></i> Start'; // Change button back to 'Start' if it was 'Continue'
    }

    function resetPomodoroTimer() {
        pausePomodoroTimer();
        isWorkSessionActive = true;
        workDurationDefault = parseInt(workDurationInput.value) * 60;
        breakDurationDefault = parseInt(breakDurationInput.value) * 60;
        timeLeftInSeconds = workDurationDefault;
        updateTimerDisplay();
        startTimerBtn.innerHTML = '<i class="fas fa-play"></i> Start';
    }

    startTimerBtn.addEventListener('click', startPomodoroTimer);
    pauseTimerBtn.addEventListener('click', pausePomodoroTimer);
    resetTimerBtn.addEventListener('click', resetPomodoroTimer);

    workDurationInput.addEventListener('change', resetPomodoroTimer);
    breakDurationInput.addEventListener('change', resetPomodoroTimer);

    resetPomodoroTimer(); // Initialize timer display on load

    // --- Quiz Logic with Subjects and Levels ---
    const quizSubjectButtons = document.querySelectorAll('.subject-button');
    const quizSubjectSelection = document.getElementById('quiz-subject-selection'); // Added for clarity
    const quizLevelSelection = document.getElementById('quiz-level-selection');
    const quizArea = document.getElementById('quiz-area');
    const quizQuestionDisplay = document.getElementById('quiz-question');
    const quizOptionsContainer = document.getElementById('quiz-options');
    const submitAnswerButton = document.getElementById('submit-answer');
    const quizFeedbackDisplay = document.getElementById('quiz-feedback');
    const nextQuestionButton = document.getElementById('next-question');
    const restartQuizButton = document.getElementById('restart-quiz');
    const quizScoreDisplay = document.getElementById('quiz-score');
    const currentQuizInfoDisplay = document.getElementById('current-quiz-info');


    const allQuizData = {
        gk: {
            easy: [
                // Level 1 (5 questions)
                { q: "What is the capital of India?", o: ["Mumbai", "Delhi", "Kolkata", "Chennai"], a: "Delhi" },
                { q: "Which is the longest river in India?", o: ["Yamuna", "Godavari", "Ganga", "Brahmaputra"], a: "Ganga" },
                { q: "Who is known as the 'Father of the Indian Nation'?", o: ["Jawaharlal Nehru", "Sardar Patel", "Mahatma Gandhi", "Subhas Chandra Bose"], a: "Mahatma Gandhi" },
                { q: "How many states are there in India?", o: ["25", "28", "29", "30"], a: "28" },
                { q: "Which is the highest mountain peak in India?", o: ["Mount Everest", "K2", "Kangchenjunga", "Nanda Devi"], a: "Kangchenjunga" }
            ],
            medium: [
                // Level 1 (5 questions)
                { q: "When did India gain independence?", o: ["1942", "1945", "1947", "1950"], a: "1947" },
                { q: "The 'Quit India' movement was launched in which year?", o: ["1939", "1942", "1945", "1947"], a: "1942" },
                { q: "Which Indian state has the longest coastline?", o: ["Kerala", "Maharashtra", "Gujarat", "Andhra Pradesh"], a: "Gujarat" },
                { q: "The 'Golden Temple' is located in which city?", o: ["Delhi", "Varanasi", "Amritsar", "Jaipur"], a: "Amritsar" },
                { q: "Who wrote the Indian national anthem 'Jana Gana Mana'?", o: ["Bankim Chandra Chatterjee", "Rabindranath Tagore", "Muhammad Iqbal", "Sarojini Naidu"], a: "Rabindranath Tagore" }
            ],
            hard: [
                // Level 1 (5 questions)
                { q: "Which of the following fundamental rights is guaranteed even to non-citizens of India?", o: ["Right to equality", "Right to freedom of speech", "Right to life and personal liberty", "Right to reside and settle in any part of India"], a: "Right to life and personal liberty" },
                { q: "The 'Doctrine of Lapse' was introduced by which Governor-General of India?", o: ["Lord Dalhousie", "Lord William Bentinck", "Lord Curzon", "Lord Canning"], a: "Lord Dalhousie" },
                { q: "The term 'Blue Revolution' is related to the increase in production of:", o: ["Food grains", "Oilseeds", "Fish", "Milk"], a: "Fish" },
                { q: "Which schedule of the Indian Constitution deals with the distribution of powers between the Union and States?", o: ["Sixth Schedule", "Seventh Schedule", "Eighth Schedule", "Ninth Schedule"], a: "Seventh Schedule" },
                { q: "The 'Chola Empire' was famous for:", o: ["Its naval power", "Its land revenue system", "Its cavalry", "Its elephant army"], a: "Its naval power" }
            ]
        },
        aptitude: {
            easy: [
                // Level 1 (5 questions)
                { q: "What is 15% of 200?", o: ["15", "20", "30", "45"], a: "30" },
                { q: "If a dozen eggs cost ₹60, what is the cost of 4 eggs?", o: ["₹15", "₹20", "₹25", "₹30"], a: "₹20" },
                { q: "Complete the series: 2, 4, 6, 8, ?", o: ["9", "10", "11", "12"], a: "10" },
                { q: "A class has 20 boys and 30 girls. What percentage of the class are boys?", o: ["30%", "40%", "50%", "60%"], a: "40%" },
                { q: "If you buy an item for ₹50 and sell it for ₹70, what is your profit?", o: ["₹10", "₹15", "₹20", "₹25"], a: "₹20" }
            ],
            medium: [
                // Level 1 (5 questions)
                { q: "A sum of money doubles itself in 8 years at simple interest. In how many years will it triple itself?", o: ["12 years", "16 years", "24 years", "32 years"], a: "16 years" },
                { q: "The average age of 5 boys is 12 years. If the age of a new boy is included, the average becomes 13 years. What is the age of the new boy?", o: ["15 years", "16 years", "17 years", "18 years"], a: "18 years" },
                { q: "A train 120m long is running at a speed of 60 km/hr. It will cross a railway platform 130m long in:", o: ["10 sec", "15 sec", "20 sec", "25 sec"], a: "15 sec" },
                { q: "A, B, and C can complete a work in 10, 12, and 15 days respectively. If they work together, in how many days will the work be completed?", o: ["3 days", "4 days", "5 days", "6 days"], a: "4 days" },
                { q: "Find the missing number: 1, 8, 27, ?, 125", o: ["36", "49", "64", "81"], a: "64" }
            ],
            hard: [
                // Level 1 (5 questions)
                { q: "The population of a town increased by 10% in the first year, 20% in the second year, and 25% in the third year. What is the average annual rate of increase?", o: ["15%", "18%", "20%", "22%"], a: "18%" },
                { q: "Two pipes A and B can fill a tank in 20 minutes and 30 minutes respectively. If both pipes are opened simultaneously, after how much time should pipe B be closed so that the tank is full in 10 minutes?", o: ["5 min", "8 min", "10 min", "12 min"], a: "10 min" },
                { q: "A sum of money at compound interest doubles itself in 4 years. In how many years will it become 8 times of itself?", o: ["8 years", "12 years", "16 years", "20 years"], a: "12 years" },
                { q: "A dishonest shopkeeper sells goods at cost price but uses a weight of 900gm instead of 1kg. What is his profit percentage?", o: ["9%", "10%", "11.11%", "12.5%"], a: "11.11%" },
                { q: "In what ratio must water be mixed with milk to gain 20% by selling the mixture at cost price?", o: ["1:4", "1:5", "1:6", "1:8"], a: "1:5" }
            ]
        },
        memory: {
            easy: [
                // Level 1 (5 questions)
                { q: "Remember the sequence: Red, Blue, Green. What was the second color?", o: ["Red", "Blue", "Green", "Yellow"], a: "Blue" },
                { q: "Look at these numbers for 5 seconds: 3, 7, 1, 9. What was the first number?", o: ["1", "3", "7", "9"], a: "3", delay: 5000 },
                { q: "A list of fruits: Apple, Banana, Orange. Which fruit was not in the list?", o: ["Apple", "Grape", "Banana", "Orange"], a: "Grape" },
                { q: "Recall the sequence: Star, Circle, Square. What was the last shape?", o: ["Star", "Circle", "Square", "Triangle"], a: "Square" },
                { q: "Memorize: Dog, Cat, Bird. Which animal was mentioned?", o: ["Fish", "Dog", "Rabbit", "Mouse"], a: "Dog" }
            ],
            medium: [
                // Level 1 (5 questions)
                { q: "Remember this sequence: Lion, Tiger, Elephant, Bear. What was the third animal?", o: ["Lion", "Tiger", "Elephant", "Bear"], a: "Elephant" },
                { q: "Look at these words for 7 seconds: Table, Chair, Lamp, Book, Pen. Which word was 'Lamp'?", o: ["1st", "2nd", "3rd", "4th"], a: "3rd", delay: 7000 },
                { q: "A list of cities: London, Paris, Tokyo, New York. Was 'Rome' on the list?", o: ["Yes", "No"], a: "No" },
                { q: "Recall this sentence: 'The quick brown fox jumps over the lazy dog.' What was the second word?", o: ["quick", "brown", "fox", "jumps"], a: "quick" },
                { q: "Memorize these colors: Purple, Orange, Black, White. Which color was directly after Orange?", o: ["Purple", "Black", "White", "Yellow"], a: "Black" }
            ],
            hard: [
                // Level 1 (5 questions)
                { q: "Remember the sequence: Alpha, Bravo, Charlie, Delta, Echo. What was the fourth word?", o: ["Alpha", "Bravo", "Charlie", "Delta"], a: "Delta" },
                { q: "Examine these objects for 10 seconds: Key, Wallet, Phone, Glasses, Watch, Earbuds. Which object was third from the end?", o: ["Key", "Glasses", "Watch", "Phone"], a: "Glasses", delay: 10000 },
                { q: "A sequence of numbers: 12, 34, 56, 78, 90. What was the sum of the second and fourth numbers?", o: ["102", "112", "124", "134"], a: "112" },
                { q: "Recall the names: Rahul, Priya, Amit, Seema, Vikas. Who was between Amit and Vikas?", o: ["Rahul", "Priya", "Seema", "No one"], a: "Seema" },
                { q: "Memorize this short phrase: 'Knowledge is power.' How many words are there?", o: ["2", "3", "4", "5"], a: "3" }
            ]
        }
    };

    let currentSubject = null;
    let currentLevel = null;
    let currentQuizQuestions = []; // Stores the 5 questions for the current level
    let currentQuestionIndex = 0;
    let quizScore = 0;
    let currentSelectedOption = null;
    let quizDelayTimeout = null; // For memory questions with delay

    // Helper to shuffle an array (Fisher-Yates)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function showQuizScreen(screenId) {
        // Hide all quiz-related sub-sections first
        document.getElementById('quiz-subject-selection').style.display = 'none';
        document.getElementById('quiz-level-selection').style.display = 'none';
        document.getElementById('quiz-area').style.display = 'none';

        // Then display the requested screen
        if (screenId === 'subject') {
            document.getElementById('quiz-subject-selection').style.display = 'block';
        } else if (screenId === 'level') {
            document.getElementById('quiz-level-selection').style.display = 'block';
        } else if (screenId === 'quiz') {
            document.getElementById('quiz-area').style.display = 'block';
        }
    }

    function generateLevelButtons() {
        const quizLevelSelection = document.getElementById('quiz-level-selection'); // Re-get for scope
        quizLevelSelection.innerHTML = '<h3>Select Level:</h3>';
        // Check if currentSubject has levels defined
        if (allQuizData[currentSubject]) {
            const levels = Object.keys(allQuizData[currentSubject]);
            levels.forEach(level => {
                const button = document.createElement('button');
                button.classList.add('level-button');
                button.dataset.level = level;
                button.textContent = `Level: ${level.charAt(0).toUpperCase() + level.slice(1)}`;
                button.addEventListener('click', () => {
                    quizLevelSelection.querySelectorAll('.level-button').forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    currentLevel = level;
                    startQuiz();
                });
                quizLevelSelection.appendChild(button);
            });
        } else {
            quizLevelSelection.innerHTML += '<p style="color: #78909C; font-style: italic;">No levels available for this subject yet.</p>';
        }
    }

    function startQuiz() {
        // Get questions for the selected subject and level
        const availableQuestions = allQuizData[currentSubject][currentLevel];

        // Ensure we have at least 5 questions for a level
        if (!availableQuestions || availableQuestions.length < 5) {
            console.error(`Not enough questions for ${currentSubject} - ${currentLevel}`);
            alert(`Not enough questions available for this level yet. Please choose another subject or level.`);
            showQuizScreen('level'); // Go back to level selection
            return;
        }

        // Randomly pick 5 questions for this level
        const shuffledAvailable = [...availableQuestions];
        shuffleArray(shuffledAvailable);
        currentQuizQuestions = shuffledAvailable.slice(0, 5); // Take the first 5

        currentQuestionIndex = 0;
        quizScore = 0;
        showQuizScreen('quiz');
        loadQuizQuestion();
    }

    function loadQuizQuestion() {
        // Clear any previous memory delay timers
        if (quizDelayTimeout) {
            clearTimeout(quizDelayTimeout);
            quizDelayTimeout = null;
        }

        const q = currentQuizQuestions[currentQuestionIndex];
        quizQuestionDisplay.textContent = q.q; // Use 'q' for question text
        quizOptionsContainer.innerHTML = '';
        quizFeedbackDisplay.textContent = '';
        quizFeedbackDisplay.className = ''; // Clear previous classes
        submitAnswerButton.style.display = 'block';
        nextQuestionButton.style.display = 'none';
        restartQuizButton.style.display = 'none';
        quizScoreDisplay.style.display = 'none';

        currentQuizInfoDisplay.textContent = `Subject: ${currentSubject.toUpperCase()} | Level: ${currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1)} - Q ${currentQuestionIndex + 1}/${currentQuizQuestions.length}`;

        // For memory questions with a 'delay' property
        if (q.delay && currentSubject === 'memory') {
            // Temporarily hide options and disable submit
            quizOptionsContainer.style.pointerEvents = 'none';
            submitAnswerButton.disabled = true;

            quizQuestionDisplay.textContent = `Memorize this for ${q.delay / 1000} seconds: ${q.q}`;
            quizOptionsContainer.innerHTML = ''; // Clear options during memorize phase

            quizDelayTimeout = setTimeout(() => {
                quizQuestionDisplay.textContent = q.q; // Restore original question text
                renderOptions(q.o); // Render options after delay
                quizOptionsContainer.style.pointerEvents = 'auto'; // Re-enable options
                submitAnswerButton.disabled = false;
            }, q.delay);
        } else {
            renderOptions(q.o);
        }

        currentSelectedOption = null;
    }

    function renderOptions(options) {
        const shuffledOptions = [...options];
        shuffleArray(shuffledOptions); // Shuffle options for each question

        shuffledOptions.forEach(option => {
            const optionDiv = document.createElement('div');
            optionDiv.classList.add('quiz-option');
            optionDiv.textContent = option;
            optionDiv.addEventListener('click', () => {
                const prevSelected = document.querySelector('.quiz-option.selected');
                if (prevSelected) {
                    prevSelected.classList.remove('selected');
                }
                optionDiv.classList.add('selected');
                currentSelectedOption = option;
            });
            quizOptionsContainer.appendChild(optionDiv);
        });
    }

    function checkQuizAnswer() {
        if (currentSelectedOption === null) {
            quizFeedbackDisplay.textContent = "Please select an answer.";
            quizFeedbackDisplay.classList.add('incorrect');
            return;
        }

        const q = currentQuizQuestions[currentQuestionIndex];
        const allOptionDivs = quizOptionsContainer.querySelectorAll('.quiz-option');

        allOptionDivs.forEach(optionDiv => {
            optionDiv.style.pointerEvents = 'none'; // Disable clicks after submission
            if (optionDiv.textContent === q.a) { // Use 'a' for answer
                optionDiv.classList.add('correct');
            } else if (optionDiv.textContent === currentSelectedOption) {
                optionDiv.classList.add('incorrect');
            }
        });

        if (currentSelectedOption === q.a) {
            quizScore++;
            quizFeedbackDisplay.textContent = "Correct! Well done.";
            quizFeedbackDisplay.classList.add('correct');
        } else {
            quizFeedbackDisplay.textContent = `Incorrect. The correct answer was: "${q.a}"`;
            quizFeedbackDisplay.classList.add('incorrect');
        }

        submitAnswerButton.style.display = 'none';
        if (currentQuestionIndex < currentQuizQuestions.length - 1) {
            nextQuestionButton.style.display = 'block';
        } else {
            // End of quiz for this level
            restartQuizButton.textContent = "Restart Quiz / Choose New";
            restartQuizButton.style.display = 'block';
            quizScoreDisplay.textContent = `Quiz finished! You scored ${quizScore} out of ${currentQuizQuestions.length}!`;
            quizScoreDisplay.style.display = 'block';
        }
    }

    function goToNextQuizQuestion() {
        currentQuestionIndex++;
        if (currentQuestionIndex < currentQuizQuestions.length) {
            loadQuizQuestion();
        }
    }

    function restartCurrentQuiz() {
        // Clear any active/selected states from previous quiz
        quizScoreDisplay.style.display = 'none';
        quizFeedbackDisplay.textContent = '';
        currentSelectedOption = null;
        currentSubject = null;
        currentLevel = null;
        currentQuizQuestions = [];

        // Clear active classes from buttons
        quizSubjectButtons.forEach(btn => btn.classList.remove('active'));
        // Make sure quizLevelSelection has content before trying to querySelectAll
        if (quizLevelSelection) { // Add this check
            quizLevelSelection.querySelectorAll('.level-button').forEach(btn => btn.classList.remove('active'));
        }

        // Go back to subject selection
        showQuizScreen('subject');
    }

    // Event Listeners for Subject Selection
    quizSubjectButtons.forEach(button => {
        button.addEventListener('click', () => {
            quizSubjectButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentSubject = button.dataset.subject;
            generateLevelButtons(); // Generate level buttons based on selected subject
            showQuizScreen('level');
        });
    });

    submitAnswerButton.addEventListener('click', checkQuizAnswer);
    nextQuestionButton.addEventListener('click', goToNextQuizQuestion);
    restartQuizButton.addEventListener('click', restartCurrentQuiz);

    // Initial state for quiz: show subject selection. This is handled by the nav logic.
