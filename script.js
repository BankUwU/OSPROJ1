const processes = [];
const timeQuantum = 2;

function updateDeleteSelect() {
  const select = document.getElementById("processToDelete");
  select.innerHTML =
    '<option value="">Select process to delete</option>' +
    processes.map((p) => `<option value="${p.id}">${p.id}</option>`).join("");
}

function deleteProcess() {
  const selectedId = document.getElementById("processToDelete").value;
  if (selectedId) {
    const index = processes.findIndex((p) => p.id === selectedId);
    if (index !== -1) {
      processes.splice(index, 1);
      updateProcessTable();
      updateDeleteSelect();
    }
  }
}

function addProcess() {
  const processId = document.getElementById("processId").value;
  const arrivalTime = parseInt(document.getElementById("arrivalTime").value);
  const burstTime = parseInt(document.getElementById("burstTime").value);
  const priority = parseInt(document.getElementById("priority").value);

  if (
    processId &&
    !isNaN(arrivalTime) &&
    arrivalTime >= 0 &&
    !isNaN(burstTime) &&
    burstTime > 0 &&
    !isNaN(priority) &&
    priority > 0
  ) {
    processes.push({
      id: processId,
      arrivalTime,
      burstTime,
      priority,
      remainingTime: burstTime,
    });
    updateProcessTable();
    updateDeleteSelect();
    clearInputs();
  } else {
    alert("Please enter valid values (no negative values allowed).");
  }
}

function clearInputs() {
  document.getElementById("processId").value = "";
  document.getElementById("arrivalTime").value = "";
  document.getElementById("burstTime").value = "";
  document.getElementById("priority").value = "";
}

function updateProcessTable() {
  const tbody = document.querySelector("#processTable tbody");
  tbody.innerHTML = processes
    .map(
      (p) => `
          <tr>
            <td>${p.id}</td>
            <td>${p.arrivalTime}</td>
            <td>${p.burstTime}</td>
            <td>${p.priority}</td>
          </tr>
        `
    )
    .join("");
}

function generateSingleProcess() {
  const processNumber = processes.length + 1;
  processes.push({
    id: `P${processNumber}`,
    arrivalTime: Math.floor(Math.random() * 10),
    burstTime: Math.floor(Math.random() * 10) + 1,
    priority: Math.floor(Math.random() * 5) + 1,
  });
  updateProcessTable();
  updateDeleteSelect();
}

function reset() {
  processes.length = 0;
  updateProcessTable();
  updateDeleteSelect();
  document.querySelector("#resultsTable tbody").innerHTML = "";
  document.getElementById("averageTimes").innerHTML = "";
}

// Call runSimulation to test the function after ensuring processes are properly added
function runSimulation() {
  if (processes.length === 0) return;
  console.log(processes);

  const fcfsResults = FCFS([...processes]);
  const rrResults = RR(processes.map((p) => ({ ...p }))); // Deep copy for RR
  const sjfResults = SJF(processes.map((p) => ({ ...p }))); // Deep copy for SJF
  const srtfResults = SRTF(processes.map((p) => ({ ...p })));
  const priorityResults = PriorityScheduling(processes.map((p) => ({ ...p })));
  const hrrnResults = HRRN(processes.map((p) => ({ ...p }))); // Added HRRN
  const mlqfResults = MLQF(processes.map((p) => ({ ...p })));

  displayResults(
    fcfsResults,
    rrResults,
    sjfResults,
    srtfResults,
    priorityResults,
    hrrnResults,
    mlqfResults
  );
}

// FCFS Scheduling
function FCFS(processList) {
  const processes = [...processList].sort(
    (a, b) => a.arrivalTime - b.arrivalTime
  );
  const timeline = [];
  let currentTime = 0;

  processes.forEach((process) => {
    // Skip idle time if needed
    if (currentTime < process.arrivalTime) {
      currentTime = process.arrivalTime;
    }

    // Add process execution to timeline
    timeline.push({
      processId: process.id,
      startTime: currentTime,
      duration: process.burstTime,
      endTime: currentTime + process.burstTime,
    });

    currentTime += process.burstTime;

    // Calculate times for this process
    process.completionTime = currentTime;
    process.turnaroundTime = process.completionTime - process.arrivalTime;
    process.waitingTime = process.turnaroundTime - process.burstTime;
  });

  // Calculate averages
  const avgWaitingTime =
    processes.reduce((sum, p) => sum + p.waitingTime, 0) / processes.length;
  const avgTurnaroundTime =
    processes.reduce((sum, p) => sum + p.turnaroundTime, 0) / processes.length;

  return {
    results: processes,
    timeline: timeline,
    averages: {
      waiting: avgWaitingTime,
      turnaround: avgTurnaroundTime,
    },
  };
}

// RR Scheduling
function RR(processList) {
  const processes = processList
    .map((p) => ({
      ...p,
      remainingTime: p.burstTime,
    }))
    .sort((a, b) => a.arrivalTime - b.arrivalTime);

  const timeline = [];
  const completed = [];
  let currentTime = 0;
  let readyQueue = [];

  while (processes.some((p) => p.remainingTime > 0)) {
    // Add newly arrived processes to ready queue
    const newArrivals = processes.filter(
      (p) =>
        p.arrivalTime <= currentTime &&
        p.remainingTime > 0 &&
        !readyQueue.includes(p)
    );
    readyQueue.push(...newArrivals);

    if (readyQueue.length === 0) {
      // No process ready, advance time to next arrival
      const nextArrival = processes.find(
        (p) => p.arrivalTime > currentTime && p.remainingTime > 0
      );
      if (nextArrival) {
        currentTime = nextArrival.arrivalTime;
        continue;
      }
      break;
    }

    // Get next process from queue
    const currentProcess = readyQueue.shift();
    const quantum = Math.min(timeQuantum, currentProcess.remainingTime);

    // Add to timeline
    timeline.push({
      processId: currentProcess.id,
      startTime: currentTime,
      duration: quantum,
      endTime: currentTime + quantum,
    });

    currentTime += quantum;
    currentProcess.remainingTime -= quantum;

    // Check if process is complete
    if (currentProcess.remainingTime <= 0) {
      currentProcess.completionTime = currentTime;
      currentProcess.turnaroundTime =
        currentProcess.completionTime - currentProcess.arrivalTime;
      currentProcess.waitingTime =
        currentProcess.turnaroundTime - currentProcess.burstTime;
      completed.push(currentProcess);
    } else {
      // Process still needs more time, add back to queue
      readyQueue.push(currentProcess);
    }
  }

  // Calculate averages
  const avgWaitingTime =
    completed.reduce((sum, p) => sum + p.waitingTime, 0) / completed.length;
  const avgTurnaroundTime =
    completed.reduce((sum, p) => sum + p.turnaroundTime, 0) / completed.length;

  return {
    results: completed.sort((a, b) => a.id.localeCompare(b.id)),
    timeline: timeline,
    averages: {
      waiting: avgWaitingTime,
      turnaround: avgTurnaroundTime,
    },
  };
}

//SJF scheduling
function SJF(processList) {
  const processes = [...processList].sort(
    (a, b) => a.arrivalTime - b.arrivalTime || a.burstTime - b.burstTime
  );
  const timeline = [];
  let currentTime = 0;
  const completed = [];

  while (processes.length > 0) {
    // Filter processes that have arrived by the current time and not completed
    const availableProcesses = processes.filter(
      (p) => p.arrivalTime <= currentTime
    );

    if (availableProcesses.length > 0) {
      // Choose the process with the shortest burst time
      availableProcesses.sort((a, b) => a.burstTime - b.burstTime);
      const currentProcess = availableProcesses[0];

      // Remove the process from the array to mark it as completed
      processes.splice(processes.indexOf(currentProcess), 1);

      // Add to timeline and calculate times
      timeline.push({
        processId: currentProcess.id,
        startTime: currentTime,
        duration: currentProcess.burstTime,
        endTime: currentTime + currentProcess.burstTime,
      });

      currentTime += currentProcess.burstTime;

      currentProcess.completionTime = currentTime;
      currentProcess.turnaroundTime =
        currentProcess.completionTime - currentProcess.arrivalTime;
      currentProcess.waitingTime =
        currentProcess.turnaroundTime - currentProcess.burstTime;

      completed.push(currentProcess);
    } else {
      // Advance time if no processes have arrived
      currentTime++;
    }
  }

  // Calculate averages
  const avgWaitingTime =
    completed.reduce((sum, p) => sum + p.waitingTime, 0) / completed.length;
  const avgTurnaroundTime =
    completed.reduce((sum, p) => sum + p.turnaroundTime, 0) / completed.length;

  return {
    results: completed,
    timeline: timeline,
    averages: {
      waiting: avgWaitingTime,
      turnaround: avgTurnaroundTime,
    },
  };
}

//SRTF scheduling
function SRTF(processList) {
  const processes = processList.map((p) => ({
    ...p,
    remainingTime: p.burstTime,
  }));
  const timeline = [];
  let currentTime = 0;
  const completed = [];

  while (completed.length < processList.length) {
    const availableProcesses = processes.filter(
      (p) => p.arrivalTime <= currentTime && p.remainingTime > 0
    );

    if (availableProcesses.length > 0) {
      availableProcesses.sort((a, b) => a.remainingTime - b.remainingTime);
      const currentProcess = availableProcesses[0];

      timeline.push({
        processId: currentProcess.id,
        startTime: currentTime,
        duration: 1,
        endTime: currentTime + 1,
      });

      currentProcess.remainingTime -= 1;
      currentTime += 1;

      if (currentProcess.remainingTime === 0) {
        currentProcess.completionTime = currentTime;
        currentProcess.turnaroundTime =
          currentProcess.completionTime - currentProcess.arrivalTime;
        currentProcess.waitingTime =
          currentProcess.turnaroundTime - currentProcess.burstTime;
        completed.push(currentProcess);
      }
    } else {
      currentTime++;
    }
  }

  const avgWaitingTime =
    completed.reduce((sum, p) => sum + p.waitingTime, 0) / completed.length;
  const avgTurnaroundTime =
    completed.reduce((sum, p) => sum + p.turnaroundTime, 0) / completed.length;

  return {
    results: completed,
    timeline: timeline,
    averages: {
      waiting: avgWaitingTime,
      turnaround: avgTurnaroundTime,
    },
  };
}

//Priority scheduling
function PriorityScheduling(processList) {
  // Sort by arrival time, then by priority (ascending for priority)
  const processes = [...processList].sort(
    (a, b) => a.arrivalTime - b.arrivalTime || a.priority - b.priority
  );

  let currentTime = 0;
  const timeline = [];
  const completedProcesses = [];

  while (processes.length > 0) {
    // Find the next available process with the highest priority (lowest priority value)
    const availableProcesses = processes.filter(
      (p) => p.arrivalTime <= currentTime
    );

    let currentProcess;
    if (availableProcesses.length > 0) {
      // Sort available processes by priority (ascending) and pick the one with the lowest priority
      currentProcess = availableProcesses.sort(
        (a, b) => a.priority - b.priority
      )[0];
    } else {
      // No available processes, so move currentTime to the next process arrival
      currentProcess = processes[0];
      currentTime = currentProcess.arrivalTime;
    }

    // Remove the selected process from the list
    processes.splice(processes.indexOf(currentProcess), 1);

    // Record process execution in the timeline
    timeline.push({
      processId: currentProcess.id,
      startTime: currentTime,
      duration: currentProcess.burstTime,
      endTime: currentTime + currentProcess.burstTime,
    });

    // Calculate timing metrics
    currentProcess.completionTime = currentTime + currentProcess.burstTime;
    currentProcess.turnaroundTime =
      currentProcess.completionTime - currentProcess.arrivalTime;
    currentProcess.waitingTime =
      currentProcess.turnaroundTime - currentProcess.burstTime;

    // Update current time
    currentTime += currentProcess.burstTime;

    // Add the completed process to the list
    completedProcesses.push(currentProcess);
  }

  // Calculate average waiting and turnaround times
  const avgWaitingTime =
    completedProcesses.reduce((sum, p) => sum + p.waitingTime, 0) /
    completedProcesses.length;
  const avgTurnaroundTime =
    completedProcesses.reduce((sum, p) => sum + p.turnaroundTime, 0) /
    completedProcesses.length;

  return {
    results: completedProcesses,
    timeline: timeline,
    averages: {
      waiting: avgWaitingTime,
      turnaround: avgTurnaroundTime,
    },
  };
}

function HRRN(processList) {
  const processes = processList.map((p) => ({ ...p }));
  let currentTime = 0;
  const completedProcesses = [];
  const timeline = [];

  while (completedProcesses.length < processes.length) {
    // Find processes that have arrived by the current time and are not completed
    const availableProcesses = processes.filter(
      (p) => p.arrivalTime <= currentTime && !p.completed
    );

    // If no process is available, increment the currentTime and continue
    if (availableProcesses.length === 0) {
      currentTime++;
      continue;
    }

    // Calculate response ratio for each available process
    availableProcesses.forEach((p) => {
      p.responseRatio =
        (currentTime - p.arrivalTime + p.burstTime) / p.burstTime;
    });

    // Sort by response ratio in descending order
    availableProcesses.sort((a, b) => b.responseRatio - a.responseRatio);

    const currentProcess = availableProcesses[0]; // Select the process with the highest response ratio

    // Update timeline for Gantt chart
    timeline.push({
      processId: currentProcess.id,
      startTime: currentTime,
      duration: currentProcess.burstTime,
      endTime: currentTime + currentProcess.burstTime,
    });

    // Update process completion and turnaround/waiting times
    currentTime += currentProcess.burstTime;
    currentProcess.completionTime = currentTime;
    currentProcess.turnaroundTime =
      currentProcess.completionTime - currentProcess.arrivalTime;
    currentProcess.waitingTime =
      currentProcess.turnaroundTime - currentProcess.burstTime;
    currentProcess.completed = true;

    completedProcesses.push(currentProcess);
  }

  // Calculate averages
  const avgWaitingTime =
    completedProcesses.reduce((sum, p) => sum + p.waitingTime, 0) /
    completedProcesses.length;
  const avgTurnaroundTime =
    completedProcesses.reduce((sum, p) => sum + p.turnaroundTime, 0) /
    completedProcesses.length;

  return {
    results: completedProcesses,
    timeline: timeline,
    averages: {
      waiting: avgWaitingTime,
      turnaround: avgTurnaroundTime,
    },
  };
}

//MLQF scheduling
function MLQF(processList) {
  const timeQuantum = 2; // Time quantum for Queue 1 (Round Robin)
  const timeline = []; // Stores Gantt chart data
  let currentTime = 0;
  const completedProcesses = [];
  const readyQueue1 = []; // Queue for Round Robin (Priority 1)
  const readyQueue2 = []; // Queue for FCFS (Priority 2)

  // Initialize process states
  processList.forEach((process) => {
    process.remainingTime = process.burstTime;
  });

  // Sort processes by arrival time and priority for initial order
  processList.sort(
    (a, b) => a.arrivalTime - b.arrivalTime || a.priority - b.priority
  );

  // Helper function to check if all processes are complete
  function allComplete() {
    return processList.every((process) => process.remainingTime === 0);
  }

  // Main scheduling loop
  while (!allComplete()) {
    // Move processes to the appropriate ready queues based on current time
    processList.forEach((process) => {
      if (
        process.arrivalTime <= currentTime &&
        process.remainingTime > 0 &&
        !readyQueue1.includes(process) &&
        !readyQueue2.includes(process)
      ) {
        if (process.priority === 1) {
          readyQueue1.push(process);
        } else if (process.priority === 2) {
          readyQueue2.push(process);
        }
      }
    });

    // Execute Queue 1 (Round Robin with time quantum)
    if (readyQueue1.length > 0) {
      const process = readyQueue1.shift();
      const duration = Math.min(timeQuantum, process.remainingTime);
      timeline.push({
        processId: process.id,
        startTime: currentTime,
        duration: duration,
        endTime: currentTime + duration,
      });

      currentTime += duration;
      process.remainingTime -= duration;

      // Re-add to Queue 1 if not finished
      if (process.remainingTime > 0) {
        readyQueue1.push(process);
      } else {
        process.completionTime = currentTime;
        completedProcesses.push(process);
      }
    }
    // Execute Queue 2 (FCFS)
    else if (readyQueue2.length > 0) {
      const process = readyQueue2.shift();
      timeline.push({
        processId: process.id,
        startTime: currentTime,
        duration: process.remainingTime,
        endTime: currentTime + process.remainingTime,
      });

      currentTime += process.remainingTime;
      process.remainingTime = 0;
      process.completionTime = currentTime;
      completedProcesses.push(process);
    }
    // If no process is ready, advance time
    else {
      currentTime++;
    }
  }

  // Calculate averages (waiting time and turnaround time)
  let totalWaitingTime = 0;
  let totalTurnaroundTime = 0;

  completedProcesses.forEach((process) => {
    const waitingTime =
      process.completionTime - process.arrivalTime - process.burstTime;
    const turnaroundTime = process.completionTime - process.arrivalTime;

    totalWaitingTime += waitingTime;
    totalTurnaroundTime += turnaroundTime;
  });

  const avgWaitingTime = totalWaitingTime / completedProcesses.length;
  const avgTurnaroundTime = totalTurnaroundTime / completedProcesses.length;

  // Return the results and Gantt chart data
  return {
    results: completedProcesses,
    timeline: timeline,
    averages: {
      waiting: avgWaitingTime,
      turnaround: avgTurnaroundTime,
    },
  };
}

function displayResults(
  fcfsResults,
  rrResults,
  sjfResults,
  srtfResults,
  priorityResults,
  hrrnResults,
  mlqfResults
) {
  function getRandomColor() {
    const r = Math.floor(Math.random() * 128);
    const g = Math.floor(Math.random() * 128);
    const b = Math.floor(Math.random() * 128);
    return `rgb(${r}, ${g}, ${b})`;
  }

  function createGanttChart(timeline, elementId) {
    const container = document.getElementById(elementId);
    container.innerHTML = timeline
      .map(
        (block) => `
            <div class="gantt-block" style="background-color: ${getRandomColor(
              block.processId
            )};">
              <div class="gantt-time">${block.duration}</div>
              <div class="gantt-process">${block.processId}</div>
            </div>
          `
      )
      .join("");
  }

  function displayResultTable(results, tableId) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    tbody.innerHTML = results.results
      .map(
        (r) => `
            <tr>
              <td>${r.id}</td>
              <td>${r.arrivalTime}</td>
              <td>${r.burstTime}</td>
              <td>${r.priority}</td>
              <td>${r.completionTime}</td>
              <td>${r.waitingTime}</td>
              <td>${r.turnaroundTime}</td>
            </tr>
          `
      )
      .join("");
  }

  function displayAverages(averages, elementId) {
    document.getElementById(elementId).innerHTML = `
            Average Waiting Time: ${averages.waiting.toFixed(2)}<br>
            Average Turnaround Time: ${averages.turnaround.toFixed(2)}
          `;
  }

  // Display FCFS results
  createGanttChart(fcfsResults.timeline, "fcfsGantt");
  displayResultTable(fcfsResults, "fcfsResultsTable");
  displayAverages(fcfsResults.averages, "fcfsAverageTimes");

  // Display RR results
  createGanttChart(rrResults.timeline, "rrGantt");
  displayResultTable(rrResults, "rrResultsTable");
  displayAverages(rrResults.averages, "rrAverageTimes");

  // Display SJF results
  createGanttChart(sjfResults.timeline, "sjfGantt");
  displayResultTable(sjfResults, "sjfResultsTable");
  displayAverages(sjfResults.averages, "sjfAverageTimes");

  // Display SRTF results
  createGanttChart(srtfResults.timeline, "srtfGantt");
  displayResultTable(srtfResults, "srtfResultsTable");
  displayAverages(srtfResults.averages, "srtfAverageTimes");

  // Display Priority results
  createGanttChart(priorityResults.timeline, "priorityGantt");
  displayResultTable(priorityResults, "priorityResultsTable");
  displayAverages(priorityResults.averages, "priorityAverageTimes");

  // Display HRRN results
  createGanttChart(hrrnResults.timeline, "hrrnGantt");
  displayResultTable(hrrnResults, "hrrnResultsTable");
  displayAverages(hrrnResults.averages, "hrrnAverageTimes");

  // Display MLQF results
  createGanttChart(mlqfResults.timeline, "mlqfGantt");
  displayResultTable(mlqfResults, "mlqfResultsTable");
  displayAverages(mlqfResults.averages, "mlqfAverageTimes");
}
