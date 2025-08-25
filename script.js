function sendMail(){
    let params = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        message: document.getElementById('message').value
    }

    emailjs.send("service_kq184mb", "template_fjvs9av", params).then(alert('Your email has been sent!'))
}