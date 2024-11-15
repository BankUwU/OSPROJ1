function displayComparisonChart() {
  // Algorithms
  const algorithms = ['FCFS', 'RR', 'SJF', 'SRTF', 'Priority', 'HRRN', 'MLQF'];

  // Get the latest data from the scheduling algorithms
  const fcfsResults = FCFS([...processes]);
  const rrResults = RR([...processes], timeQuantum);
  const sjfResults = SJF([...processes]);
  const srtfResults = SRTF([...processes]);
  const priorityResults = PriorityScheduling([...processes]);
  const hrrnResults = HRRN([...processes]);
  const mlqfResults = MLQF([...processes]);

  // Populate the algorithmData object
  const algorithmData = {
    FCFS: {
      waitingTime: fcfsResults.averages.waiting,
      turnaroundTime: fcfsResults.averages.turnaround
    },
    RR: {
      waitingTime: rrResults.averages.waiting,
      turnaroundTime: rrResults.averages.turnaround
    },
    SJF: {
      waitingTime: sjfResults.averages.waiting,
      turnaroundTime: sjfResults.averages.turnaround
    },
    SRTF: {
      waitingTime: srtfResults.averages.waiting,
      turnaroundTime: srtfResults.averages.turnaround
    },
    Priority: {
      waitingTime: priorityResults.averages.waiting,
      turnaroundTime: priorityResults.averages.turnaround
    },
    HRRN: {
      waitingTime: hrrnResults.averages.waiting,
      turnaroundTime: hrrnResults.averages.turnaround
    },
    MLQF: {
      waitingTime: mlqfResults.averages.waiting,
      turnaroundTime: mlqfResults.averages.turnaround
    }
  };

  // Generate the chart
  const ctx = document.getElementById('comparisonChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: algorithms,
      datasets: [
        {
          label: 'Average Waiting Time',
          data: algorithms.map(algo => algorithmData[algo].waitingTime),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        },
        {
          label: 'Average Turnaround Time',
          data: algorithms.map(algo => algorithmData[algo].turnaroundTime),
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1
        },
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
