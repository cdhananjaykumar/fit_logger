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


function getToday(){
    return new Date().toISOString().split("T")[0];
}


function getHeight(){
    return parseFloat(localStorage.getItem("fitlog_height_cm")) || null;
}


function saveName(){

    const name = document.getElementById("nameInput").value.trim();
    const height = document.getElementById("heightInput").value;

    if(name==""){
        alert("Enter name");
        return;
    }

    if(height=="" || parseFloat(height)<=0){
        alert("Enter your height in cm");
        return;
    }

    localStorage.setItem("fitlog_user",name);
    localStorage.setItem("fitlog_height_cm",height);

    showDashboard(name);
}


function editHeight(){

    const current = getHeight();

    const input = prompt("Enter your height in cm:", current || "");

    if(input===null){
        return;
    }

    const value = parseFloat(input);

    if(!value || value<=0){
        alert("Enter a valid height in cm");
        return;
    }

    localStorage.setItem("fitlog_height_cm", value);

    document.getElementById("heightDisplay").innerText = value;
}


// Standard adult BMI bands: <18.5 underweight, 18.5-24.9 normal, >=25 overweight/obese
function getBmi(weightKg, heightCm){

    if(!weightKg || !heightCm){
        return null;
    }

    const heightM = heightCm/100;

    return weightKg / (heightM*heightM);
}


function getBmiCategory(bmi){

    if(bmi===null) return null;
    if(bmi<18.5) return "under";
    if(bmi<25) return "normal";
    return "over";
}


function getBmiLabel(category){

    if(category==="under") return "Underweight";
    if(category==="normal") return "Normal";
    if(category==="over") return "Overweight";

    return "--";
}


const BMI_COLORS = {
    under: "#42a5f5",
    normal: "#43a047",
    over: "#e53935"
};


function getWeightColor(weightKg){

    const heightCm = getHeight();
    const bmi = getBmi(weightKg, heightCm);
    const category = getBmiCategory(bmi);

    return BMI_COLORS[category] || "#43a047";
}


function showDashboard(name){

    document.getElementById("loginScreen").classList.add("hidden");
    document.getElementById("historyScreen").classList.add("hidden");

    document.getElementById("dashboard").classList.remove("hidden");

    if(name){
        document.getElementById("userHeading").innerText =
            "Hello, " + name;
    }

    let height = getHeight();

    if(!height){
        const input = prompt("One-time setup: enter your height in cm (used for BMI-based colour coding):");
        const value = parseFloat(input);

        if(value && value>0){
            localStorage.setItem("fitlog_height_cm", value);
            height = value;
        }
    }

    document.getElementById("heightDisplay").innerText = height || "--";

    loadTodayIntoForm();
}


function loadTodayIntoForm(){

    const today = getToday();
    const logs = JSON.parse(localStorage.getItem("fitlog_entries")) || [];
    const entry = logs.find(item => item.date===today && !item.isRemark);

    if(entry){
        document.getElementById("weightInput").value = entry.weight || "";
        document.getElementById("stepsInput").value = entry.steps || "";
        document.getElementById("normal").checked = !!entry.normal;
        document.getElementById("sugar").checked = !!entry.sugar;
        document.getElementById("tea").checked = !!entry.tea;
        document.getElementById("nonveg").checked = !!entry.nonveg;
    }
}


function saveEntry(){

    const weight = document.getElementById("weightInput").value;

    if(weight==""){
        alert("Enter weight");
        return;
    }

    const today = getToday();

    const entry = {

        date: today,
        weight: weight,
        steps: document.getElementById("stepsInput").value || "",
        isRemark: false,

        normal: document.getElementById("normal").checked,
        sugar: document.getElementById("sugar").checked,
        tea: document.getElementById("tea").checked,
        nonveg: document.getElementById("nonveg").checked
    };


    let logs =
        JSON.parse(localStorage.getItem("fitlog_entries")) || [];


    const index =
        logs.findIndex(item => item.date===today && !item.isRemark);


    if(index>=0){

        logs[index]=entry;

    }else{

        logs.push(entry);
    }


    localStorage.setItem(
        "fitlog_entries",
        JSON.stringify(logs)
    );


    document.getElementById("statusMessage").innerText =
        "Saved Successfully";
}


let weightChartInstance = null;


function showHistory(){

    document.getElementById("dashboard").classList.add("hidden");
    document.getElementById("historyScreen").classList.remove("hidden");

    document.getElementById("remarkForm").classList.add("hidden");

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

    const realLogs = logs.filter(item => !item.isRemark && item.weight);

    const labels = realLogs.map(item => formatDisplayDate(item.date));
    const weights = realLogs.map(item => parseFloat(item.weight));

    const pointColors = weights.map(w => getWeightColor(w));

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
                backgroundColor: "rgba(67, 160, 71, 0.1)",
                fill: true,
                tension: 0.3,
                pointBackgroundColor: pointColors,
                pointBorderColor: pointColors,
                pointRadius: 5,
                segment: {
                    borderColor: (segCtx) => {
                        const endWeight = segCtx.p1.parsed.y;
                        return getWeightColor(endWeight);
                    }
                }
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

    const realLogs = logs.filter(item => !item.isRemark);

    if(realLogs.length===0){
        statsRow.innerHTML = "";
        return;
    }

    const total = realLogs.length;

    const sugarDays = realLogs.filter(item => item.sugar).length;
    const teaDays = realLogs.filter(item => item.tea).length;
    const nonvegDays = realLogs.filter(item => item.nonveg).length;

    const weighedLogs = realLogs.filter(item => item.weight);
    const firstWeight = weighedLogs.length ? parseFloat(weighedLogs[0].weight) : null;
    const lastWeight = weighedLogs.length ? parseFloat(weighedLogs[weighedLogs.length-1].weight) : null;

    let changeLabel = "--";
    if(firstWeight!==null && lastWeight!==null){
        const change = (lastWeight - firstWeight).toFixed(1);
        changeLabel = (change > 0 ? "+" + change : change) + " kg";
    }

    const steppedLogs = realLogs.filter(item => item.steps);
    const goalDays = steppedLogs.filter(item => parseInt(item.steps) >= 10000).length;
    const stepGoalLabel = steppedLogs.length
        ? percent(goalDays, steppedLogs.length) + "%"
        : "--";

    const heightCm = getHeight();
    let bmiHtml = "<div class='statBox'><span>--</span><small>Current BMI</small></div>";

    if(lastWeight!==null && heightCm){
        const bmi = getBmi(lastWeight, heightCm);
        const category = getBmiCategory(bmi);
        bmiHtml =
            "<div class='statBox bmiBox " + category + "'>" +
                "<span>" + bmi.toFixed(1) + "</span>" +
                "<small>" + getBmiLabel(category) + "</small>" +
            "</div>";
    }

    statsRow.innerHTML =
        "<div class='statBox'><span>" + changeLabel + "</span><small>Weight change</small></div>" +
        bmiHtml +
        "<div class='statBox'><span>" + stepGoalLabel + "</span><small>10k+ step days</small></div>" +
        "<div class='statBox'><span>" + percent(sugarDays,total) + "%</span><small>Sugar days</small></div>" +
        "<div class='statBox'><span>" + percent(teaDays,total) + "%</span><small>Tea days</small></div>" +
        "<div class='statBox'><span>" + percent(nonvegDays,total) + "%</span><small>Non Veg days</small></div>";
}


function percent(count,total){

    if(total===0) return 0;

    return Math.round((count/total)*100);
}


function renderEntryList(logs){

    const entryList = document.getElementById("entryList");

    if(logs.length===0){
        entryList.innerHTML = "<p class='emptyMsg'>No entries yet.</p>";
        return;
    }

    const today = getToday();
    const reversed = [...logs].reverse();

    entryList.innerHTML = reversed.map(item => {

        if(item.isRemark){
            return renderRemarkRow(item);
        }

        return renderDataRow(item, item.date===today);

    }).join("");
}


function renderDataRow(item, isToday){

    const tags = [];

    if(item.normal) tags.push("Normal");
    if(item.sugar) tags.push("Sugar");
    if(item.tea) tags.push("Tea");
    if(item.nonveg) tags.push("Non Veg");

    const tagHtml = tags.length
        ? tags.map(t => "<span class='tag'>" + t + "</span>").join("")
        : "<span class='tag empty'>No food logged</span>";

    const stepsHtml = renderStepsTag(item.steps);

    const statusHtml = isToday
        ? "<span class='statusBadge today'>Today &middot; editable</span>"
        : "<span class='statusBadge locked'>&#128274; Locked</span>";

    const weightColor = getWeightColor(parseFloat(item.weight));

    return "<div class='entryRow'>" +
        "<div class='entryTop'>" +
            "<strong>" + formatDisplayDate(item.date) + "</strong>" +
            "<span class='entryWeight' style='color:" + weightColor + "'>" + item.weight + " kg</span>" +
        "</div>" +
        "<div class='entryTags'>" + tagHtml + stepsHtml + "</div>" +
        "<div class='entryStatus'>" + statusHtml + "</div>" +
    "</div>";
}


function renderRemarkRow(item){

    return "<div class='entryRow remarkRow'>" +
        "<div class='entryTop'>" +
            "<strong>" + formatDisplayDate(item.date) + "</strong>" +
            "<span class='statusBadge missed'>Missed Day</span>" +
        "</div>" +
        "<div class='remarkText'>" + escapeHtml(item.remark) + "</div>" +
    "</div>";
}


function renderStepsTag(steps){

    if(!steps){
        return "<span class='tag steps-none'>No steps logged</span>";
    }

    const value = parseInt(steps);
    const cls = value >= 10000 ? "steps-good" : "steps-low";

    return "<span class='tag " + cls + "'>" + value.toLocaleString() + " steps</span>";
}


function escapeHtml(str){

    const div = document.createElement("div");
    div.innerText = str || "";
    return div.innerHTML;
}


function formatDisplayDate(isoDate){

    const d = new Date(isoDate);

    return d.toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });
}


function toggleRemarkForm(){

    const form = document.getElementById("remarkForm");
    form.classList.toggle("hidden");

    if(!form.classList.contains("hidden")){

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate()-1);

        document.getElementById("remarkDate").max = yesterday.toISOString().split("T")[0];
        document.getElementById("remarkDate").value = "";
        document.getElementById("remarkText").value = "";
    }
}


function saveRemark(){

    const date = document.getElementById("remarkDate").value;
    const remark = document.getElementById("remarkText").value.trim();

    const today = getToday();

    if(!date){
        alert("Pick the missed date");
        return;
    }

    if(date>=today){
        alert("You can only add a remark for a past date, not today or the future.");
        return;
    }

    if(remark==""){
        alert("Enter a remark");
        return;
    }

    let logs = JSON.parse(localStorage.getItem("fitlog_entries")) || [];

    const hasRealEntry = logs.some(item => item.date===date && !item.isRemark);

    if(hasRealEntry){
        alert("This date already has logged data and cannot be changed.");
        return;
    }

    const existingRemarkIndex = logs.findIndex(item => item.date===date && item.isRemark);

    const remarkEntry = {
        date: date,
        isRemark: true,
        remark: remark
    };

    if(existingRemarkIndex>=0){
        logs[existingRemarkIndex] = remarkEntry;
    }else{
        logs.push(remarkEntry);
    }

    localStorage.setItem("fitlog_entries", JSON.stringify(logs));

    document.getElementById("remarkForm").classList.add("hidden");

    renderHistory();
}


function exportCSV(){

    const logs = getSortedLogs();

    if(logs.length===0){
        alert("No entries to export yet.");
        return;
    }

    const header = ["Date","Weight(kg)","Steps","Normal","Sugar","Tea","NonVeg","Remark"];

    const rows = logs.map(item => {

        if(item.isRemark){
            return [item.date, "", "", "", "", "", "", item.remark || ""];
        }

        return [
            item.date,
            item.weight || "",
            item.steps || "",
            item.normal ? "Yes" : "No",
            item.sugar ? "Yes" : "No",
            item.tea ? "Yes" : "No",
            item.nonveg ? "Yes" : "No",
            ""
        ];
    });

    const csvContent =
        [header, ...rows].map(row =>
            row.map(cell => "\"" + String(cell).replace(/"/g,'""') + "\"").join(",")
        ).join("\n");

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
