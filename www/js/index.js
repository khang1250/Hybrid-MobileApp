var ERROR = 'ERROR';

// Create or Open Database.
var db = window.openDatabase('FGW', '1.0', 'FGW', 20000);

// To detect whether users use mobile phones horizontally or vertically.
$(window).on('orientationchange', onOrientationChange);

// Display messages in the console.
function log(message, type = 'INFO') {
    console.log(`${new Date()} [${type}] ${message}`);
}

function onOrientationChange(e) {
    if (e.orientation == 'portrait') {
        log('Portrait.');
    }
    else {
        log('Landscape.');
    }
}

// To detect whether users open applications on mobile phones or browsers.
if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
    $(document).on('deviceready', onDeviceReady);
}
else {
    $(document).on('ready', onDeviceReady);
}

// Display errors when executing SQL queries.
function transactionError(tx, error) {
    log(`SQL Error ${error.code}. Message: ${error.message}.`, ERROR);
}

// Run this function after starting the application.
function onDeviceReady() {
    log(`Device is ready.`);

    db.transaction(function (tx) {
        // Create table Property.
        var query = `CREATE TABLE IF NOT EXISTS Property (Id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                         PropertyName TEXT NOT NULL UNIQUE,
                                                         PropertyAddress TEXT NOT NULL,
                                                         City INTEGER NOT NULL,
                                                         District INTEGER NOT NULL,
                                                         Ward INTEGER NOT NULL,
                                                         PropertyType TEXT NOT NULL,
                                                         Bedrooms INTEGER NOT NULL,
                                                         BuildDate DATE NOT NULL,
                                                         Price INTEGER NOT NULL,
                                                         FurnitureType TEXT NOT NULL,
                                                         Note TEXT NULL,
                                                         RpName TEXT NULL)`;
        tx.executeSql(query, [], function (tx, result) {
            log(`Create table 'Property' successfully.`);
        }, transactionError);

        // Create table COMMENT.
        var query = `CREATE TABLE IF NOT EXISTS Comment (Id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                         Comment TEXT NOT NULL,
                                                         Datetime DATE NOT NULL,
                                                         PropertyId INTEGER NOT NULL,
                                                         FOREIGN KEY (PropertyId) REFERENCES Property(Id))`;
        tx.executeSql(query, [], function (tx, result) {
            log(`Create table 'Comment' successfully.`);
        }, transactionError);
    });

    prepareDatabase(db);
}

$(document).on('pagebeforeshow', '#page-create', function () {
    importCity('#page-create #frm-register');
    importDistrict('#page-create #frm-register');
    importWard('#page-create #frm-register');
});

$(document).on('change', '#page-create #frm-register #city', function () {
    importDistrict('#page-create #frm-register');
    importWard('#page-create #frm-register');
});

$(document).on('change', '#page-create #frm-register #district', function () {
    importWard('#page-create #frm-register');
});


$(document).on('pagebeforeshow', '#page-detail', function () {
    importCity('#page-detail #frm-update');
    importDistrict('#page-detail #frm-update');
    importWard('#page-detail #frm-update');
});

$(document).on('change', '#page-detail #frm-update #city', function () {
    importDistrict('#page-detail #frm-update');
    importWard('#page-detail #frm-update');
});

$(document).on('change', '#page-detail #frm-update #district', function () {
    importWard('#page-detail #frm-update');
});

function importCity(form, selectedId = -1) {
    db.transaction(function (tx) {
        var query = 'SELECT * FROM City ORDER BY Name';
        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var optionList = `<option value='-1'>Select City</option>`;
            for (let item of result.rows) {
                optionList += `<option value='${item.Id}' ${item.Id == selectedId ? 'selected' : ''}>${item.Name}</option>`;
            }

            $(form + ' #city').html(optionList);
            $(form + ' #city').selectmenu('refresh', true);
        }
    });
}

function importDistrict(form, selectedId = -1, cityId) {
    if (cityId == null) {
        cityId = $(form + ' #city').val();
    }
    db.transaction(function (tx) {

        var query = 'SELECT * FROM District WHERE CityId = ? ORDER BY Name';
        tx.executeSql(query, [cityId], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var optionList = `<option value='-1'>Select District</option>`;
            for (let item of result.rows) {
                optionList += `<option value='${item.Id}' ${item.Id == selectedId ? 'selected' : ''}>${item.Name}</option>`;
            }
            $(form + ' #district').html(optionList);
            $(form + ' #district').selectmenu('refresh', true);
        }
    });
}
function importWard(form, selectedId = -1, districtId) {
    if (districtId == null) {
        districtId = $(form + ' #district').val();
    }
    db.transaction(function (tx) {

        var query = 'SELECT * FROM Ward WHERE DistrictId = ? ORDER BY Name';
        tx.executeSql(query, [districtId], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var optionList = `<option value='-1'>Select Ward</option>`;
            for (let item of result.rows) {
                optionList += `<option value='${item.Id}' ${item.Id == selectedId ? 'selected' : ''}>${item.Name}</option>`;
            }
            $(form + ' #ward').html(optionList);
            $(form + ' #ward').selectmenu('refresh', true);
        }
    });
}

// Submit a form to register a new Property.
$(document).on('submit', '#page-create #frm-register', confirmProperty);
$(document).on('submit', '#page-create #frm-confirm', registerProperty);


function confirmProperty(e) {
    e.preventDefault();
    // Get user's input.
    var cityName = $('#page-create #frm-register #city option:selected').text();
    var districtName = $('#page-create #frm-register #district option:selected').text();
    var wardName = $('#page-create #frm-register #ward option:selected').text();
    var address = $('#page-create #frm-register #prop-address').val();
    var propName = $('#page-create #frm-register #prop-name').val();
    var propAddress = address + ', ' + wardName + ', ' + districtName + ', ' + cityName;
    var city = $('#page-create #frm-register #city option:selected').text();
    var district = $('#page-create #frm-register #district option:selected').text();
    var ward = $('#page-create #frm-register #ward option:selected').text();
    var propType = $('#page-create #frm-register #type').val();
    var bedRooms = $('#page-create #frm-register #bedrooms').val();
    var buildDate = $('#page-create #frm-register #buildDate').val();
    var price = $('#page-create #frm-register #price').val();
    var furType = $('#page-create #frm-register #furniture-type').val();
    var note = $('#page-create #frm-register #note').val();
    var rpName = $('#page-create #frm-register #rp-name').val();
    checkProperty(propName, propAddress, propType, bedRooms, buildDate, price, furType, note, rpName);
}

function checkProperty(propName, propAddress, propType, bedRooms, buildDate, price, furType, note, rpName) {
    db.transaction(function (tx) {
        var query = 'SELECT * FROM Property WHERE PropertyName = ?';
        tx.executeSql(query, [propName], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            if (result.rows[0] == null) {
                log('Open the confirmation popup.');
                $('#page-create #error').empty();

                $('#page-create #frm-confirm #prop-name').val(propName);
                $('#page-create #frm-confirm #prop-address').val(propAddress);
                $('#page-create #frm-confirm #type').val(propType);
                $('#page-create #frm-confirm #bedrooms').val(bedRooms);
                $('#page-create #frm-confirm #buildDate').val(buildDate);
                $('#page-create #frm-confirm #price').val(price);
                $('#page-create #frm-confirm #furniture-type').val(furType);
                $('#page-create #frm-confirm #note').val(note);
                $('#page-create #frm-confirm #rp-name').val(rpName);

                $('#page-create #frm-confirm').popup('open');
            }
            else {
                var error = 'Property exists.';
                $('#page-create #error').empty().append(error);
                log(error, ERROR);
            }
        }
    });
}

function registerProperty(e) {
    e.preventDefault();
    var propName = $('#page-create #frm-confirm #prop-name').val();
    var propAddress = $('#page-create #frm-register #prop-address').val();
    var city = $('#page-create #frm-register #city').val();
    var district = $('#page-create #frm-register #district').val();
    var ward = $('#page-create #frm-register #ward').val();
    var propType = $('#page-create #frm-confirm #type').val();
    var bedRooms = $('#page-create #frm-confirm #bedrooms').val();
    var buildDate = $('#page-create #frm-confirm #buildDate').val();
    var price = $('#page-create #frm-confirm #price').val();
    var furType = $('#page-create #frm-confirm #furniture-type').val();
    var note = $('#page-create #frm-confirm #note').val();
    var rpName = $('#page-create #frm-confirm #rp-name').val();

    db.transaction(function (tx) {
        var query = 'INSERT INTO Property (PropertyName, PropertyAddress, City, District, Ward,PropertyType, Bedrooms, BuildDate, Price, FurnitureType, Note, RpName ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        tx.executeSql(query, [propName, propAddress, city, district, ward, propType, bedRooms, buildDate, price, furType, note, rpName], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Create a propname '${propName}' successfully.`);

            // Reset the form.
            $('#frm-register').trigger('reset');
            $('#page-create #error').empty();
            $('#prop-name').focus();

            $('#page-create #frm-confirm').popup('close');
        }
    });
}

// Display Property List.
$(document).on('pagebeforeshow', '#page-list', showList);

function showList() {
    db.transaction(function (tx) {
        var query = 'SELECT Id, PropertyType, PropertyName, Bedrooms, Price FROM Property';
        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Get list of Propertys successfully.`);

            // Prepare the list of Propertys.
            var listProperty = `<ul id='list-Property' data-role='listview' data-filter='true' data-filter-placeholder='Look for something ?'
                                                     data-corners='false' class='ui-nodisc-icon ui-alt-icon'>`;
            for (let Property of result.rows) {
                listProperty += `<li><a data-details='{"Id" : ${Property.Id}}'>
                                    <img src='img/logoblack.jpg'>
                                    <h3>Property Name: ${Property.PropertyName}</h3>
                                    <p>Property Type: ${Property.PropertyType}</p>
                                    <p>Number of Bedrooms: ${Property.Bedrooms}</p>
                                    <p>Monthly Price: ${Property.Price}</p>
                                </a></li>`;
            }
            listProperty += `</ul>`;

            // Add list to UI.
            $('#page-list #list-Property').empty().append(listProperty).trigger('create');

            log(`Show list of Propertys successfully.`);
        }
    });
}

// Save Property Id.
$(document).on('vclick', '#list-Property li a', function (e) {
    e.preventDefault();

    var id = $(this).data('details').Id;
    localStorage.setItem('currentPropertyId', id);
    log(`id ${id}`);

    var commentid = $(this).data('details').CommentId;
    localStorage.setItem('currentCommentId', commentid);
    log(`id ${id}`);

    $.mobile.navigate('#page-detail', { transition: 'none' });
});

// Show Property Details.
$(document).on('pagebeforeshow', '#page-detail', showDetail);

function showDetail() {
    var id = localStorage.getItem('currentPropertyId');

    db.transaction(function (tx) {
        var query = `SELECT Property.PropertyName,
                            Property.PropertyAddress,
                            City.Name AS 'City',
                            District.Name AS 'District',
                            Ward.Name AS 'Ward',
                            Property.PropertyType,
                            Property.Bedrooms,
                            Property.BuildDate,
                            Property.Price,
                            Property.FurnitureType,
                            Property.Note,
                            Property.RpName
                        FROM Property 
                        JOIN City
                        ON Property.City = City.Id
                        JOIN District
                        ON Property.District = District.Id
                        JOIN Ward
                        ON Property.Ward = Ward.Id 
                        WHERE Property.Id = ?`;
        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var errorMessage = 'Property not found.';
            var propName = errorMessage;
            var propAddress = errorMessage;
            var city = errorMessage;
            var district = errorMessage;
            var ward = errorMessage;
            var propType = errorMessage;
            var bedRooms = errorMessage;
            var buildDate = errorMessage;
            var price = errorMessage;
            var furType = errorMessage;
            var note = errorMessage;
            var rpName = errorMessage;

            if (result.rows[0] != null) {
                log(`Get details of Property '${id}' successfully.`);

                propName = result.rows[0].PropertyName;
                address = result.rows[0].PropertyAddress;
                city = result.rows[0].City;
                district = result.rows[0].District;
                ward = result.rows[0].Ward;
                propType = result.rows[0].PropertyType;
                bedRooms = result.rows[0].Bedrooms;
                buildDate = result.rows[0].BuildDate;
                price = result.rows[0].Price;
                furType = result.rows[0].FurnitureType;
                note = result.rows[0].Note;
                rpName = result.rows[0].RpName;

            }
            else {
                log(errorMessage, ERROR);

                $('#page-detail #btn-update').addClass('ui-disabled');
                $('#page-detail #btn-delete-confirm').addClass('ui-disabled');
            }
            var propAddress = address + ", " + ward + ", " + district + ", " + city;
            $('#page-detail #id').val(id);
            $('#page-detail #prop-name').val(propName);
            $('#page-detail #prop-address').val(propAddress);
            $('#page-detail #type').val(propType);
            $('#page-detail #bedrooms').val(bedRooms);
            $('#page-detail #buildDate').val(buildDate);
            $('#page-detail #price').val(price);
            $('#page-detail #furniture-type').val(furType);
            $('#page-detail #note').val(note);
            $('#page-detail #rp-name').val(rpName);

            showComment();
        }
    });
}

// Delete Property.
$(document).on('submit', '#page-detail #frm-delete', deleteProperty);
$(document).on('keyup', '#page-detail #frm-delete #txt-delete', confirmDeleteProperty);

function confirmDeleteProperty() {
    var text = $('#page-detail #frm-delete #txt-delete').val();

    if (text == 'confirm delete') {
        $('#page-detail #frm-delete #btn-delete').removeClass('ui-disabled');
    }
    else {
        $('#page-detail #frm-delete #btn-delete').addClass('ui-disabled');
    }
}

// Delete Function
function deleteProperty(e) {
    e.preventDefault();

    var id = localStorage.getItem('currentPropertyId');

    db.transaction(function (tx) {
        var query = 'DELETE FROM Property WHERE Id = ?';
        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Delete Property '${id}' successfully.`);

            $('#page-detail #frm-delete').trigger('reset');

            $.mobile.navigate('#page-list', { transition: 'none' });
        }
    });
}



// Update Function 
$(document).on('vclick', '#page-detail #frm-update #btn-update', updateProperty);

function updateProperty(e) {
    e.preventDefault();

    var id = localStorage.getItem('currentPropertyId');
    var propName = $('#page-detail #frm-update #prop-name').val();
    var propAddress = $('#page-detail #frm-update #prop-address').val();
    var city = $('#page-detail #frm-update #city').val();
    var district = $('#page-detail #frm-update #district').val();
    var ward = $('#page-detail #frm-update #ward').val();
    var propType = $('#page-detail #frm-update #type').val();
    var bedRooms = $('#page-detail #frm-update #bedrooms').val();
    var price = $('#page-detail #frm-update #price').val();
    var furType = $('#page-detail #frm-update #furniture-type').val();
    var note = $('#page-detail #frm-update #note').val();
    var rpName = $('#page-detail #frm-update #rp-name').val();


    db.transaction(function (tx) {
        var query = 'UPDATE Property SET PropertyName = ?, PropertyAddress = ?, City = ?, District = ?, Ward = ?, PropertyType = ?, Bedrooms = ?, Price = ?, FurnitureType = ?, Note = ?, RpName = ? WHERE Id = ?';
        tx.executeSql(query, [propName, propAddress, city, district, ward, propType, bedRooms, price, furType, note, rpName, id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Update Property'${id}' and '${propName}' successfully.`);

            $('#page-detail #frm-update').trigger('resset');
            $.mobile.navigate('#page-detail', { transition: 'none' });
            window.location.reload();
        }
    });
}

$(document).on('pageshow', '#page-detail', function () {
    db.transaction(function (tx) {
        var id = localStorage.getItem('currentPropertyId');
        var query = 'SELECT PropertyAddress, City, District, Ward FROM Property WHERE Id = ?';
        tx.executeSql(query, [id], transactionSuccess, transactionError);
        function transactionSuccess(tx, result) {
            log(`GET District '${result.rows[0].DistrictId}', '${result.rows[0].WardId}'  successfully.`);
            importCity('#page-detail #frm-update', result.rows[0].City);
            importDistrict('#page-detail #frm-update', result.rows[0].District, result.rows[0].City);
            importWard('#page-detail #frm-update', result.rows[0].Ward, result.rows[0].District);
            $('#page-detail #frm-update #prop-address').val(result.rows[0].PropertyAddress);
        }
    });
});

// Add Comment.
$(document).on('submit', '#page-detail #frm-comment', addComment);

function addComment(e) {
    e.preventDefault();

    var PropertyId = localStorage.getItem('currentPropertyId');
    var comment = $('#page-detail #frm-comment #txt-comment').val();
    var dateTime = new Date();

    db.transaction(function (tx) {
        var query = 'INSERT INTO Comment (PropertyId, Comment, Datetime) VALUES (?, ?, ?)';
        tx.executeSql(query, [PropertyId, comment, dateTime], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Add new comment to Property '${PropertyId}' successfully.`);

            $('#page-detail #frm-comment').trigger('reset');

            showComment();
        }
    });
}

// Show Comment.
function showComment() {
    var PropertyId = localStorage.getItem('currentPropertyId');

    db.transaction(function (tx) {
        var query = 'SELECT * FROM Comment WHERE PropertyId = ?';
        tx.executeSql(query, [PropertyId], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Get list of comments successfully.`);

            // Prepare the list of comments.
            var listComment = '';
            for (let comment of result.rows) {
                listComment += `<div class = 'list'>
                                    <small>${comment.Datetime}</small>
                                    <h3>${comment.Comment}</h3>
                                </div>`;
            }

            // Add list to UI.
            $('#list-comment').empty().append(listComment);

            log(`Show list of comments successfully.`);
        }
    });
}


// Search Property
$(document).on('pagebeforeshow', '#page-search', function () {
    importCityss('#page-search #frm-search');
    importDistrictss('#page-search #frm-search');
    importWardss('#page-search #frm-search');
});

$(document).on('change', '#page-search #frm-search #city', function () {
    importDistrictss('#page-search #frm-search', 'District', 'City');
    importWardss('#page-search #frm-search', 'Ward', 'District');
});

$(document).on('change', '#page-search #frm-search #district', function () {
    importWardss('#page-search #frm-search', 'Ward', 'District');
});

function importCityss(form, selectedId = -1) {
    db.transaction(function (tx) {
        var query = 'SELECT * FROM City ORDER BY Name';
        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var optionList = `<option value='-1'>Choose City</option>`;
            for (let item of result.rows) {
                optionList += `<option value='${item.Id}'' ${item.Id == selectedId ? 'selected' : ''}>${item.Name}</option>`;
            }

            $(`${form} #city`).html(optionList);
            $(`${form} #city`).selectmenu('refresh', true);
        }
    });
}

function importDistrictss(form, selectedId = -1) {
    var id = $('#page-search #frm-search #city').val();

    db.transaction(function (tx) {
        var query = 'SELECT * FROM District WHERE CityId = ? ORDER BY Name';
        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var optionList = `<option value='-1'>Choose District</option>`;
            for (let item of result.rows) {
                optionList += `<option value='${item.Id}'' ${item.Id == selectedId ? 'selected' : ''}>${item.Name}</option>`;
            }

            $(`${form} #district`).html(optionList);
            $(`${form} #district`).selectmenu('refresh', true);
        }
    });
}

function importWardss(form, selectedId = -1) {
    var id = $('#page-search #frm-search #district').val();

    db.transaction(function (tx) {
        var query = 'SELECT * FROM Ward WHERE DistrictId = ? ORDER BY Name';
        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var optionList = `<option value='-1'>Choose Ward</option>`;
            for (let item of result.rows) {
                optionList += `<option value='${item.Id}'' ${item.Id == selectedId ? 'selected' : ''}>${item.Name}</option>`;
            }

            $(`${form} #ward`).html(optionList);
            $(`${form} #ward`).selectmenu('refresh', true);
        }
    });
}

$(document).on('submit', '#page-search #frm-search', search);
function search(e) {
    e.preventDefault();

    var propName = $('#page-search #frm-search #prop-name').val();
    var propAddress = $('#page-search #frm-search #prop-address').val();
    var city = $('#page-search #frm-search #city').val();
    var district = $('#page-search #frm-search #district').val();
    var ward = $('#page-search #frm-search #ward').val();
    var propType = $('#page-search #frm-search #type').val();
    var bedRooms = $('#page-search #frm-search #bedrooms').val();
    var price = $('#page-search #frm-search #price').val();
    var furType = $('#page-search #frm-search #furniture-type').val();
    var rpName = $('#page-search #frm-search #rp-name').val();
    log(`city ${city}`)
    db.transaction(function (tx) {
        var query = `SELECT Id, PropertyName, PropertyAddress, City, District, Ward, PropertyType, FurnitureType, Bedrooms, RpName, Price FROM Property WHERE`;

        if (propName) {
            query += ` PropertyName LIKE "%${propName}%"   AND`;
        }

        if (propAddress) {
            query += ` PropertyAddress LIKE "%${propAddress}%"   AND`;
        }

        if (city && city != -1) {
             query += ` City = "${city}"   AND`;
        }

        if (district && district != -1) {
             query += ` District = "${district}"   AND`;
        }

        if (ward && ward != -1) {
             query += ` Ward = "${ward}"   AND`;
        }

        if (propType && propType != "Choose Type") {
            query += ` PropertyType = "${propType}"   AND`;
        }

        if ( furType && furType != "Choose Furniture") {
            query += ` FurnitureType = "${furType}"   AND`;
        }

        if (bedRooms) {
            query += ` Bedrooms = "${bedRooms}"   AND`;
        }

        if (price) {
            query += ` Price >= "${price}"   AND`;
        }

        if (rpName) {
            query += ` RpName = "%${rpName}%"   AND`;
        }

        query = query.substring(0, query.length - 6);

        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Get list of accounts successfully.`);

            // Prepare the list of Propertys.
            var listProperty = `<ul id='list-Property' data-role='listview' data-corners='false' class='ui-nodisc-icon ui-alt-icon'>`;
            for (let Property of result.rows) {
                listProperty += `<li><a data-details='{"Id" : ${Property.Id}}'>
                                    <img src='img/logoblack.jpg'>
                                    <h3>Property Name: ${Property.PropertyName}</h3>
                                    <p>Property Type: ${Property.PropertyType}</p>
                                    <p>Number of Bedrooms: ${Property.Bedrooms}</p>
                                    <p>Monthly Price: ${Property.Price}</p>
                                </a></li>`;
            }
            listProperty += `</ul>`;

            // Add list to UI.                                       
            $('#page-search #list-Property').empty().append(listProperty).trigger('create');

            log(`Show list of accounts successfully.`);
        }
    });
}


function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}

/* Set the width of the side navigation to 0 */
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}
