
    const admin_login = document.getElementById("admin_login");
    const reset_pass = document.getElementById("reset_pass");
    const otp_pass = document.getElementById("otp_pass");
    const after_successfull_login = document.getElementById("after_successfull_login");
    const admin_authentication = document.getElementsByClassName("admin_authentication");

    const forget_password = document.getElementById("forget_password");
    const back_to_login = document.getElementById("back_to_login");
    const login_btn = document.getElementById("lg_btn");

    // Initial state
    reset_pass.classList.add("hide");
    otp_pass.classList.add("hide");
    after_successfull_login.classList.add("hide");

    forget_password.addEventListener("click", () => {
        admin_login.classList.add("hide");
        otp_pass.classList.add("hide");
        reset_pass.classList.remove("hide");
    });

    back_to_login.addEventListener("click", () => {
        admin_login.classList.remove("hide");
        otp_pass.classList.add("hide");
        reset_pass.classList.add("hide");
    });

    login_btn.addEventListener("click", () => {
        for (let section of admin_authentication) {
            section.classList.add("hide");
        }
        after_successfull_login.classList.remove('hide')
    });


