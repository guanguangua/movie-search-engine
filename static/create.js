$(document).ready(function() {
    $("#title").focus();
    $("#movie-form").submit(function(event){
        event.preventDefault();
        let dataToSend = {
            "title": $("#title").val(),
            "review": $("#review").val(),
            "release": $("#release").val(),
            "genre": $("#genre").val().split(","),
            "trailer": $("#trailer").val(),
            "poster": $("#poster").val()
        };
        $.ajax({
            type: "POST",
            url: "/create",
            dataType : "json",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(dataToSend),
            success: function(result){
                $("#redirect-choice").modal("show");
                $("#refresh-create").click(function(){
                    location.reload();
                });
                $("#view-new-entry").click(function(){
                    location.href = "../view/" + result["id"];
                })
            },
            error: function(request, status, error){
                console.log("Error");
                console.log(request);
                console.log(status);
                console.log(error)
            }
        });
    });
});
