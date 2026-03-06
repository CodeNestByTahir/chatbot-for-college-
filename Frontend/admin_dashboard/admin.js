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
                authContainer.style.display = 'none';
                dashboard.style.display = 'block';
            } else {
                alert("Login failed: " + data.message);
            }
        } catch (error) {
            alert("Error : Probably backend is not Active")
            console.error("Error in login section:", error);
        }
    } else {
        alert("Please enter the neccessary information!")
    }
});

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
