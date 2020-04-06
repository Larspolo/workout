var test = {
    name: "Test",
    color: "#212121",
    session: [{
            name: "One",
            image: "images/plank/1.png",
            time: 2
        }, {
            name: "Two",
            image: "images/plank/1.png",
            time: 1
        }
    ]
}

var trainings = [abs1, abs2, arms2, arms3, shoulder2, ass1, ass2]

function Time(s) {
    this.s = s

    this.step = amount => {
        this.s += amount
        if (this.s < 0)
            return false
        return true
    }
    this.str = _ => this.s < 0 ? "---" : (Math.floor(Math.floor(this.s / 60) % 60)) + ":" +
                    ('0'+(this.s % 60 % 60)).slice(-2)
}

function set_info(title=null, time=null) {
    if (title) $("#session > .card .title").first().text(title)
    if (time) $("#session > .card .time").first().text(time)
}

function load_session(training) {
    current_name = trainings[training].name
    $(".brand-logo").text('0/'+trainings[training].session.length)
    $("#session").html(`
        <div class="card">
            <div class="card-content">
                <div class="card-title title">${current_name}</div>
                <span class="time"></span>
            </div>
        </div>`)
    session = trainings[training].session.slice()
    for (i in session) {
        $("#session").append(`
            <div class="card">
                <div class="card-content">
                    <div class="card-title title">${session[i].name}</div>
                    <span class="time">${new Time(session[i].time).str()}</span>
                </div>
            </div>`)
    }
    current_session = trainings[training].session.slice().reverse()
    current_activity = null
    current_prerate_time = 0
    paused = false
}

var current_name = null
var current_session = null
var current_activity = null
var current_prerate_time = 0
var paused = false

var prerate_time = 7

function restart() {
    if (!current_name) return

    for (i in trainings) {
        if (trainings[i].name == current_name)
            load_session(i)
    }
}

function load_next_activity() {
    if (!current_session || current_session.length == 0) return false
    if (current_prerate_time == prerate_time) new Audio('next.mp3').play()
    if (current_prerate_time > 0) {
        set_info("Prepare for next activity", null)
        current_prerate_time --
        return true
    }
    var total = $(".brand-logo").text().split("/")[1]
    $(".brand-logo").text((total - current_session.length + 1) + '/' + total)
    current_prerate_time = prerate_time
    $("#session > .card").first().remove()
    new Audio('start.mp3').play()
    current_activity = Object.assign({}, current_session.pop())
    current_activity.time = new Time(current_activity.time)
    set_info(current_activity.name, current_activity.time.str())
    return true
}

function end_session(finished = true) {
    if (!current_session) return
    current_session = null
    current_activity = null
    current_prerate_time = 0
    paused = false

    new Audio('finished.mp3').play()
    $(".brand-logo").text("Workouts")
    if (finished) M.toast({html: 'Well done!', classes: 'center green rounded'})
    $("#session").html(`
        <div class="card">
            <div class="card-content">
                <div class="card-title title">Select a workout to start!</div>
                <span class="time"></span>
            </div>
        </div>`)
}

function main() {
    if (paused) return

    /* if there is no activity or activity is over */
    if (!current_activity || !current_activity.time.step(-1))
        /* if it could load the next activity */
        if (!load_next_activity())
            return end_session()
    /* show info */
    set_info(null, current_activity.time.str())
}

function toggle_pause() {
    paused = !paused
    $(".fa-play").toggleClass('fa-pause')
    $(".fa-pause").toggleClass('fa-play')
    $(".fa-play").toggleClass('fa-pause')
}
function next() {
    current_prerate_time = 0
    if (!load_next_activity())
        return end_session()
}
function stop() {
    end_session(false)
}

$(document).ready(_ => {
    for (var i = 0; i < trainings.length; i ++) {
        var time = new Time(0)
        for (j in trainings[i].session) {
            console.log(trainings[i].session[j])
            time.step(7 + trainings[i].session[j].time)
        }
        $("#training-list").append(`
            <div class="card hover" style="border-left-color: ${trainings[i].color}" onclick="load_session(${i})">
                <div class="card-content training">
                    ${trainings[i].name}
                    <br><span class="time">${time.str()}</span>
                </div>
            </div>`)
    }
    mainLoop = setInterval(main, 1000)
})
