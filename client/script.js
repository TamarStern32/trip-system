const BASE_URL = "http://127.0.0.1:8000"

/////////////////// Index Page - Log in //////////////////////////////////////////////////////////////////

const loginBtn = document.getElementById("loginBtn")

if (loginBtn) {

    loginBtn.addEventListener("click", async () => {
        const id = document.getElementById("loginId").value
        const login_message = document.getElementById("loginMessage")

        // first, check if the ID belongs to a teacher, if not we check if it belongs to a student
        const teacherResponse = await fetch(`${BASE_URL}/teachers/${id}`)
        if (teacherResponse.ok) {
            localStorage.setItem("userType", "teacher")
            localStorage.setItem("userId", id)
            login_message.textContent = "Welcome teacher!\nThe top navigation menu is now available"
            document.getElementById("topNavigation").style.display = "flex"
            return
        }

        // if not a teacher, check if it's a student
        const studentResponse = await fetch(`${BASE_URL}/students/${id}`)
        if (studentResponse.ok) {
            localStorage.setItem("userType", "student")
            localStorage.setItem("userId", id)
            window.location.href = "/client/student.html"
            return
        }


        // if not found in both, offer to register
        login_message.textContent = "ID not found. Please register"
        
        // show the registration form
        const hero_register = document.querySelector(".hero-register")
        hero_register.style.visibility = "visible"
        
        // pre-fill the ID field in the registration form with the entered ID
        document.getElementById("registerId").value = id
    })
}



/////////////////// Teacher & Student Registration //////////////////////////////////////////////////////////////////

let registerType = "student" // default to teacher, can be switched to student 

// connect HTML to JS logic
const showStudentForm = document.getElementById("showStudentForm")
const showTeacherForm = document.getElementById("showTeacherForm")
const registerBtn = document.getElementById("registerBtn")

if (showStudentForm) { // check if element exists - in some pages it doesn't, so we avoid errors
    showStudentForm.addEventListener("click", () => {
        registerType = "student" // set type to student when button is clicked
        document.getElementById("registerTitle").textContent = "New Student"
        document.getElementById("registerMessage").textContent = "" // clear previous messages
    })
}

if (showTeacherForm) {
    showTeacherForm.addEventListener("click", () => {
        registerType = "teacher" // set type to teacher when button is clicked
        document.getElementById("registerTitle").textContent = "New Teacher"
        document.getElementById("registerMessage").textContent = ""
    })
}

if (registerBtn) {
    registerBtn.addEventListener("click", async () => {
        
        const register_message = document.getElementById("registerMessage")
        const login_message = document.getElementById("loginMessage")
        login_message.textContent = "";

        const person = {
            id: document.getElementById("registerId").value,
            first_name: document.getElementById("registerFirstName").value,
            last_name: document.getElementById("registerLastName").value,
            class_name: document.getElementById("registerClass").value
        }

        if (!person.id ||  !person.class_name) {
            register_message.textContent = "ID and class name are required";
            return; 
        }
        if (person.id.length !== 9) {
            register_message.textContent = "ID must be 9 digits"
            return;
        }

        const endpoint = registerType === "teacher" ? "teachers" : "students"

        try { 
            // send POST request
            // http request to backend API to create new teacher/student
            // await is used to wait for the response before continuing
            const response = await fetch(`${BASE_URL}/${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(person)
            })

            // answer from backend, contains success message or error details
            const data = await response.json()

            if (!response.ok) { // ok is boolean 
                register_message.className = "message error-message"
                register_message.textContent = data.detail || "Failed to register"
                return
            }

            // success message
            register_message.className = "message success-message"
            register_message.textContent = `${registerType} registered successfully`

            // clear fields after successful registration
            document.getElementById("registerId").value = ""
            document.getElementById("registerFirstName").value = ""
            document.getElementById("registerLastName").value = ""
            document.getElementById("registerClass").value = ""

            if (registerType === "teacher") {
               localStorage.setItem("userType", "teacher")
               localStorage.setItem("userId", person.id)
               register_message.textContent = "Welcome teacher!\nThe top navigation menu is now available"
               document.getElementById("topNavigation").style.display = "flex"
           }


        } 
        catch (error) { // network or other unexpected error
            register_message.textContent = "Server error"
        }
    })
}

/////////////////// Lists page //////////////////////////////////////////////////////////////////////////////////////

const studentsTableBody = document.getElementById("studentsTableBody")
const teachersTableBody = document.getElementById("teachersTableBody")
// to store the original lists of students and teachers, so we can filter them when searching without making additional API calls
let allStudents = []
let allTeachers = [] 

// Helper function to render table rows based on provided data
function renderTable(data, tableBody) {
    if (!tableBody) return;
    tableBody.innerHTML = ""
    data.forEach(person => {
        tableBody.innerHTML += `
            <tr>
                <td>${person.id}</td>
                <td>${person.first_name || ""}</td>
                <td>${person.last_name || ""}</td>
                <td>${person.class_name || ""}</td>
            </tr>
        `
    })
}

async function loadLists() {

    if (!studentsTableBody || !teachersTableBody) { // if we are not in the lists.html page, stops
        return
    }
    try 
    {
        // security check - only teachers can access the lists page, if a student tries to access it, they will be redirected to the home page
        if (localStorage.getItem("userType") !== "teacher") {
        return; 
        }

        // default method is GET, so we don't need to specify the method 
        const studentsResponse = await fetch(`${BASE_URL}/students`)
        const teachersResponse = await fetch(`${BASE_URL}/teachers`)

        // parse the JSON response into JavaScript objects and store them in global variables for filtering[cite: 5, 6]
        allStudents = await studentsResponse.json()
        allTeachers = await teachersResponse.json()

        // clear existing table rows and render the full lists initially
        renderTable(allStudents, studentsTableBody)
        renderTable(allTeachers, teachersTableBody)
    } 
    catch (error) 
    {
        // in case of error, show message in the tables instead of the data
        studentsTableBody.innerHTML = `
            <tr>
                <td colspan="4">Failed to load students</td>
            </tr>
        `

        teachersTableBody.innerHTML = `
            <tr>
                <td colspan="4">Failed to load teachers</td>
            </tr>
        `
    }
}

// Search logic for Students - filters by ID or Name
const searchStudent = document.getElementById("searchStudent")
if (searchStudent) { // check if element exists - in some pages it doesn't, so we avoid errors
    searchStudent.addEventListener("input", (e) => { // listen if the input value changes, even by one char
        const term = e.target.value.toLowerCase() // convert to lower case in case of names starting with capital letters, to make the search case-insensitive
        const filtered = allStudents.filter(s => 
              s.id.toString().startsWith(term) || 
              (s.first_name || "").toLowerCase().startsWith(term) || 
              (s.last_name || "").toLowerCase().startsWith(term)
     )
        renderTable(filtered, studentsTableBody)
    })
}

// Reset button for Students - shows the full list again[cite: 6]
const resetStudentBtn = document.getElementById("resetStudentBtn")
if (resetStudentBtn) {
    resetStudentBtn.addEventListener("click", () => {
        if (searchStudent) 
            searchStudent.value = "" // Clear input field
        renderTable(allStudents, studentsTableBody) // Restore original list
    })
}

// Search logic for Teachers - filters by ID or Name
const searchTeacher = document.getElementById("searchTeacher")
if (searchTeacher) {
    searchTeacher.addEventListener("input", (e) => {
        const term = e.target.value.toLowerCase()
        const filtered = allTeachers.filter(t => 
             t.id.toString().startsWith(term) || 
             (t.first_name || "").toLowerCase().startsWith(term) || 
             (t.last_name || "").toLowerCase().startsWith(term)
        )
        renderTable(filtered, teachersTableBody)
    })
}

// Reset button for Teachers - shows the full list again
const resetTeacherBtn = document.getElementById("resetTeacherBtn")
if (resetTeacherBtn) {
    resetTeacherBtn.addEventListener("click", () => {
        if (searchTeacher)
            searchTeacher.value = "" // Clear input field
        renderTable(allTeachers, teachersTableBody) // Restore original list
    })
}

loadLists()


/////////////////// Teacher page ////////////////////////////////////////////////////////////////////////////////////

const teacherStudentsTableBody = document.getElementById("teacherStudentsTableBody")

async function loadTeacherPage() {

    if (!teacherStudentsTableBody) { // if its not in teacher.html than stops
        return
    }

    const teacherId = localStorage.getItem("userId")
    const teacherDetails = document.getElementById("teacherDetails")
    const teacherMessage = document.getElementById("teacherMessage") //error message

    //clean old massage and table
    teacherMessage.textContent = "" 
    teacherStudentsTableBody.innerHTML = ""

    try
    {
        // security check - only teachers can access the teacher page, if a student tries to access it, they will be redirected to the home page
        if (localStorage.getItem("userType") !== "teacher") {
            alert("Access restricted: This page is for teachers only.");
            window.location.href = "/home";
            return;
        }
        const teacherResponse = await fetch(`${BASE_URL}/teachers/${teacherId}`)
        const teacher = await teacherResponse.json() //convert the answer from JSON to JS

        if (!teacherResponse.ok) {
            teacherMessage.className = "message error-message"
            teacherMessage.textContent = "Teacher not found"
            return
        }

        teacherDetails.innerHTML = 
        `
            <p>ID: ${teacher.id}</p>
            <p>Name: ${teacher.first_name || ""} ${teacher.last_name || ""}</p> 
            <p>Class: ${teacher.class_name || ""}</p>
        `

        const studentsResponse = await fetch(`${BASE_URL}/teachers/${teacherId}/students`)
        const students = await studentsResponse.json()

        if (!studentsResponse.ok) {
            teacherMessage.className = "message error-message"
            teacherMessage.textContent = "Failed to load students"
            return
        }

        students.forEach(student => {
            teacherStudentsTableBody.innerHTML += `
                <tr>
                    <td>${student.id}</td>
                    <td>${student.first_name || ""}</td>
                    <td>${student.last_name || ""}</td>
                    <td>${student.class_name || ""}</td>
                </tr>
            `
        })
    } 
    catch (error)
    {
        teacherMessage.className = "message error-message"
        teacherMessage.textContent = "Server error"
    }
}

loadTeacherPage()

/////////////////// Student Page //////////////////////////////////////////////////////////////////

const studentIdElement = document.getElementById("studentId")

if (studentIdElement) {

    const id = localStorage.getItem("userId")

    fetch(`${BASE_URL}/students/${id}`)
        .then(response => response.json())
        .then(student => {

            document.getElementById("studentId").textContent =
                `ID: ${student.id}`

            document.getElementById("studentName").textContent =
                `Name: ${student.first_name} ${student.last_name}`

            document.getElementById("studentClass").textContent =
                `Class: ${student.class_name}`
        })
}

/////////////////// Map page ////////////////////////////////////////////////////////////////////////////////////

const mapElement = document.getElementById("map")

if (mapElement) {

    const map = L.map("map").setView([31.7683, 35.2137], 15)

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map)

    // add a layer group above the map to hold the student markers, so we can easily clear them when refreshing the data
    const studentsLayerGroup = L.layerGroup().addTo(map);

    async function loadLocations() {

    // security check - only teachers can access the map page, if a student tries to access it, they will be redirected to the home page
    if (localStorage.getItem("userType") !== "teacher") {
        alert("Access restricted: This page is for teachers only.");
        window.location.href = "/home";
        return;
    }
        const response = await fetch(`${BASE_URL}/locations`)
        const locations = await response.json()   // convert JASON to JS array

        studentsLayerGroup.clearLayers(); // clear existing markers before adding new ones

        locations.forEach(location => 
        {
            L.marker([location.latitude, location.longitude])
                .addTo(studentsLayerGroup)
                .bindTooltip(location.id, { permanent: true, direction: "top"})
        })
    }

    loadLocations()
    setInterval(loadLocations, 60000); // refresh every 60 seconds
}

/////// Students too far away ///////

const farStudentsTableBody = document.getElementById("farStudentsTableBody")

async function loadFarStudents() {

    if (!farStudentsTableBody) {
        return
    }

    const teacherId = localStorage.getItem("userId")

    try {
        const response = await fetch( `${BASE_URL}/teachers/${teacherId}/far-students?max_distance_km=3`)
        const farStudents = await response.json()

        if (!response.ok) {
            return
        }

        farStudentsTableBody.innerHTML = ""

        farStudents.forEach(student => {

            farStudentsTableBody.innerHTML += `
                <tr>
                    <td>${student.id}</td>
                    <td>${student.first_name}</td>
                    <td>${student.last_name}</td>
                    <td>${student.distance_km} km</td>
                </tr>
            `
        })

    } 
    catch (error) {
        console.log("Failed to load far students")
    }
}
loadFarStudents()
setInterval(loadFarStudents, 60000); // refresh every 60 seconds