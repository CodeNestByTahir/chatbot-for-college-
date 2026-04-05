/*
// ============================================================
//  Campus Buddy — Admin Panel JS
// ============================================================

const BACKEND = "http://127.0.0.1:5000";

const ADMIN_LOGIN                = "/admin/login";
const ADMIN_FORGET               = "/admin/forget-password";
const VERIFY_OTP                 = "/admin/verify-otp";
const LOAD_ADD_DEPARTMENT        = "/admin/department";
const UPDATE_DELETE_DEPARTMENT   = "/admin/department-update";
const LOAD_ADD_TEACHER           = "/admin/teacher";
const UPDATE_DELETE_TEACHER      = "/admin/teacher-update";
const LOAD_ADD_ANNOUNCEMENT      = "/admin/announcement";
const UPDATE_DELETE_ANNOUNCEMENT = "/admin/announcement-update";
const LOAD_DELETE_FAILEDREQUEST  = "/admin/failed-request";
const LOAD_ADD_FAQ               = "/admin/faq";
const UPDATE_DELETE_FAQ          = "/admin/faq-update";
const LOAD_ADD_LINKS             = "/admin/important-links";
const UPDATE_DELETE_LINKS        = "/admin/important-links-update";

// DOM References
const authContainer    = document.querySelector(".admin_authentication");
const dashboard        = document.getElementById("after_successfull_login");
const loginForm        = document.getElementById("admin_login");
const forgetForm       = document.getElementById("reset_pass");
const resetForm        = document.getElementById("otp_pass");
const loginBtn         = document.getElementById("lg_btn");
const emailInput       = document.getElementById("login_email");
const passwordInput    = document.getElementById("password");
const requestOTPBtn    = document.getElementById("request_otp");
const resetPasswordBtn = document.getElementById("reset_password_btn");


// ============================================================
// LOGIN
// ============================================================
loginBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    if (!emailInput.value || !passwordInput.value) {
        alert("Please enter the necessary information!");
        return;
    }

    loginBtn.disabled = true;
    const originalText = loginBtn.innerText;
    loginBtn.innerText = "Processing...";

    try {
        const response = await fetch(BACKEND + ADMIN_LOGIN, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: emailInput.value, password: passwordInput.value })
        });
        const data = await response.json();

        if (response.ok && data.status === "success") {
            alert("Login successful! Welcome " + data.user);
            sessionStorage.setItem("isLoggedIn", "true");
            authContainer.style.display = "none";
            dashboard.style.display = "block";
            await loadALL();
        } else {
            alert("Login failed: " + (data.message || "Check your credentials!"));
            loginBtn.disabled = false;
            loginBtn.innerText = originalText;
        }
    } catch (error) {
        alert("Error: Backend is not active!");
        console.error("Login error:", error);
        loginBtn.disabled = false;
        loginBtn.innerText = originalText;
    }
});


// ============================================================
// PREVENT LOSING SESSION ON REFRESH
// ============================================================
window.addEventListener("load", async () => {
    if (sessionStorage.getItem("isLoggedIn") === "true") {
        authContainer.style.display = "none";
        dashboard.style.display = "block";
        await loadALL();
    }
});


// ============================================================
// FORGET PASSWORD
// ============================================================
document.getElementById("forget_password").addEventListener("click", (e) => {
    e.preventDefault();
    loginForm.style.display = "none";
    forgetForm.style.display = "block";
});

requestOTPBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const forgetEmailEl = document.getElementById("reset_email");

    if (!forgetEmailEl.value) {
        alert("Please enter your email!");
        return;
    }

    try {
        const response = await fetch(BACKEND + ADMIN_FORGET, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ forget_email: forgetEmailEl.value })
        });
        const data = await response.json();

        if (response.ok && data.status === "success") {
            alert(data.message + " on your EMAIL!");
            forgetForm.style.display = "none";
            resetForm.style.display = "block";
        } else {
            alert("Please " + data.message);
        }
    } catch (error) {
        console.error("Request OTP error:", error);
    }
});

document.getElementById("back_to_login").addEventListener("click", () => {
    forgetForm.style.display = "none";
    loginForm.style.display = "block";
});


// ============================================================
// RESET PASSWORD (OTP VERIFY)
// ============================================================
resetPasswordBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const resetEmail  = document.getElementById("otp_reset_email").value;
    const otpValue    = document.getElementById("otp").value;
    const newPassword = document.getElementById("new_password").value;

    if (!resetEmail || !otpValue || !newPassword) {
        alert("Please enter the necessary information!");
        return;
    }

    try {
        const response = await fetch(BACKEND + VERIFY_OTP, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reset_email: resetEmail, otp: otpValue, new_password: newPassword })
        });
        const data = await response.json();

        if (response.ok && data.status === "success") {
            alert(data.message);
            resetForm.style.display = "none";
            loginForm.style.display = "block";
        } else {
            alert("Reset password failed: " + data.message);
        }
    } catch (error) {
        console.error("Reset password error:", error);
    }
});


// ============================================================
// DEPARTMENT — LOAD
// ============================================================
async function loadDepartments() {
    try {
        const response = await fetch(BACKEND + LOAD_ADD_DEPARTMENT, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        const result = await response.json();

        if (result.status === "success") {
            const deptTableBody = document.getElementById("department_table_data");
            const deptDropdown  = document.getElementById("teacher_dept_select");

            deptTableBody.innerHTML = "";
            deptDropdown.innerHTML  = `<option value="">Select Department</option>`;

            let deptIndex = 1;
            result.department_data.forEach(dept => {
                deptTableBody.innerHTML += `
                    <tr>
                        <td hidden>${dept.d_id}</td>
                        <td>${deptIndex}</td>
                        <td>${dept.d_name}</td>
                        <td>
                            <div id="action_div">
                                <button class="action-btn edit-btn">EDIT</button>
                                <button class="action-btn delete-btn">DELETE</button>
                            </div>
                        </td>
                    </tr>`;
                deptDropdown.innerHTML += `<option value="${dept.d_id}">${dept.d_name}</option>`;
                deptIndex++;
            });
        }
    } catch (error) {
        console.error("Error fetching departments:", error);
    }
}


// ============================================================
// DEPARTMENT — ADD / UPDATE
// ============================================================
const addDepartmentBtn = document.getElementById("add_department");

addDepartmentBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    if (addDepartmentBtn.innerText === "Add Department") {
        const deptNameEl = document.getElementById("department_name");
        if (!deptNameEl.value.trim()) { alert("Please enter department name!"); return; }

        try {
            const response = await fetch(BACKEND + LOAD_ADD_DEPARTMENT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ department_name: deptNameEl.value.trim() })
            });
            const data = await response.json();
            if (response.ok && data.status === "success") {
                deptNameEl.value = "";
                await loadDepartments();
            } else {
                alert("Error: " + data.message);
            }
        } catch (error) {
            console.error("Error adding department:", error);
        }

    } else if (addDepartmentBtn.innerText === "Update Department") {
        const realID      = document.getElementById("real_department_id").value;
        const updatedName = document.getElementById("department_name").value.trim();

        if (!realID || !updatedName) { alert("Please enter department name!"); return; }

        try {
            const response = await fetch(BACKEND + UPDATE_DELETE_DEPARTMENT, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ real_dept_id: realID, updated_dept: updatedName })
            });
            const data = await response.json();
            if (response.ok && data.status === "success") {
                document.getElementById("department").reset();
                await loadDepartments();
                addDepartmentBtn.innerText = "Add Department";
            } else {
                alert("Error: " + data.message);
            }
        } catch (error) {
            console.error("Error updating department:", error);
        }
    }
});

document.getElementById("department_table_data").addEventListener("click", (e) => {
    if (!e.target.classList.contains("edit-btn")) return;
    e.preventDefault();
    const row = e.target.closest("tr");
    document.getElementById("real_department_id").value = row.cells[0].innerText.trim();
    document.getElementById("department_name").value    = row.cells[2].innerText.trim();
    addDepartmentBtn.innerText = "Update Department";
    document.getElementById("department_name").focus();
});

document.getElementById("department_table_data").addEventListener("click", async (e) => {
    if (!e.target.classList.contains("delete-btn")) return;
    e.preventDefault();
    const row = e.target.closest("tr");
    const real_dept_id = row.cells[0].innerText.trim();

    if (confirm("Do you really want to delete this record?")) {
        if (confirm("Are you sure?")) {
            try {
                const response = await fetch(BACKEND + UPDATE_DELETE_DEPARTMENT, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ real_dept_id })
                });
                const data = await response.json();
                if (response.ok && data.status === "success") {
                    await loadDepartments();
                } else {
                    console.error("Error deleting department:", data.message);
                }
            } catch (error) {
                console.error("Error deleting department:", error);
            }
        }
    }
});


// ============================================================
// TEACHER — LOAD
// ============================================================
async function loadTeacher() {
    try {
        const response = await fetch(BACKEND + LOAD_ADD_TEACHER, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        const result = await response.json();

        if (result.status === "success") {
            const tbody = document.getElementById("teacher_table_data");
            tbody.innerHTML = "";
            let tIndex = 1;
            result.teacher_data.forEach(t => {
                tbody.innerHTML += `
                    <tr>
                        <td hidden>${t.t_id}</td>
                        <td>${tIndex}</td>
                        <td>${t.t_name}</td>
                        <td>${t.t_desig}</td>
                        <td>${t.t_dept_name}</td>
                        <td>${t.t_email}</td>
                        <td>${t.t_contact}</td>
                        <td>
                            <div id="action_div">
                                <button class="action-btn edit-btn">EDIT</button>
                                <button class="action-btn delete-btn">DELETE</button>
                            </div>
                        </td>
                    </tr>`;
                tIndex++;
            });
        }
    } catch (error) {
        console.error("Error loading teachers:", error);
    }
}


// ============================================================
// TEACHER — ADD / UPDATE
// ============================================================
const addTeacherBtn = document.getElementById("add_teacher");

addTeacherBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    if (addTeacherBtn.innerText === "Add Teacher") {
        const name    = document.getElementById("teacher_name").value.trim();
        const desig   = document.getElementById("teacher_designation").value.trim();
        const dept    = document.getElementById("teacher_dept_select").value;
        const email   = document.getElementById("teacher_email").value.trim();
        const contact = document.getElementById("teacher_contact_number").value.trim();

        if (!name || !desig || !dept || !email || !contact) {
            alert("Please fill all fields!");
            return;
        }

        try {
            const response = await fetch(BACKEND + LOAD_ADD_TEACHER, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ teacher_name: name, teacher_desig: desig, teacher_dept_id: dept, teacher_email: email, teacher_contact: contact })
            });
            const data = await response.json();
            if (response.ok && data.status === "success") {
                document.getElementById("teacher_form").reset();
                await loadTeacher();
            } else {
                alert("Error: " + data.message);
            }
        } catch (error) {
            console.error("Error adding teacher:", error);
        }

    } else if (addTeacherBtn.innerText === "Update Teacher") {
        const realID  = document.getElementById("real_teacher_id").value.trim();
        const name    = document.getElementById("teacher_name").value.trim();
        const desig   = document.getElementById("teacher_designation").value.trim();
        const dept    = document.getElementById("teacher_dept_select").value;
        const email   = document.getElementById("teacher_email").value.trim();
        const contact = document.getElementById("teacher_contact_number").value.trim();

        if (!realID || !name || !desig || !dept || !email || !contact) {
            alert("All fields are required!");
            return;
        }

        try {
            const response = await fetch(BACKEND + UPDATE_DELETE_TEACHER, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ real_teacher_id: realID, updated_teacher_name: name, updated_teacher_desig: desig, updated_teacher_email: email, updated_teacher_contact: contact, updated_dept_id: dept })
            });
            const data = await response.json();
            if (response.ok && data.status === "success") {
                addTeacherBtn.innerText = "Add Teacher";
                document.getElementById("teacher_form").reset();
                await loadTeacher();
            } else {
                alert("Error: " + data.message);
            }
        } catch (error) {
            console.error("Error updating teacher:", error);
        }
    }
});

document.getElementById("teacher_table_data").addEventListener("click", (e) => {
    if (!e.target.classList.contains("edit-btn")) return;
    e.preventDefault();
    const row = e.target.closest("tr");
    document.getElementById("real_teacher_id").value       = row.cells[0].innerText;
    document.getElementById("teacher_name").value           = row.cells[2].innerText;
    document.getElementById("teacher_designation").value    = row.cells[3].innerText;

    const deptSelect    = document.getElementById("teacher_dept_select");
    const deptNameInRow = row.cells[4].innerText;
    for (let i = 0; i < deptSelect.options.length; i++) {
        if (deptSelect.options[i].text === deptNameInRow) {
            deptSelect.selectedIndex = i;
            break;
        }
    }

    document.getElementById("teacher_email").value          = row.cells[5].innerText;
    document.getElementById("teacher_contact_number").value = row.cells[6].innerText;
    addTeacherBtn.innerText = "Update Teacher";
    document.getElementById("teacher_name").focus();
});

document.getElementById("teacher_table_data").addEventListener("click", async (e) => {
    if (!e.target.classList.contains("delete-btn")) return;
    e.preventDefault();
    const row    = e.target.closest("tr");
    const realID = row.cells[0].innerText.trim();

    if (confirm("Do you really want to delete this record?")) {
        if (confirm("Are you sure?")) {
            try {
                const response = await fetch(BACKEND + UPDATE_DELETE_TEACHER, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ real_t_id: realID })
                });
                const data = await response.json();
                if (response.ok && data.status === "success") {
                    await loadTeacher();
                } else {
                    alert("Error: " + data.message);
                }
            } catch (error) {
                console.error("Error deleting teacher:", error);
            }
        }
    }
});


// ============================================================
// ANNOUNCEMENT — LOAD
// ============================================================
async function loadAnnouncement() {
    try {
        const response = await fetch(BACKEND + LOAD_ADD_ANNOUNCEMENT, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        const data = await response.json();

        if (response.ok && data.status === "success") {
            const tbody = document.getElementById("announcement_table_data");
            tbody.innerHTML = "";
            data.announcemnet_data.forEach(a => {
                tbody.innerHTML += `
                    <tr>
                        <td hidden>${a.a_id}</td>
                        <td>${a.a_title}</td>
                        <td>${a.a_description}</td>
                        <td>${a.a_end_date}</td>
                        <td>
                            <div id="action_div">
                                <button class="action-btn edit-btn">EDIT</button>
                                <button class="action-btn delete-btn">DELETE</button>
                            </div>
                        </td>
                    </tr>`;
            });
        }
    } catch (error) {
        console.error("Error fetching announcements:", error);
    }
}


// ============================================================
// ANNOUNCEMENT — ADD / UPDATE
// ============================================================
const addAnnouncementBtn = document.getElementById("add_announcement");

addAnnouncementBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    if (addAnnouncementBtn.innerText === "Add Announcement") {
        const title = document.getElementById("title").value.trim();
        const desc  = document.getElementById("description").value.trim();
        const date  = document.getElementById("date").value;

        if (!title || !desc || !date) { alert("Please fill all fields!"); return; }

        try {
            const response = await fetch(BACKEND + LOAD_ADD_ANNOUNCEMENT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ a_title: title, a_description: desc, a_end_date: date })
            });
            const data = await response.json();
            if (response.ok && data.status === "success") {
                document.getElementById("announcement_form").reset();
                await loadAnnouncement();
            } else {
                alert("Error: " + data.message);
            }
        } catch (error) {
            console.error("Error adding announcement:", error);
        }

    } else if (addAnnouncementBtn.innerText === "Update Announcement") {
        const realId = document.getElementById("real_announcement_id").value;
        const title  = document.getElementById("title").value.trim();
        const desc   = document.getElementById("description").value.trim();
        const date   = document.getElementById("date").value;

        if (!realId || !title || !desc || !date) { alert("Enter all fields!"); return; }

        try {
            const response = await fetch(BACKEND + UPDATE_DELETE_ANNOUNCEMENT, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ real_id: realId, new_title: title, new_description: desc, new_date: date })
            });
            const data = await response.json();
            if (response.ok && data.status === "success") {
                addAnnouncementBtn.innerText = "Add Announcement";
                document.getElementById("announcement_form").reset();
                await loadAnnouncement();
            } else {
                alert("Error: " + data.message);
            }
        } catch (error) {
            console.error("Error updating announcement:", error);
        }
    }
});

document.getElementById("announcement_table_data").addEventListener("click", (e) => {
    if (!e.target.classList.contains("edit-btn")) return;
    e.preventDefault();
    const row = e.target.closest("tr");
    document.getElementById("real_announcement_id").value = row.cells[0].innerText;
    document.getElementById("title").value                = row.cells[1].innerText;
    document.getElementById("description").value          = row.cells[2].innerText;
    document.getElementById("date").value                 = row.cells[3].innerText.trim().substring(0, 10);
    addAnnouncementBtn.innerText = "Update Announcement";
    document.getElementById("title").focus();
});

document.getElementById("announcement_table_data").addEventListener("click", async (e) => {
    if (!e.target.classList.contains("delete-btn")) return;
    e.preventDefault();
    const row   = e.target.closest("tr");
    const anmtId = row.cells[0].innerText;

    if (confirm("Do you really want to delete this record?")) {
        try {
            const response = await fetch(BACKEND + UPDATE_DELETE_ANNOUNCEMENT, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ real_a_id: anmtId })
            });
            const data = await response.json();
            if (response.ok && data.status === "success") {
                await loadAnnouncement();
            } else {
                alert("Error: " + data.message);
            }
        } catch (error) {
            console.error("Error deleting announcement:", error);
        }
    }
});


// ============================================================
// FAILED REQUESTS — LOAD
// ============================================================
async function loadFailedRequest() {
    try {
        const response = await fetch(BACKEND + LOAD_DELETE_FAILEDREQUEST, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        const data = await response.json();

        if (response.ok && data.status === "success") {
            const tbody = document.getElementById("failed_request_table_data");
            tbody.innerHTML = "";
            let index = 1;
            data.fr_data.forEach(f => {
                tbody.innerHTML += `
                    <tr>
                        <td hidden>${f.fr_id}</td>
                        <td>${index}</td>
                        <td>${f.fr_student_request}</td>
                        <td>
                            <div id="action_div">
                                <button class="action-btn edit-btn">ADD TO FAQ</button>
                                <button class="action-btn delete-btn">DELETE</button>
                            </div>
                        </td>
                    </tr>`;
                index++;
            });
        }
    } catch (error) {
        console.error("Error fetching failed requests:", error);
    }
}

document.getElementById("failed_request_table_data").addEventListener("click", async (e) => {
    if (!e.target.classList.contains("edit-btn")) return;
    e.preventDefault();
    const row  = e.target.closest("tr");
    const fr   = row.cells[2].innerText;
    const frId = row.cells[0].innerText.trim();

    try {
        const response = await fetch(BACKEND + LOAD_DELETE_FAILEDREQUEST, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fr_id: frId })
        });
        const data = await response.json();
        if (response.ok && data.status === "success") {
            document.getElementById("question").value = fr;
            document.getElementById("question").focus();
            alert("Request moved to FAQ input. Please provide an answer!");
            await loadFailedRequest();
        } else {
            alert("Error: " + data.message);
        }
    } catch (error) {
        console.error("Error moving failed request to FAQ:", error);
    }
});

document.getElementById("failed_request_table_data").addEventListener("click", async (e) => {
    if (!e.target.classList.contains("delete-btn")) return;
    e.preventDefault();
    const row  = e.target.closest("tr");
    const frId = row.cells[0].innerText.trim();

    if (confirm("Do you really want to delete this record?")) {
        try {
            const response = await fetch(BACKEND + LOAD_DELETE_FAILEDREQUEST, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fr_id: frId })
            });
            const data = await response.json();
            if (response.ok && data.status === "success") {
                await loadFailedRequest();
            } else {
                console.error("Error deleting failed request:", data.message);
            }
        } catch (error) {
            console.error("Error deleting failed request:", error);
        }
    }
});


// ============================================================
// FAQ — LOAD
// ============================================================
async function loadFAQ() {
    try {
        const response = await fetch(BACKEND + LOAD_ADD_FAQ, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        const data = await response.json();

        if (response.ok && data.status === "success") {
            const tbody = document.getElementById("faq_table_data");
            tbody.innerHTML = "";
            let index = 1;
            data.faq_data.forEach(fq => {
                tbody.innerHTML += `
                    <tr>
                        <td hidden>${fq.f_id}</td>
                        <td>${index}</td>
                        <td>${fq.f_question}</td>
                        <td>${fq.f_answer}</td>
                        <td>${fq.f_intents}</td>
                        <td>
                            <div id="action_div">
                                <button class="action-btn edit-btn">EDIT</button>
                                <button class="action-btn delete-btn">DELETE</button>
                            </div>
                        </td>
                    </tr>`;
                index++;
            });
        }
    } catch (error) {
        console.error("Error fetching FAQ:", error);
    }
}


// ============================================================
// FAQ — ADD / UPDATE
// ============================================================
const addFAQBtn = document.getElementById("add_faq");

addFAQBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    if (addFAQBtn.innerText === "Add FAQ") {
        const question = document.getElementById("question").value.trim();
        const answer   = document.getElementById("answer").value.trim();
        const intents  = document.getElementById("intents").value.trim();

        if (!question || !answer || !intents) { alert("Please enter all fields!"); return; }

        try {
            const response = await fetch(BACKEND + LOAD_ADD_FAQ, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ f_question: question, f_answer: answer, f_intents: intents })
            });
            const data = await response.json();
            if (response.ok && data.status === "success") {
                document.getElementById("faq_form").reset();
                await loadFAQ();
            } else {
                alert("Error: " + data.message);
            }
        } catch (error) {
            console.error("Error adding FAQ:", error);
        }

    } else if (addFAQBtn.innerText === "Update FAQ") {
        const rId      = document.getElementById("real_faq_id").value.trim();
        const question = document.getElementById("question").value.trim();
        const answer   = document.getElementById("answer").value.trim();
        const intents  = document.getElementById("intents").value.trim();

        if (!rId || !question || !answer || !intents) { alert("All fields are required!"); return; }

        try {
            const response = await fetch(BACKEND + UPDATE_DELETE_FAQ, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ f_id: rId, new_question: question, new_answer: answer, new_intents: intents })
            });
            const data = await response.json();
            if (response.ok && data.status === "success") {
                document.getElementById("faq_form").reset();
                addFAQBtn.innerText = "Add FAQ";
                await loadFAQ();
            } else {
                alert("Error: " + data.message);
            }
        } catch (error) {
            console.error("Error updating FAQ:", error);
        }
    }
});

document.getElementById("faq_table_data").addEventListener("click", (e) => {
    if (!e.target.classList.contains("edit-btn")) return;
    e.preventDefault();
    const row = e.target.closest("tr");
    document.getElementById("real_faq_id").value = row.cells[0].innerText;
    document.getElementById("question").value    = row.cells[2].innerText;
    document.getElementById("answer").value      = row.cells[3].innerText;
    document.getElementById("intents").value     = row.cells[4].innerText;
    addFAQBtn.innerText = "Update FAQ";
    document.getElementById("question").focus();
});

document.getElementById("faq_table_data").addEventListener("click", async (e) => {
    if (!e.target.classList.contains("delete-btn")) return;
    e.preventDefault();
    const row   = e.target.closest("tr");
    const faqId = row.cells[0].innerText.trim();

    if (confirm("Do you really want to delete this record?")) {
        try {
            const response = await fetch(BACKEND + UPDATE_DELETE_FAQ, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ f_real_id: faqId })
            });
            const data = await response.json();
            if (response.ok && data.status === "success") {
                await loadFAQ();
            } else {
                alert("Error: " + data.message);
            }
        } catch (error) {
            console.error("Error deleting FAQ:", error);
        }
    }
});


// ============================================================
// IMPORTANT LINKS — LOAD
// ============================================================
async function loadLinks() {
    try {
        const response = await fetch(BACKEND + LOAD_ADD_LINKS, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        const data = await response.json();

        if (response.ok && data.status === "success") {
            const tbody = document.getElementById("links_table_data");
            tbody.innerHTML = "";
            let index = 1;
            data.links_data.forEach(link => {
                tbody.innerHTML += `
                    <tr>
                        <td hidden>${link.il_id}</td>
                        <td>${index}</td>
                        <td>${link.il_name}</td>
                        <td>
                            <a href="${link.il_url}" target="_blank" style="color:#91b0ff;">
                                ${link.il_url}
                            </a>
                        </td>
                        <td>
                            <div id="action_div">
                                <button class="action-btn edit-btn">EDIT</button>
                                <button class="action-btn delete-btn">DELETE</button>
                            </div>
                        </td>
                    </tr>`;
                index++;
            });
        }
    } catch (error) {
        console.error("Error fetching links:", error);
    }
}


// ============================================================
// IMPORTANT LINKS — ADD / UPDATE
// ============================================================
const addLinkBtn = document.getElementById("add_link");

addLinkBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const linkName = document.getElementById("link_name").value.trim();
    const linkUrl  = document.getElementById("link_url").value.trim();

    if (!linkName || !linkUrl) { alert("Link name and URL both are required!"); return; }

    if (addLinkBtn.innerText === "Add Link") {
        try {
            const response = await fetch(BACKEND + LOAD_ADD_LINKS, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ link_name: linkName, link_url: linkUrl })
            });
            const data = await response.json();
            if (response.ok && data.status === "success") {
                document.getElementById("links_form").reset();
                await loadLinks();
            } else {
                alert("Error: " + data.message);
            }
        } catch (error) {
            console.error("Error adding link:", error);
        }

    } else if (addLinkBtn.innerText === "Update Link") {
        const realId = document.getElementById("real_link_id").value.trim();
        if (!realId) { alert("Link ID not found!"); return; }

        try {
            const response = await fetch(BACKEND + UPDATE_DELETE_LINKS, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ real_link_id: realId, new_link_name: linkName, new_link_url: linkUrl })
            });
            const data = await response.json();
            if (response.ok && data.status === "success") {
                document.getElementById("links_form").reset();
                addLinkBtn.innerText = "Add Link";
                await loadLinks();
            } else {
                alert("Error: " + data.message);
            }
        } catch (error) {
            console.error("Error updating link:", error);
        }
    }
});

document.getElementById("links_table_data").addEventListener("click", (e) => {
    if (!e.target.classList.contains("edit-btn")) return;
    e.preventDefault();
    const row = e.target.closest("tr");
    document.getElementById("real_link_id").value = row.cells[0].innerText.trim();
    document.getElementById("link_name").value    = row.cells[2].innerText.trim();
    document.getElementById("link_url").value     = row.cells[3].querySelector("a").href;
    addLinkBtn.innerText = "Update Link";
    document.getElementById("link_name").focus();
});

document.getElementById("links_table_data").addEventListener("click", async (e) => {
    if (!e.target.classList.contains("delete-btn")) return;
    e.preventDefault();
    const row    = e.target.closest("tr");
    const realId = row.cells[0].innerText.trim();

    if (confirm("Do you really want to delete this link?")) {
        try {
            const response = await fetch(BACKEND + UPDATE_DELETE_LINKS, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ real_link_id: realId })
            });
            const data = await response.json();
            if (response.ok && data.status === "success") {
                await loadLinks();
            } else {
                alert("Error: " + data.message);
            }
        } catch (error) {
            console.error("Error deleting link:", error);
        }
    }
});


// ============================================================
// LOAD ALL — called after login / page refresh
// ============================================================
async function loadALL() {
    await loadDepartments();
    await loadTeacher();
    await loadAnnouncement();
    await loadFailedRequest();
    await loadFAQ();
    await loadLinks();
}
*/






const BACKEND = "http://127.0.0.1:5000";
const ADMIN_LOGIN = "/admin/login";
const ADMIN_FORGET = "/admin/forget-password";

const authContainer = document.querySelector('.admin_authentication');
const dashboard = document.getElementById('after_successfull_login');

const loginBtn = document.getElementById('lg_btn');
const emailInput = document.getElementById('login_email');
const resetEmail = document.getElementById("reset_email");
const passwordInput = document.getElementById('password');
const loginForm = document.getElementById("admin_login");
const forgetForm = document.getElementById("reset_pass");
const requestOTPBtn = document.getElementById("request_otp")
const resetForm = document.getElementById("otp_pass");
const resetPasswordBtn = document.getElementById("reset_password_btn")


// 1. Added 'click' event type
// 2. Added 'async' so we can use await

loginBtn.addEventListener('click', async (e) => {
    e.preventDefault(); // Prevents the form from refreshing the page

    const credential = {
        "email": emailInput.value,
        "password": passwordInput.value
    };
    if (emailInput.value != "" && passwordInput.value != "") {
        loginBtn.disabled = true
        const originalText = loginBtn.innerText;
        loginBtn.innerText = "Processing..."
        try {
            const response = await fetch(BACKEND + ADMIN_LOGIN, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credential)
            });

            const data = await response.json();

            if (response.ok && data.status === "success") {
                alert("Login successful! Welcome " + data.user);
                sessionStorage.setItem("isLoggedIn", "true")
                authContainer.style.display = 'none';
                dashboard.style.display = 'block';

                await loadALL()

            } else {
                alert("Login failed: Check your Internet Connection!");
                loginBtn.disabled = false;
                loginBtn.innerText = originalText;
            }
        } catch (error) {
            alert("Error : Probably backend is not Active")
            console.error("Error in login section:", error);
            loginBtn.disabled = false;
            loginBtn.innerText = originalText;
        }
    } else {
        alert("Please enter the neccessary information!")
        loginBtn.disabled = false;
        loginBtn.innerText = originalText;
    }
});

//preventing user to refresh page after login
window.addEventListener('load', async () => {
    const session = sessionStorage.getItem("isLoggedIn")
    if (session === "true") {
        authContainer.style.display = "none";
        dashboard.style.display = "block";

        await loadALL()
    }
})

//handling forget password section with backend
document.getElementById('forget_password').addEventListener('click', (e) => {
    e.preventDefault()
    loginForm.style.display = 'none';
    document.getElementById('reset_pass').style.display = 'block';
});

requestOTPBtn.addEventListener("click", async (e) => {
    e.preventDefault()

    const forget_email = document.getElementById("reset_email")
    const forgetEmail = {
        "forget_email": forget_email.value
    }
    if (forget_email.value != "") {
        try {
            const response = await fetch(BACKEND + ADMIN_FORGET, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(forgetEmail)
            })

            const data = await response.json()

            if (response.ok && data.status === "success") {
                alert(data.message + " on your EMAIL!")
                forgetForm.style.display = "none"
                resetForm.style.display = "block"
            } else {
                alert("Please " + data.message)
                console.log(data.message)
            }
        } catch (error) {
            console.error("error in request OTP : ", error)
        }
    } else {
        alert("Please enter the neccessary information!")
    }
})

document.getElementById("back_to_login").addEventListener('click', () => {
    forgetForm.style.display = 'none';
    loginForm.style.display = "block";
})

//verifying otp to changing password
const VERIFY_OTP = "/admin/verify-otp"
resetPasswordBtn.addEventListener('click', async (e) => {
    e.preventDefault()
    forgetForm.style.display = "none"
    resetForm.style.display = "block"
    const resetCredential = {
        "reset_email": resetEmail.value,
        "otp": otp.value,
        "new_password": new_password.value
    }

    if (resetEmail.value !== "" && otp.value !== "" && new_password.value !== "") {
        try {
            const response = await fetch(BACKEND + VERIFY_OTP, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(resetCredential)
            })

            const data = await response.json()

            if (response.ok && data.status === "success") {
                alert(data.message)
                forgetForm.style.display = "none"
                resetForm.style.display = "none"
                loginForm.style.display = "block"
            } else {
                alert("Reset password failed : " + data.message)
            }
        } catch (error) {
            console.error("error in reset password : " + error)
        }
    } else {
        alert("Please enter the neccessary information!")
    }

})


//department variable for select tag inside teacher table

const LOAD_ADD_DEPARTMENT = "/admin/department";
async function loadDepartments() {
    try {
        const response = await fetch(BACKEND + LOAD_ADD_DEPARTMENT, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const result = await response.json()

        if (result.status === "success") {
            const deptTableBody = document.getElementById("department_table_data")
            const deptDropdown = document.getElementById("teacher_dept_select")

            deptTableBody.innerHTML = ""
            deptDropdown.innerHTML = `<option value="">Select Department</option>`;
            let dept_id = 1
            result.department_data.forEach(dept => {

                const row = `<tr>
                                    <td hidden>${dept.d_id}</td>
                                    <td>${dept_id}</td>
                                    <td>${dept.d_name}</td>
                                    <td>
                                        <div id='action_div'>
                                                <button class="action-btn edit-btn">EDIT</button>
                                                <button class="action-btn delete-btn">DELETE</button>
                                        </div>
                                    </td>
                                </tr>`;

                deptTableBody.innerHTML += row


                deptDropdown.innerHTML += `<option value ="${dept.d_id}">${dept.d_name}</option>`;

                dept_id++;
            })
        } else {
            console.error("Failed to load departments : ", result.message)
        }
    } catch (error) {
        console.error(`Error while fetching departments : ${error}`)
    }
}

// adding department and updating department
const addDepartmentBtn = document.getElementById("add_department")
addDepartmentBtn.addEventListener('click', async (e) => {
    e.preventDefault()

    if (addDepartmentBtn.innerText === "Add Department") {
        const DepartmentName = document.getElementById("department_name")

        const DepartmentData = {
            "department_name": DepartmentName.value
        }

        if (DepartmentName.value != "") {
            try {
                const response = await fetch(BACKEND + LOAD_ADD_DEPARTMENT, {
                    method: "POST",
                    headers: {
                        'Content-Type': "application/json"
                    },
                    body: JSON.stringify(DepartmentData)
                })
                const data = await response.json()

                if (response.ok && data.status === "success") {

                    DepartmentName.value = ''
                    await loadDepartments()
                }

            } catch (error) {
                console.error("error ", data.message)
            }
        } else {
            alert("Please enter department Name!")
        }
    } else if (addDepartmentBtn.innerText === "Update Department") {
        const realID = document.getElementById("real_department_id").value;
        const updatedDeptName = document.getElementById("department_name").value.trim();

        if (realID && updatedDeptName) {
            const updatedDept = {
                "real_dept_id": realID,
                "updated_dept": updatedDeptName
            }

            try {
                const response = await fetch(BACKEND + UPDATE_DELETE_DEPARTMENT, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(updatedDept)
                })

                const data = await response.json()
                if (response.ok && data.status === "success") {
                    document.getElementById("department").reset()
                    alert("Department Updated!")
                    await loadDepartments()
                    addDepartmentBtn.innerText = "Add Department"
                }

            } catch (error) {
                console.error("Error while editing department:", error)
            }
        } else {
            alert("PLease enter Department Name!")
        }
    }
})

//handling edit department section adding row data into input feilds
const UPDATE_DELETE_DEPARTMENT = "/admin/department-update"
document.getElementById("department_table_data").addEventListener('click', async (e) => {
    const editBtn = e.target.classList.contains("edit-btn")
    if (!editBtn)
        return
    e.preventDefault()

    const row = e.target.closest("tr")

    document.getElementById("real_department_id").value = row.cells[0].innerText.trim()
    document.getElementById("department_name").value = row.cells[2].innerText.trim()
    document.getElementById("add_department").innerText = "Update Department"

    document.getElementById("department_name").focus()

})

// handling delete department section
document.getElementById("department_table_data").addEventListener("click", async (e) => {
    const deleteBtn = e.target.classList.contains("delete-btn")
    if (!deleteBtn)
        return
    e.preventDefault()

    const row = e.target.closest("tr")
    const real_dept_id = {
        "real_dept_id": row.cells[0].innerText.trim()
    }
    if (confirm("Do you really want to delete this record?")) {
        if (confirm("Are you sure, you want to delete this record?")) {
            try {
                const response = await fetch(BACKEND + UPDATE_DELETE_DEPARTMENT, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(real_dept_id)
                })

                const data = await response.json()
                if (response.ok && data.status === "success") {
                    alert("Department deleted successuly!")
                    await loadDepartments()
                } else {
                    console.error("Error while deleting department!:", data.message)
                }
            } catch (error) {
                console.error("Error in deleting department", error)
            }
        }
    }
})

//Loading and adding teacher section
const LOAD_ADD_TEACHER = "/admin/teacher"
async function loadTeacher() {
    try {
        const response = await fetch(BACKEND + LOAD_ADD_TEACHER, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json"
            }
        })

        const result = await response.json()
        if (result.status === "success" && response.ok) {
            const teacherTableBody = document.getElementById("teacher_table_data")
            teacherTableBody.innerHTML = ""
            let t_id = 1;
            result.teacher_data.forEach(teacher => {
                const row = `<tr>
                                    <td hidden>${teacher.t_id}</td>
                                    <td>${t_id}</td>
                                    <td>${teacher.t_name}</td>
                                    <td>${teacher.t_desig}</td>
                                    <td>${teacher.t_dept_name}</td>
                                    <td>${teacher.t_email}</td>
                                    <td>${teacher.t_contact}</td>
                                    <td>
                                        <div id='action_div'>
                                                <button class="action-btn edit-btn">EDIT</button>
                                                <button class="action-btn delete-btn">DELETE</button>
                                        </div>
                                    </td>
                                </tr>`

                teacherTableBody.innerHTML += row
                t_id++;
            })
        } else {
            console.log("Failed to load teachers :", result.message)
        }
    } catch (error) {
        console.error()
    }
}

//handling teacher add and update section
const addTeacherBtn = document.getElementById("add_teacher")
addTeacherBtn.addEventListener('click', async (e) => {
    e.preventDefault()

    if (addTeacherBtn.innerText === "Add Teacher") {
        const TeacherName = document.getElementById("teacher_name").value
        const TeacherDesignation = document.getElementById("teacher_designation").value
        const TeacherDepartment = document.getElementById("teacher_dept_select").value
        const TeacherEmail = document.getElementById("teacher_email").value
        const TeacherContact = document.getElementById("teacher_contact_number").value

        if (TeacherName && TeacherDesignation && TeacherDepartment && TeacherEmail && TeacherContact) {
            const teacherData = {
                "teacher_name": TeacherName,
                "teacher_desig": TeacherDesignation,
                "teacher_dept_id": TeacherDepartment,
                "teacher_email": TeacherEmail,
                "teacher_contact": TeacherContact
            }

            try {
                const response = await fetch(BACKEND + LOAD_ADD_TEACHER, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(teacherData)
                })

                const data = await response.json()
                if (response.ok && data.status === "success") {
                    alert("Teacher added Successfully!")
                    document.getElementById("teacher_form").reset()
                    await loadTeacher()
                } else {
                    alert("Error : ", data.message)
                }
            } catch (error) {
                console.error("Error while adding teacher : ")
            }
        } else {
            alert("Please fill all feilds!")
        }
    } else if (addTeacherBtn.innerText = "Update Teacher") {
        const RealID = document.getElementById("real_teacher_id").value.trim()
        const TeacherName = document.getElementById("teacher_name").value
        const TeacherDesignation = document.getElementById("teacher_designation").value
        const TeacherDepartment = document.getElementById("teacher_dept_select").value
        const TeacherEmail = document.getElementById("teacher_email").value
        const TeacherContact = document.getElementById("teacher_contact_number").value

        if (RealID && TeacherName && TeacherDesignation && TeacherDepartment && TeacherEmail && TeacherContact) {
            const updatedTeacherData = {
                "real_teacher_id": RealID,
                "updated_teacher_name": TeacherName,
                "updated_teacher_desig": TeacherDesignation,
                "updated_teacher_email": TeacherEmail,
                "updated_teacher_contact": TeacherContact,
                "updated_dept_id": TeacherDepartment
            }

            try {
                const response = await fetch(BACKEND + UPDATE_DELETE_TEACHER, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(updatedTeacherData)
                })

                const data = await response.json()
                if (response.ok && data.status === "success") {
                    document.getElementById("add_teacher").innerText = "Add Teacher"
                    alert("Updated teacher data!")
                    document.getElementById("teacher_form").reset()
                    await loadTeacher()
                } else {
                    alert("Error during updating teacher data : ", data.message)
                }

            } catch (error) {
                console.error("error while updating teacher:", error)
            }
        } else {
            alert("All feilds are required!")
        }
    }
})

//handling edit teacher section
const UPDATE_DELETE_TEACHER = "/admin/teacher-update"
document.getElementById("teacher_table_data").addEventListener('click', async (e) => {
    const editBtn = e.target.classList.contains("edit-btn")
    if (!editBtn)
        return
    e.preventDefault()

    const row = e.target.closest("tr")

    document.getElementById("real_teacher_id").value = row.cells[0].innerText
    document.getElementById("teacher_name").value = row.cells[2].innerText
    document.getElementById("teacher_designation").value = row.cells[3].innerText

    const deptSelect = document.getElementById("teacher_dept_select")
    const deptNameInTable = row.cells[4].innerText

    for (let i = 0; i < deptSelect.options.length; i++) {
        if (deptSelect.options[i].text === deptNameInTable) {
            deptSelect.selectedIndex = i;
            break;
        }
    }

    document.getElementById("teacher_email").value = row.cells[5].innerText
    document.getElementById("teacher_contact_number").value = row.cells[6].innerText

    document.getElementById("teacher_name").focus()
    document.getElementById("add_teacher").innerText = "Update Teacher"

})

//handling teacher delete section
document.getElementById("teacher_table_data").addEventListener('click', async (e) => {
    const deleteBtn = e.target.classList.contains("delete-btn")

    if (!deleteBtn)
        return

    e.preventDefault()
    const row = e.target.closest("tr")

    const realID = {
        "real_t_id": row.cells[0].innerText.trim()
    }
    if (confirm("Do you really want to delete this record?")) {
        if (confirm("Are you sure, you want to delete this record?")) {
            try {
                const response = await fetch(BACKEND + UPDATE_DELETE_TEACHER, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(realID)
                })

                const data = await response.json()
                if (response.ok && data.status === "success") {
                    alert("Teacher record is deleted!")
                    await loadTeacher()
                } else {
                    alert("Error during deleting teacher record! :", data.message)
                }
            } catch (error) {
                console.error("Error during deleting teacher : ", error)
            }
        }
    }

})

//announcement route calling
const LOAD_ADD_ANNOUNCEMENT = "/admin/announcement"
async function loadAnnouncement() {
    try {
        const response = await fetch(BACKEND + LOAD_ADD_ANNOUNCEMENT, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        const data = await response.json()
        if (response.ok && data.status === "success") {
            const announcementTableBody = document.getElementById("announcement_table_data")
            announcementTableBody.innerHTML = ""
            data.announcemnet_data.forEach(a => {
                const row = `<tr>
                                <td hidden>${a.a_id}</td>
                                <td>${a.a_title}</td>
                                <td>${a.a_description}</td>
                                <td>${a.a_end_date.split("00:")[0]}</td>
                                <td>
                                    <div id="action_div">
                                        <button class="action-btn edit-btn">EDIT</button>
                                        <button class="action-btn delete-btn">DELETE</button>
                                    </div>
                                </td>
                            </tr>`
                announcementTableBody.innerHTML += row

            })
        } else {
            console.error("Failed to load Announcments : ", data.message)
        }
    } catch (error) {
        console.error("error while fetching announcments :", error)
    }
}

//adding announcements 
const addAnnouncementBtn = document.getElementById("add_announcement")
addAnnouncementBtn.addEventListener('click', async (e) => {
    e.preventDefault()
    if (addAnnouncementBtn.innerText === "Add Announcement") {
        const Title = document.getElementById("title").value
        const Description = document.getElementById("description").value
        const Date = document.getElementById("date").value
        try {
            if (Title && Description && Date) {
                const announcement_date = {
                    "a_title": Title,
                    "a_description": Description,
                    "a_end_date": Date
                }

                const response = await fetch(BACKEND + LOAD_ADD_ANNOUNCEMENT, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(announcement_date)
                })

                const data = await response.json()
                if (response.ok && data.status === "success") {
                    alert(data.message)
                    document.getElementById("announcement_form").reset()
                    await loadAnnouncement()
                } else {
                    alert("Error while adding announcement : ", data.message)
                    console.error("announcment error: ", data.message)
                }

            } else {
                alert("Please fill all the feilds")
            }
        } catch (error) {
            console.error("Error accored while adding announcment :", error)
        }
    } else if (addAnnouncementBtn.innerText === "Update Announcement") {
        try {
            const realAId = document.getElementById("real_announcement_id").value
            const Title = document.getElementById("title").value
            const Description = document.getElementById("description").value
            const DateVal = document.getElementById("date").value

            if (realAId && Title && Description && date) {
                const ancmt = {
                    "real_id": realAId,
                    "new_title": Title,
                    "new_description": Description,
                    "new_date": DateVal
                }

                const response = await fetch(BACKEND + UPDATE_DELETE_ANNOUNCEMENT, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(ancmt)
                })

                const data = await response.json()
                if (response.ok && data.status === "success") {
                    addAnnouncementBtn.innerText = "Add Announcement"
                    alert("Announcement updated Successfuly!")
                    document.getElementById("announcement_form").reset()
                    await loadAnnouncement()

                } else {
                    alert("Error during updating announcment!: " + data.message)
                }
            } else {
                alert("Enter all feilds!")
            }
        } catch (error) {
            console.error("Error during updating announcement :", error)
        }
    }
})

//handling edit and delete operation of announcement
const UPDATE_DELETE_ANNOUNCEMENT = "/admin/announcement-update"
document.getElementById("announcement_table_data").addEventListener('click', async (e) => {
    const editBtn = e.target.classList.contains("edit-btn")
    if (!editBtn)
        return
    e.preventDefault()
    const row = e.target.closest("tr")

    document.getElementById("real_announcement_id").value = row.cells[0].innerText
    document.getElementById("title").value = row.cells[1].innerText
    document.getElementById("description").value = row.cells[2].innerText
    const rowdate = row.cells[3].innerText
    document.getElementById("date").value = new Date(rowdate).toISOString().split('T')[0]

    document.getElementById("real_announcement_id").focus()
    document.getElementById("add_announcement").innerText = "Update Announcement"
})

//handling delete announcement
document.getElementById("announcement_table_data").addEventListener('click', async (e) => {
    const deleteBtn = e.target.classList.contains("delete-btn")
    if (!deleteBtn)
        return
    e.preventDefault()

    const row = e.target.closest("tr")

    const anmtData = {
        "real_a_id": row.cells[0].innerText
    }

    if (confirm("Do you really want to delete this record?")) {
        try {
            const response = await fetch(BACKEND + UPDATE_DELETE_ANNOUNCEMENT, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(anmtData)
            })

            const data = await response.json()
            if (response.ok && data.status === "success") {
                alert("Announcement deleted successfuly!")
                await loadAnnouncement()
            } else {
                alert("Error during deleting announcement :" + data.message)
            }
        } catch (error) {
            console.error("Error during deleting announcement : " + error)
        }
    }
})

//Failed request route
const LOAD_DELETE_FAILEDREQUEST = "/admin/failed-request"
async function loadFailedRequest() {
    try {
        const response = await fetch(BACKEND + LOAD_DELETE_FAILEDREQUEST, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        const data = await response.json()
        if (response.ok && data.status === "success") {
            const frTableBody = document.getElementById("failed_request_table_data")
            frTableBody.innerHTML = ""
            let index = 1
            data.fr_data.forEach(f => {
                const row = `<tr>
                                <td hidden>${f.fr_id}</td>
                                <td>${index}</td>
                                <td>${f.fr_student_request}</td>
                                <td>
                                    <div id="action_div">
                                        <button class="action-btn edit-btn">ADD TO FAQ</button>
                                        <button class="action-btn delete-btn">DELETE</button>
                                    </div>
                                </td>
                            </tr>`
                frTableBody.innerHTML += row
                index += 1
            })
        } else {
            alert("error while loading failed request : ", data.message)
        }
    } catch (error) {
        console.error("Error during loading failed request:", error)
    }
}

//handling failed request add to faq section
document.getElementById("failed_request_table_data").addEventListener('click', async (e) => {
    const addToFaqBtn = e.target.classList.contains("edit-btn")
    if (!addToFaqBtn)
        return
    e.preventDefault()
    const row = e.target.closest("tr")
    const fr = row.cells[2].innerText
    const f = {
        "fr_id": row.cells[0].innerText.trim()
    }

    try {
        const response = await fetch(BACKEND + LOAD_DELETE_FAILEDREQUEST, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(f)
        })

        const data = await response.json()

        if (response.ok && data.status === "success") {
            document.getElementById("question").value = fr
            document.getElementById("question").focus()
            alert("Request moved to FAQ input. Please provide an answer!");
            await loadFailedRequest()
        } else {
            alert("Error During adding Failed request into FAQ : " + data.message)
        }
    } catch (error) {
        console.error("Error during adding failed request to FAQ :" + error)
    }

})


//handling failed request delete section

document.getElementById("failed_request_table_data").addEventListener("click", async (e) => {
    if (e.target.classList.contains("delete-btn")) {
        const row = e.target.closest("tr")
        const realID = {
            "fr_id": row.cells[0].innerText.trim()
        }

        if (confirm("Do you really want delete this record?")) {
            try {
                const response = await fetch(BACKEND + LOAD_DELETE_FAILEDREQUEST, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(realID)
                })

                const data = await response.json()

                if (response.ok && data.status === "success") {
                    alert("failed request deleted!")
                    await loadFailedRequest()
                }
                else {
                    console.error("error during deleting failed request", data.message)
                }
            } catch (error) {
                console.error("error during deleting failed request :", error)
            }
        }
    }
})


//FAQ route
const LOAD_ADD_FAQ = "/admin/faq"
async function loadFAQ() {
    try {
        const response = await fetch(BACKEND + LOAD_ADD_FAQ, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })

        const data = await response.json()
        if (response.ok && data.status === "success") {
            const faqTableBody = document.getElementById("faq_table_data")
            faqTableBody.innerHTML = ""
            let index = 1
            data.faq_data.forEach(fq => {
                const row = `<tr>
                                <td hidden>${fq.f_id}</td>
                                <td>${index}</td>
                                <td>${fq.f_question}</td>
                                <td>${fq.f_answer}</td>
                                <td>${fq.f_intents}</td>
                                <td>
                                    <div id="action_div">
                                        <button class="action-btn edit-btn">EDIT</button>
                                        <button class="action-btn delete-btn">DELETE</button>
                                    </div>
                                </td>
                            </tr>`
                faqTableBody.innerHTML += row
                index++;
            })
        } else {
            alert("Error while loading faq data :", data.message)
        }
    } catch (error) {
        console.error("Error while fetching faq :", error)
    }
}

const addFAQBtn = document.getElementById("add_faq")
addFAQBtn.addEventListener('click', async (e) => {
    e.preventDefault()

    if (addFAQBtn.innerText == "Add FAQ") {
        try {
            const Question = document.getElementById("question").value
            const Answer = document.getElementById("answer").value
            const Intents = document.getElementById("intents").value

            if (Question && Answer && Intents) {
                const faq_data = {
                    "f_question": Question,
                    "f_answer": Answer,
                    "f_intents": Intents
                }

                const response = await fetch(BACKEND + LOAD_ADD_FAQ, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(faq_data)
                })

                const data = await response.json()
                if (response.ok && data.status === "success") {
                    alert("FAQ added!")
                    document.getElementById("faq_form").reset()
                    await loadFAQ()
                } else {
                    alert("error during adding FAQ :" + data.message)
                    console.error("Error during adding FAQ :", data.message)
                }
            } else {
                alert("Please enter all feilds!")
            }
        } catch (error) {
            console.error(error)
        }
    } else if (addFAQBtn.innerText == "Update FAQ") {
        const rId = document.getElementById("real_faq_id").value.trim()
        const newQuestion = document.getElementById("question").value.trim()
        const newAnswer = document.getElementById("answer").value.trim()
        const newIntents = document.getElementById("intents").value.trim()

        if (rId && newQuestion && newAnswer && newIntents) {

            const new_faq = {
                "f_id": rId,
                "new_question": newQuestion,
                "new_answer": newAnswer,
                "new_intents": newIntents
            }

            try {
                const response = await fetch(BACKEND + UPDATE_DELETE_FAQ, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(new_faq)
                })

                const data = await response.json()

                if (response.ok && data.status === "success") {
                    alert("Record has been updated")
                    document.getElementById("faq_form").reset()
                    addFAQBtn.innerText = "Add FAQ"
                    await loadFAQ()
                } else {
                    alert("Error during updating Faq!:" + data.message)
                }
            } catch (error) {
                console.error("Error during updating faq :" + error)
            }
        } else {
            alert("All fields are required!")
        }

    }
})

//handling edit and delete section of faq
const UPDATE_DELETE_FAQ = "/admin/faq-update"
document.getElementById("faq_table_data").addEventListener('click', async (e) => {
    const editBtn = e.target.classList.contains("edit-btn")
    if (!editBtn)
        return
    e.preventDefault()

    const row = e.target.closest("tr")

    document.getElementById("real_faq_id").value = row.cells[0].innerText
    document.getElementById("question").value = row.cells[2].innerText
    document.getElementById("answer").value = row.cells[3].innerText
    document.getElementById("intents").value = row.cells[4].innerText

    document.getElementById("question").focus()
    document.getElementById("add_faq").innerText = "Update FAQ"

})

//hadling delete faq section

document.getElementById("faq_table_data").addEventListener('click', async (e) => {
    const deleteBtn = e.target.classList.contains("delete-btn")
    if (!deleteBtn)
        return
    e.preventDefault

    const row = e.target.closest("tr")

    const faq = {
        "f_real_id": row.cells[0].innerText.trim()
    }

    if (confirm("Do you really want to delete this record!")) {
        try {
            const response = await fetch(BACKEND + UPDATE_DELETE_FAQ, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(faq)
            })

            const data = await response.json()
            if (response.ok && data.status === "success") {
                alert("Record has been deleted!")
                await loadFAQ()
            } else {
                alert("Error during deleting faq :" + data.message)
            }

        } catch (error) {
            console.error("Error during deleting faq : " + error)
        }
    }
})

// ============================================================
// IMPORTANT LINKS — LOAD
// ============================================================
async function loadLinks() {
    try {
        const response = await fetch(BACKEND + LOAD_ADD_LINKS, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        const data = await response.json();

        if (response.ok && data.status === "success") {
            const tbody = document.getElementById("links_table_data");
            tbody.innerHTML = "";
            let index = 1;
            data.links_data.forEach(link => {
                tbody.innerHTML += `
                    <tr>
                        <td hidden>${link.il_id}</td>
                        <td>${index}</td>
                        <td>${link.il_name}</td>
                        <td>
                            <a href="${link.il_url}" target="_blank" style="color:#91b0ff;">
                                ${link.il_url}
                            </a>
                        </td>
                        <td>
                            <div id="action_div">
                                <button class="action-btn edit-btn">EDIT</button>
                                <button class="action-btn delete-btn">DELETE</button>
                            </div>
                        </td>
                    </tr>`;
                index++;
            });
        }
    } catch (error) {
        console.error("Error fetching links:", error);
    }
}


// ============================================================
// IMPORTANT LINKS — ADD / UPDATE
// ============================================================
const addLinkBtn = document.getElementById("add_link");

addLinkBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const linkName = document.getElementById("link_name").value.trim();
    const linkUrl  = document.getElementById("link_url").value.trim();

    if (!linkName || !linkUrl) { alert("Link name and URL both are required!"); return; }

    if (addLinkBtn.innerText === "Add Link") {
        try {
            const response = await fetch(BACKEND + LOAD_ADD_LINKS, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ link_name: linkName, link_url: linkUrl })
            });
            const data = await response.json();
            if (response.ok && data.status === "success") {
                document.getElementById("links_form").reset();
                await loadLinks();
            } else {
                alert("Error: " + data.message);
            }
        } catch (error) {
            console.error("Error adding link:", error);
        }

    } else if (addLinkBtn.innerText === "Update Link") {
        const realId = document.getElementById("real_link_id").value.trim();
        if (!realId) { alert("Link ID not found!"); return; }

        try {
            const response = await fetch(BACKEND + UPDATE_DELETE_LINKS, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ real_link_id: realId, new_link_name: linkName, new_link_url: linkUrl })
            });
            const data = await response.json();
            if (response.ok && data.status === "success") {
                document.getElementById("links_form").reset();
                addLinkBtn.innerText = "Add Link";
                await loadLinks();
            } else {
                alert("Error: " + data.message);
            }
        } catch (error) {
            console.error("Error updating link:", error);
        }
    }
});

document.getElementById("links_table_data").addEventListener("click", (e) => {
    if (!e.target.classList.contains("edit-btn")) return;
    e.preventDefault();
    const row = e.target.closest("tr");
    document.getElementById("real_link_id").value = row.cells[0].innerText.trim();
    document.getElementById("link_name").value    = row.cells[2].innerText.trim();
    document.getElementById("link_url").value     = row.cells[3].querySelector("a").href;
    addLinkBtn.innerText = "Update Link";
    document.getElementById("link_name").focus();
});

document.getElementById("links_table_data").addEventListener("click", async (e) => {
    if (!e.target.classList.contains("delete-btn")) return;
    e.preventDefault();
    const row    = e.target.closest("tr");
    const realId = row.cells[0].innerText.trim();

    if (confirm("Do you really want to delete this link?")) {
        try {
            const response = await fetch(BACKEND + UPDATE_DELETE_LINKS, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ real_link_id: realId })
            });
            const data = await response.json();
            if (response.ok && data.status === "success") {
                await loadLinks();
            } else {
                alert("Error: " + data.message);
            }
        } catch (error) {
            console.error("Error deleting link:", error);
        }
    }
});

//single function which will going to load department,teacher,announcement,failed request and faq
async function loadALL() {
    if (sessionStorage.getItem("isLoggedIn") === "true") {
        await loadDepartments()
        await loadTeacher()
        await loadAnnouncement()
        await loadFailedRequest()
        await loadFAQ()

    }

}