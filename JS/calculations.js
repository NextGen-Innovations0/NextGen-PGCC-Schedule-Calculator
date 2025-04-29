// PGCC Credit Hour Calculator
document.addEventListener('DOMContentLoaded', function() {
    // Instructional methods and their corresponding values [direct_instruction, out_of_class]
    const instructionalMethods = {
        "lecture-ratio-1_2": [12.5, 25],
        "lab-standard-ratio-2_1": [25, 12.5],
        "lab-ratio-3_1": [37.5, 12.5],
        "studio-ratio-2_1": [25, 12.5],
        "clinical-ratio-3_0": [37.5, 0],
        "clinical-ratio-4_0": [50, 0],
        "practicum-externship-ratio-3_0": [37.5, 0],
        "fieldwork-ratio-3_0": [37.5, 0],
        "internship-ratio-3_0": [0.67, 50],
        "private-lesson-ratio-1_1": [12.5, 12.5],
        "recitation-ratio-1_2": [12.5, 25]
    };

    const form = document.querySelector('.calculator-form');
    const resultsTextarea = document.getElementById('schedule-output');
    const resetButton = document.getElementById('reset-button');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        calculateTotals();
    });

    resetButton.addEventListener('click', function() {
        clearResults();
    });

    function calculateTotals() {
        resultsTextarea.value = ''; // Clear previous results

        let totalDirectInstructionTime = 0;
        let totalOutOfClassStudentWork = 0;
        let totalCombinedInstructionalTime = 0;

        const duration = parseInt(document.getElementById('class-duration').value.split(' ')[0]);
        const meetingsPerWeek = parseInt(document.getElementById('meetings-per-week').value);
        const startTimeInput = document.getElementById('start-time').value;

        if (!startTimeInput) {
            resultsTextarea.value = "⚠️ Please enter a start time.";
            return;
        }

        // Parse start time (HH:MM)
        const [startHours, startMinutes] = startTimeInput.split(':').map(Number);
        let startTime = new Date();
        startTime.setHours(startHours, startMinutes, 0, 0);

        // Add header
        resultsTextarea.value += "📃 INSTRUCTIONAL METHODS CALCULATION\n\n";

        // Process each instructional method
        for (const [methodId, values] of Object.entries(instructionalMethods)) {
            const inputElement = document.getElementById(methodId);
            const credits = parseFloat(inputElement.value) || 0;

            if (credits === 0) continue; // Skip if credits are zero

            const directInstructionTime = credits * values[0];
            const outOfClassStudentWork = credits * values[1];
            const combinedInstructionalTime = directInstructionTime + outOfClassStudentWork;

            totalDirectInstructionTime += directInstructionTime;
            totalOutOfClassStudentWork += outOfClassStudentWork;
            totalCombinedInstructionalTime += combinedInstructionalTime;

            let dailyDuration = calculateDailyDuration(directInstructionTime, duration, meetingsPerWeek);
            const originalDuration = dailyDuration; // Store before adding breaks

            // Add breaks based on ORIGINAL duration
            if (originalDuration >= 2 && originalDuration < 4) {
                dailyDuration += 0.25;
            } else if (originalDuration >= 2 && originalDuration < 6) {
                dailyDuration += 0.5;
            } else if (originalDuration >= 6) {
                dailyDuration += 1.0;
            }

            const breakNeeded = originalDuration > 2 ? "✓ YES" : "✗ NO";

            const directInstructionTimeStr = formatTimeString(directInstructionTime);
            const outOfClassStudentWorkStr = formatTimeString(outOfClassStudentWork);
            const combinedInstructionalTimeStr = formatTimeString(combinedInstructionalTime);
            const dailyDurationStr = formatTimeString(dailyDuration);

            // Get the display name for the method
            const label = document.querySelector(`label[for="${methodId}"]`).textContent;

            resultsTextarea.value += `→ ${label}\n`;
            resultsTextarea.value += `   ├─ Credits: ${credits}\n`;
            resultsTextarea.value += `   ├─ Direct: ${directInstructionTimeStr}\n`;
            resultsTextarea.value += `   ├─ Out-of-Class: ${outOfClassStudentWorkStr}\n`;
            resultsTextarea.value += `   ├─ Combined: ${combinedInstructionalTimeStr}\n`;
            resultsTextarea.value += `   ├─ Daily: ${formatTimeString(originalDuration)}\n`;
            resultsTextarea.value += `   └─ Break Needed: ${breakNeeded}\n\n`;
        }

        if (totalDirectInstructionTime > 0 || totalOutOfClassStudentWork > 0) {
            let totalDailyDuration = calculateDailyDuration(totalDirectInstructionTime, duration, meetingsPerWeek);
            const originalTotalDuration = totalDailyDuration; // Store before breaks

            // Add breaks to total duration
            if (originalTotalDuration >= 2 && originalTotalDuration < 4) {
                totalDailyDuration += 0.25;
            } else if (originalTotalDuration >= 2 && originalTotalDuration < 6) {
                totalDailyDuration += 0.5;
            } else if (originalTotalDuration >= 6) {
                totalDailyDuration += 1.0;
            }

            const totalBreakNeeded = originalTotalDuration > 2 ? "✓ YES" : "✗ NO";

            // Calculate total credits
            let totalCredits = 0;
            for (const methodId in instructionalMethods) {
                totalCredits += parseFloat(document.getElementById(methodId).value) || 0;
            }

            resultsTextarea.value += "★ SUMMARY\n";
            resultsTextarea.value += `   ├─ Total Credits: ${totalCredits}\n`;
            resultsTextarea.value += `   ├─ Total Direct: ${formatTimeString(totalDirectInstructionTime)}\n`;
            resultsTextarea.value += `   ├─ Total Out-of-Class: ${formatTimeString(totalOutOfClassStudentWork)}\n`;
            resultsTextarea.value += `   ├─ Total Combined: ${formatTimeString(totalCombinedInstructionalTime)}\n`;
            resultsTextarea.value += `   ├─ Total Daily (no breaks): ${formatTimeString(originalTotalDuration)}\n`;
            resultsTextarea.value += `   ├─ Total Daily (with breaks): ${formatTimeString(totalDailyDuration)}\n`;
            resultsTextarea.value += `   └─ Break Needed: ${totalBreakNeeded}\n\n`;

            // Calculate end time
            const endTime = new Date(startTime.getTime() + totalDailyDuration * 60 * 60 * 1000);
            resultsTextarea.value += "⏱ CLASS TIMES\n";
            resultsTextarea.value += `   ├─ Start Time: ${formatTimeForDisplay(startTime)}\n`;
            resultsTextarea.value += `   └─ End Time: ${formatTimeForDisplay(endTime)}\n\n`;
        }
    }

    function calculateDailyDuration(totalDuration, classDuration, meetingsPerWeek) {
        return (totalDuration / meetingsPerWeek) / classDuration;
    }

    function clearResults() {
        resultsTextarea.value = '';
        for (const methodId in instructionalMethods) {
            document.getElementById(methodId).value = '';
        }
        document.getElementById('class-duration').selectedIndex = 0;
        document.getElementById('meetings-per-week').selectedIndex = 0;
        document.getElementById('start-time').value = '';
    }

    function formatTimeString(hours) {
        const minutes = Math.round(hours * 60);
        return `${hours.toFixed(2)} hours (${minutes} minutes)`;
    }

    function formatTimeForDisplay(date) {
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const minutesStr = minutes < 10 ? '0' + minutes : minutes;
        return `${hours}:${minutesStr} ${ampm}`;
    }
});

// Help System
document.addEventListener('DOMContentLoaded', function() {
    const helpButton = document.getElementById('help-button');
    const helpModal = document.getElementById('help-modal');
    const closeHelp = document.getElementById('close-help');

    helpButton?.addEventListener('click', () => helpModal.style.display = 'block');
    closeHelp?.addEventListener('click', () => helpModal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target === helpModal) helpModal.style.display = 'none';
    });
});

// Scroll Functionality
document.getElementById('calculate-button')?.addEventListener('click', function() {
    if (document.getElementById('start-time').value.trim()) {
        setTimeout(() => {
            document.getElementById('results-header')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }
});

document.getElementById('reset-button')?.addEventListener('click', () => {
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
});

/* Credits: Program Calculations functionalities and code development were implemented by Orle Guerrero with assistance from DeepSeek Chat (https://chat.deepseek.com)
*/