var id = document.getElementById("index").innerHTML;
document.getElementById("index").innerHTML = "";
$.ajax({
    url : '/getAdsByType',
    type: 'GET',
    data: {'id': id },
    success: function(res){
        var ads = JSON.parse(res);
        document.getElementById('line1').style.visibility = 'hidden';
        document.getElementById('line2').style.visibility = 'hidden';
        document.getElementById('star').style.visibility = 'hidden';
        var curDate;
        setInterval(function () {
            for (let index = 0; index < ads.length; index++) {
                curDate = new Date();
                const element = ads[index];
                var from = new Date(element.FromDate).getDate();
                var to = new Date(element.ToDate).getDate();
                var adTitle = $("#adTitle");
                var adDetails = $("#adDetails");
                adTitle.text("");
                adDetails.text("");
                document.getElementById('line1').style.visibility = 'hidden';
                document.getElementById('line2').style.visibility = 'hidden';
                document.getElementById('star').style.visibility = 'hidden';
                for (let i = 0; i < 6; i++) {
                    document.getElementById("img" + i.toString()).style.visibility="hidden";
                }
                    if (curDate.getDate() >= from && curDate.getDate() <= to) {
                        if (element.Days.includes(curDate.getDay())) {
                            if (element.Hours.includes(curDate.getHours())) {
                                if (element.secondsOfAd.includes(curDate.getSeconds() % 10)) {
                                        adTitle.text(element.text[0]);
                                        adDetails.text(element.text[1]);
                                        document.getElementById('line1').style.visibility = 'visible';
                                        document.getElementById('line2').style.visibility = 'visible';
                                        document.getElementById('star').style.visibility = 'visible';
                                        for (let i = 0; i < element.images.length; i++) {
                                            const image = element.images[i];
                                            document.getElementById("img" + i.toString()).style.visibility= 'visible';
                                            $("#img" + i).attr("src", image);
                                        }
                                        break;
                                }
                            }
                        }
                    }
            }
        }, 1000);
          
    },
    error: function(error){
        console.log(error);
    }
});

