
$('#loginForm').submit(function (event){
    event.preventDefault();
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    $.ajax({
        url : '/Admin',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({username:username,password:password}),
        dataType:'JSON',
        success: function(res){
            if(res==="Username or Password are incorrect"){
                $('#result').text(res);
                $('#username').val("");
                $('#password').val("");
                setTimeout(()=>{
                    $('#result').text("");
                },5*1000);
            }
            else{
                $('html').html(res);
            }
        },
        error: function(error){
            console.log(error);
        }
    });   
});


