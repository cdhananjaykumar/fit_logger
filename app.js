window.onload = function () {

    const user = localStorage.getItem("fitlog_user");

    document.getElementById("currentDate").innerText =
        new Date().toLocaleDateString("en-GB");

    if(user){
        showDashboard(user);
    }

    if("serviceWorker" in navigator){
        navigator.serviceWorker.register("sw.js").catch(() => {
            // offline caching unavailable, app still works online
        });
    }
}


let editingDate = null;


function saveName(){

    const name = document.getElementById("nameInput").value.trim();

    if(name==""){
        alert("Enter name");
        return;
    }

    localStorage.setItem("fitlog_user",name);

    showDashboard(name);
}


function showDashboard(name){

    document.getElementById("loginScreen").classList.add("hidden");
    document.getElementById("historyScreen").classList.add("hidden");

    document.getElementById("dashboard").classList.remove("hidden");

    if(name){
        document.getElementById("userHeading").innerText =
            "Hello, " + name;
    }
}


function saveEntry(){

    const weight = document.getElementById("weightInput").value;

    if(weight==""){
        alert("Enter weight");
        return;
    }

    const today = new Date().toISOString().split("T")[0];
    const targetDate = editingDate || today;

    const entry = {

        date: targetDate,
        weight: weight,

        normal: document.getElementById("normal").checked,
        sugar: document.getElementById("sugar").checked,
        tea: document.getElementById("tea").checked,
        nonveg: document.getElementById("nonveg").checked
    };


    let logs =
        JSON.parse(localStorage.getItem("fitlog_entries")) || [];


    const index =
        logs.findIndex(item => item.date===targetDate);


    if(index>=0){

        logs[index]=entry;

    }else{

        logs.push(entry);
    }


    localStorage.setItem(
        "fitlog_entries",
        JSON.stringify(logs)
    );


    const wasEditing = !!editingDate;

    clearForm();
    exitEditMode();

    if(wasEditing){

        showHistory();

    }else{

        document.getElementById("statusMessage").innerText =
            "Saved Successfully";
    }
}


function clearForm(){

    document.getElementById("weightInput").value="";

    document.getElementById("normal").checked=false;
    document.getElementById("sugar").checked=false;
    document.getElementById("tea").checked=false;
    document.getElementById("nonveg").checked=false;
}


let weightChartInstance = null;


function showHistory(){

    document.getElementById("dashboard").classList.add("hidden");
    document.getElementById("historyScreen").classList.remove("hidden");

    renderHistory();
}


function getSortedLogs(){

    let logs =
        JSON.parse(localStorage.getItem("fitlog_entries")) || [];

    logs.sort((a,b) => a.date.localeCompare(b.date));

    return logs;
}


function renderHistory(){

    const logs = getSortedLogs();

    renderChart(logs);
    renderStats(logs);
    renderEntryList(logs);
}


function renderChart(logs){

    const labels = logs.map(item => formatDisplayDate(item.date));
    const weights = logs.map(item => parseFloat(item.weight));

    const ctx = document.getElementById("weightChart").getContext("2d");

    if(weightChartInstance){
        weightChartInstance.destroy();
    }

    weightChartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Weight (kg)",
                data: weights,
                borderColor: "#43a047",
                backgroundColor: "rgba(67, 160, 71, 0.15)",
                fill: true,
                tension: 0.3,
                pointBackgroundColor: "#43a047",
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: false }
            }
        }
    });
}


function renderStats(logs){

    const statsRow = document.getElementById("statsRow");

    if(logs.length===0){
        statsRow.innerHTML = "";
        return;
    }

    const total = logs.length;

    const sugarDays = logs.filter(item => item.sugar).length;
    const teaDays = logs.filter(item => item.tea).length;
    const nonvegDays = logs.filter(item => item.nonveg).length;

    const firstWeight = parseFloat(logs[0].weight);
    const lastWeight = parseFloat(logs[logs.length-1].weight);
    const change = (lastWeight - firstWeight).toFixed(1);
    const changeLabel = change > 0 ? "+" + change : change;

    statsRow.innerHTML =
        "<div class='statBox'><span>" + changeLabel + " kg</span><small>Weight change</small></div>" +
        "<div class='statBox'><span>" + percent(sugarDays,total) + "%</span><small>Sugar days</small></div>" +
        "<div class='statBox'><span>" + percent(teaDays,total) + "%</span><small>Tea days</small></div>" +
        "<div class='statBox'><span>" + percent(nonvegDays,total) + "%</span><small>Non Veg days</small></div>";
}


function percent(count,total){

    return Math.round((count/total)*100);
}


function renderEntryList(logs){

    const entryList = document.getElementById("entryList");

    if(logs.length===0){
        entryList.innerHTML = "<p class='emptyMsg'>No entries yet.</p>";
        return;
    }

    const reversed = [...logs].reverse();

    entryList.innerHTML = reversed.map(item => {

        const tags = [];

        if(item.normal) tags.push("Normal");
        if(item.sugar) tags.push("Sugar");
        if(item.tea) tags.push("Tea");
        if(item.nonveg) tags.push("Non Veg");

        const tagHtml = tags.length
            ? tags.map(t => "<span class='tag'>" + t + "</span>").join("")
            : "<span class='tag empty'>No food logged</span>";

        return "<div class='entryRow'>" +
            "<div class='entryTop'>" +
                "<strong>" + formatDisplayDate(item.date) + "</strong>" +
                "<span class='entryWeight'>" + item.weight + " kg</span>" +
            "</div>" +
            "<div class='entryTags'>" + tagHtml + "</div>" +
            "<div class='entryActions'>" +
                "<button class='rowBtn edit' onclick=\"editEntry('" + item.date + "')\">Edit</button>" +
                "<button class='rowBtn delete' onclick=\"deleteEntry('" + item.date + "')\">Delete</button>" +
            "</div>" +
        "</div>";

    }).join("");
}


function formatDisplayDate(isoDate){

    const d = new Date(isoDate);

    return d.toLocaleDateString("en-GB", { day:"2-digit", month:"short" });
}


function editEntry(date){

    const logs = getSortedLogs();
    const entry = logs.find(item => item.date===date);

    if(!entry){
        return;
    }

    editingDate = date;

    document.getElementById("weightInput").value = entry.weight;
    document.getElementById("normal").checked = entry.normal;
    document.getElementById("sugar").checked = entry.sugar;
    document.getElementById("tea").checked = entry.tea;
    document.getElementById("nonveg").checked = entry.nonveg;

    document.getElementById("editingBanner").classList.remove("hidden");
    document.getElementById("editingBanner").firstChild.textContent =
        "Editing entry for " + formatDisplayDate(date) + " ";

    document.getElementById("saveEntryBtn").innerText = "Update Entry";

    document.getElementById("statusMessage").innerText = "";

    showDashboard();
}


function cancelEdit(){

    clearForm();
    exitEditMode();
}


function exitEditMode(){

    editingDate = null;

    document.getElementById("editingBanner").classList.add("hidden");
    document.getElementById("saveEntryBtn").innerText = "Save Entry";
}


function deleteEntry(date){

    const confirmed = confirm(
        "Delete the entry for " + formatDisplayDate(date) + "?"
    );

    if(!confirmed){
        return;
    }

    let logs =
        JSON.parse(localStorage.getItem("fitlog_entries")) || [];

    logs = logs.filter(item => item.date!==date);

    localStorage.setItem(
        "fitlog_entries",
        JSON.stringify(logs)
    );

    if(editingDate===date){
        clearForm();
        exitEditMode();
    }

    renderHistory();
}


function exportCSV(){

    const logs = getSortedLogs();

    if(logs.length===0){
        alert("No entries to export yet.");
        return;
    }

    const header = ["Date","Weight(kg)","Normal","Sugar","Tea","NonVeg"];

    const rows = logs.map(item => [
        item.date,
        item.weight,
        item.normal ? "Yes" : "No",
        item.sugar ? "Yes" : "No",
        item.tea ? "Yes" : "No",
        item.nonveg ? "Yes" : "No"
    ]);

    const csvContent =
        [header, ...rows].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "fitlog_entries.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}