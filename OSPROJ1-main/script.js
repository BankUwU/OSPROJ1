const processes = [];
const timeQuantum = 2;
let currentEditProcessId = null;

function editProcess() {
  const processSelect = document.getElementById("processToDelete");
  currentEditProcessId = processSelect.value;

  if (currentEditProcessId) {
    // Load current values (this would depend on how you store process data)
    const processData = getProcessData(currentEditProcessId);
    document.getElementById("editArrivalTime").value = processData.arrivalTime;
    document.getElementById("editBurstTime").value = processData.burstTime;
    document.getElementById("editPriority").value = processData.priority;

    // Show the edit popup
    document.getElementById("editPopup").style.display = "flex";
  } else {
    alert("Please select a process to edit.");
  }
}

function closeEditPopup() {
  document.getElementById("editPopup").style.display = "none";
}

function saveEditProcess() {
  const newArrivalTime = parseInt(document.getElementById("editArrivalTime").value);
  const newBurstTime = parseInt(document.getElementById("editBurstTime").value);
  const newPriority = parseInt(document.getElementById("editPriority").value);

  if (currentEditProcessId) {
    // Validate input
    if (isNaN(newArrivalTime) || newArrivalTime < 0 ||
      isNaN(newBurstTime) || newBurstTime <= 0 ||
      isNaN(newPriority) || newPriority <= 0) {
      alert("Please enter valid values (arrival time ≥ 0, burst time > 0, priority > 0)");
      return;
    }

    // Update process data in the processes array
    updateProcessData(currentEditProcessId, newArrivalTime, newBurstTime, newPriority);

    // Update table row
    updateTableRow(currentEditProcessId, newArrivalTime, newBurstTime, newPriority);

    alert(`Process ${currentEditProcessId} has been updated!`);
    closeEditPopup();
  }
}

function getProcessData(processId) {
  const process = processes.find(p => p.id === processId);
  if (process) {
    return {
      arrivalTime: process.arrivalTime,
      burstTime: process.burstTime,
      priority: process.priority
    };
  }
  return null;
}

function updateProcessData(processId, arrivalTime, burstTime, priority) {
  const processIndex = processes.findIndex(p => p.id === processId);
  if (processIndex !== -1) {
    processes[processIndex] = {
      ...processes[processIndex],
      arrivalTime: parseInt(arrivalTime),
      burstTime: parseInt(burstTime),
      priority: parseInt(priority)
    };
  }
}

function updateTableRow(processId, arrivalTime, burstTime, priority) {
  const table = document.getElementById("processTable").getElementsByTagName("tbody")[0];
  for (let row of table.rows) {
    if (row.cells[0].textContent === processId) {
      row.cells[1].textContent = arrivalTime;
      row.cells[2].textContent = burstTime;
      row.cells[3].textContent = priority;
      break;
    }
  }
}

function updateDeleteSelect() {
  const select = document.getElementById("processToDelete");
  select.innerHTML =
    '<option value="">Select process to delete or edit</option>' +
    processes
      .map((p) => `<option value="${p.id}">${p.id}</option>`)
      .join("");
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
  const arrivalTime = parseInt(
    document.getElementById("arrivalTime").value
  );
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
  // เคลียร์ข้อมูลทั้งหมดให้กลับไปเหมือนตอนเริ่มต้น

  // ลบข้อมูลทั้งหมดในตารางผลลัพธ์
  const resultTables = document.querySelectorAll("#fcfsResultsTable, #rrResultsTable, #sjfResultsTable, #srtfResultsTable, #priorityResultsTable, #hrrnResultsTable, #mlqfResultsTable");
  resultTables.forEach(table => table.getElementsByTagName("tbody")[0].innerHTML = "");

  // ลบข้อมูลทั้งหมดใน Gantt chart
  const ganttContainers = document.querySelectorAll("#fcfsGantt, #rrGantt, #sjfGantt, #srtfGantt, #priorityGantt, #hrrnGantt, #mlqfGantt");
  ganttContainers.forEach(container => container.innerHTML = "");

  // ลบข้อมูลค่าเฉลี่ยต่างๆ
  const averageTimes = document.querySelectorAll("#fcfsAverageTimes, #rrAverageTimes, #sjfAverageTimes, #srtfAverageTimes, #priorityAverageTimes, #hrrnAverageTimes, #mlqfAverageTimes");
  averageTimes.forEach(element => element.innerHTML = "");

  const comparisonChart = Chart.getChart("comparisonChart");
  if (comparisonChart) {comparisonChart.destroy();}
  
  // You can optionally clear the canvas or hide it before new data is loaded
  const ctx = document.getElementById('comparisonChart');
  ctx.style.display = 'none';  // Hide chart
  ctx.style.display = 'block'; // Show chart again after new data is populated

  // ลบข้อมูลกระบวนการ
  processes.length = 0;
  updateProcessTable();
  updateDeleteSelect();
}

// Call runSimulation to test the function after ensuring processes are properly added
function runSimulation() {
  if (processes.length === 0) {
    alert("Please add processes before running the simulation.");
    return;
  }

  // Create deep copies of processes for each algorithm
  const processesForSimulation = processes.map(p => ({
    id: p.id,
    arrivalTime: p.arrivalTime,
    burstTime: p.burstTime,
    priority: p.priority,
    remainingTime: p.burstTime
  }));

  const fcfsResults = FCFS([...processesForSimulation]);
  const rrResults = RR([...processesForSimulation], timeQuantum);
  const sjfResults = SJF([...processesForSimulation]);
  const srtfResults = SRTF([...processesForSimulation]);
  const priorityResults = PriorityScheduling([...processesForSimulation]);
  const hrrnResults = HRRN([...processesForSimulation]);
  const mlqfResults = MLQF([...processesForSimulation]);

  displayResults(
    fcfsResults,
    rrResults,
    sjfResults,
    srtfResults,
    priorityResults,
    hrrnResults,
    mlqfResults
  );

  displayComparisonChart();
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
    processes.reduce((sum, p) => sum + p.waitingTime, 0) /
    processes.length;
  const avgTurnaroundTime =
    processes.reduce((sum, p) => sum + p.turnaroundTime, 0) /
    processes.length;

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
function RR(processList, timeQuantum) {
  const processes = processList.map(p => ({
    ...p,
    remainingTime: p.burstTime
  }));

  const timeline = [];
  const completed = [];
  const readyQueue = [];
  let currentTime = 0;

  while (processes.some(p => p.remainingTime > 0)) {
    // Add newly arrived processes to ready queue
    processes.forEach(process => {
      if (process.arrivalTime <= currentTime &&
        process.remainingTime > 0 &&
        !readyQueue.includes(process)) {
        readyQueue.push(process);
      }
    });

    if (readyQueue.length === 0) {
      // Find next arrival time
      const nextArrival = processes
        .filter(p => p.remainingTime > 0 && p.arrivalTime > currentTime)
        .reduce((min, p) => Math.min(min, p.arrivalTime), Infinity);

      if (nextArrival !== Infinity) {
        currentTime = nextArrival;
        continue;
      }
    }

    if (readyQueue.length > 0) {
      const currentProcess = readyQueue.shift();
      const executionTime = Math.min(timeQuantum, currentProcess.remainingTime);

      timeline.push({
        processId: currentProcess.id,
        startTime: currentTime,
        duration: executionTime,
        endTime: currentTime + executionTime
      });

      currentProcess.remainingTime -= executionTime;
      currentTime += executionTime;

      if (currentProcess.remainingTime > 0) {
        readyQueue.push(currentProcess);
      } else {
        currentProcess.completionTime = currentTime;
        completed.push(currentProcess);
      }
    } else {
      currentTime++;
    }
  }

  const results = completed.map(p => ({
    ...p,
    turnaroundTime: p.completionTime - p.arrivalTime,
    waitingTime: p.completionTime - p.arrivalTime - p.burstTime
  }));

  return {
    results,
    timeline,
    averages: {
      waiting: results.reduce((sum, p) => sum + p.waitingTime, 0) / results.length,
      turnaround: results.reduce((sum, p) => sum + p.turnaroundTime, 0) / results.length
    }
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
    completed.reduce((sum, p) => sum + p.waitingTime, 0) /
    completed.length;
  const avgTurnaroundTime =
    completed.reduce((sum, p) => sum + p.turnaroundTime, 0) /
    completed.length;

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
      availableProcesses.sort(
        (a, b) => a.remainingTime - b.remainingTime
      );
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
    completed.reduce((sum, p) => sum + p.waitingTime, 0) /
    completed.length;
  const avgTurnaroundTime =
    completed.reduce((sum, p) => sum + p.turnaroundTime, 0) /
    completed.length;

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
    currentProcess.completionTime =
      currentTime + currentProcess.burstTime;
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
  const timeQuantum = 2;
  const timeline = [];
  let currentTime = 0;
  const completedProcesses = [];
  const readyQueue1 = [];
  const readyQueue2 = [];

  // Deep copy processes
  const processes = processList.map(p => ({
    ...p,
    remainingTime: p.burstTime
  }));

  while (processes.some(p => p.remainingTime > 0)) {
    // Find next process arrival if both queues empty
    if (readyQueue1.length === 0 && readyQueue2.length === 0) {
      const nextArrival = processes
        .filter(p => p.remainingTime > 0 && p.arrivalTime > currentTime)
        .reduce((min, p) => Math.min(min, p.arrivalTime), Infinity);

      if (nextArrival !== Infinity) {
        currentTime = nextArrival;
      }
    }

    // Move arrived processes to queues
    processes.forEach(process => {
      if (process.arrivalTime <= currentTime &&
        process.remainingTime > 0 &&
        !readyQueue1.includes(process) &&
        !readyQueue2.includes(process)) {
        if (process.priority <= 2) {
          readyQueue1.push(process);
        } else {
          readyQueue2.push(process);
        }
      }
    });

    let selectedProcess = null;
    let quantum = timeQuantum;

    if (readyQueue1.length > 0) {
      selectedProcess = readyQueue1.shift();
      quantum = Math.min(timeQuantum, selectedProcess.remainingTime);
    } else if (readyQueue2.length > 0) {
      selectedProcess = readyQueue2.shift();
      quantum = selectedProcess.remainingTime;
    }

    if (selectedProcess) {
      timeline.push({
        processId: selectedProcess.id,
        startTime: currentTime,
        duration: quantum,
        endTime: currentTime + quantum
      });

      selectedProcess.remainingTime -= quantum;
      currentTime += quantum;

      if (selectedProcess.remainingTime > 0) {
        if (selectedProcess.priority <= 2) {
          readyQueue1.push(selectedProcess);
        } else {
          readyQueue2.push(selectedProcess);
        }
      } else {
        selectedProcess.completionTime = currentTime;
        completedProcesses.push(selectedProcess);
      }
    } else {
      currentTime++;
    }
  }

  // Calculate statistics
  const results = completedProcesses.map(p => ({
    ...p,
    turnaroundTime: p.completionTime - p.arrivalTime,
    waitingTime: p.completionTime - p.arrivalTime - p.burstTime
  }));

  return {
    results,
    timeline,
    averages: {
      waiting: results.reduce((sum, p) => sum + p.waitingTime, 0) / results.length,
      turnaround: results.reduce((sum, p) => sum + p.turnaroundTime, 0) / results.length
    }
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
