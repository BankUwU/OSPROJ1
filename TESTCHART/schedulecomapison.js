Algorithms// Example of dynamically calculated data for each algorithm
const algorithmData = {
    FCFS: { waitingTime: 2.0, turnaroundTime: 8.5, responseTime: 2.0 },
    RR: { waitingTime: 3.0, turnaroundTime: 9.5, responseTime: 3.0 },
    SJF: { waitingTime: 1.5, turnaroundTime: 7.5, responseTime: 1.5 },
    Priority: { waitingTime: 2.3, turnaroundTime: 8.0, responseTime: 2.3 },
    SRTF: { waitingTime: 1.8, turnaroundTime: 7.0, responseTime: 1.8 },
    HRRN: { waitingTime: 2.2, turnaroundTime: 8.2, responseTime: 2.2 },
    MLQF: { waitingTime: 3.2, turnaroundTime: 9.0, responseTime: 3.2 }
};

function displayComparisonChart() {
    // Algorithms
    const algorithms = Object.keys(algorithmData);

    // Extract the values for each metric from the algorithmData object
    const avgWaitingTimes = algorithms.map(algo => algorithmData[algo].waitingTime);
    const avgTurnaroundTimes = algorithms.map(algo => algorithmData[algo].turnaroundTime);
    const avgResponseTimes = algorithms.map(algo => algorithmData[algo].responseTime);

    // Generate the chart
    const ctx = document.getElementById('comparisonChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: algorithms,
            datasets: [
                {
                    label: 'Average Waiting Time',
                    data: avgWaitingTimes,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Average Turnaround Time',
                    data: avgTurnaroundTimes,
                    backgroundColor: 'rgba(153, 102, 255, 0.6)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Average Response Time',
                    data: avgResponseTimes,
                    backgroundColor: 'rgba(255, 159, 64, 0.6)',
                    borderColor: 'rgba(255, 159, 64, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Comparison of Average Times by Algorithm'
                }
            }
        }
    });
}

// Call the function to display the chart
displayComparisonChart();
