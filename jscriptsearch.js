
    function initMap() {
        var map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 39.962386, lng: -82.999563},
            zoom: 14,
        });

        //list of locations in columbus area.
        var locations = [
            {
                position: {lat: 39.969819, lng: -83.01012},
                title: 'EXPRESS LIVE!'
            },
            {
                position: {lat: 39.969424, lng: -83.005915},
                title: 'Nationwide Arena'
            },
            {
                position: {lat: 39.964425, lng: -82.987804},
                title: 'Columbus Museum of Art'
            },
            {
                position: {lat: 39.959688, lng: -83.007202},
                title: 'COSI'
            },
            {
                position: {lat: 39.969161, lng: -82.987289},
                title: 'Columbus State Community College'
            },
            {
                position: {lat: 39.946266, lng: -82.991023},
                title: "Schmidt's Sausage Haus und Restaurant"
            }
        ];

        var infowindow = new google.maps.InfoWindow();
        function locationClicked(location) {
            $("#search").hide();//remove disturbance
            if (infowindow) {
                infowindow.close();
            }
            var marker = location.marker;
            marker.setAnimation(null);
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function () {//bouncing for 2 secs
                marker.setAnimation(null);
            }, 2000);


            //do ajax call to fetch from wiki
            $.ajax({
                url: "http://en.wikipedia.org/w/api.php?" +
                "action=parse&section=0&format=json&prop=text&page=" + location.title,
                type: "GET",
                headers: {'Api-User-Agent': 'Example/1.0'},
                crossDomain: true,
                ContentType: 'application/javascript',
                dataType: "jsonp",
                
                success: function (response) {
                    console.log(response);
                    if (response.parse) {
                        var html = response.parse.text["*"];
                        if (html) {
                            infowindow = new google.maps.InfoWindow({
                                content: html
                            });
                            infowindow.open(map, marker);
                        }
                    } else {
                        console.log("No data");
                        infowindow = new google.maps.InfoWindow({
                            content: "<h3>" + location.title + "</h3><p>No data available for this location in wikipedia</p>"
                        });
                        infowindow.open(map, marker);
                    }
                },
                error: function (xhr, status) {
                    infowindow = new google.maps.InfoWindow({
                        content: "Error occurred while fetching wikipedia content"
                    });
                    infowindow.open(map, marker);
                }
            });
        }

        //adding markers to the map:init
        locations.forEach(function (location) {
            var marker = new google.maps.Marker({
                position: location.position,
                title: location.title,
                animation: google.maps.Animation.DROP,
                map: map
            });
            location.marker = marker;
            marker.addListener('click', function () {
                locationClicked(location);
            });
        });

        var viewModel = {
            locs: ko.observableArray(locations.slice()),
            query: ko.observable(''),
            search: function (value) {
                viewModel.locs.removeAll();
                locations.forEach(function (x) {
                    x.marker.setVisible(false);
                    if (x.title.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                        viewModel.locs.push(x);
                        x.marker.setVisible(true);
                    }
                });
            },
            selectItem: function (parent, data) {
                locationClicked(data);
            }
        };

        ko.applyBindings(viewModel);
        viewModel.query.subscribe(viewModel.search);
    }