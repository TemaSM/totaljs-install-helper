function getObjects(obj, key, val) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getObjects(obj[i], key, val));
        } else
            //if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not)
            if (i == key && obj[i] == val || i == key && val == '') { //
                objects.push(obj);
            } else if (obj[i] == val && key == '') {
                //only add if the object is not already in the array
                if (objects.lastIndexOf(obj) == -1) {
                    objects.push(obj);
                }
            }
    }
    return objects;
}

function getKeys(obj, val) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getKeys(obj[i], val));
        } else if (obj[i] == val) {
            objects.push(i);
        }
    }
    return objects;
}

function get_socket_url(path) {
    var address = window.location;
    var url = (address.protocol === 'https:') ? 'wss:' : 'ws:';
    return url + '//' + address.host + path;
};

//инициализация таблицы
function initDataTables(elem, data, rowId, drawCallback) {
    var oTable;
    var options = {
        language: { "sUrl": "/app/table/lang/ru_sm_no_search.txt" },
        stateSave: true,
        retrieve: true,
        destroy: true,
        lengthMenu: [[5, 10, 25, 50, 100, -1], [5, 10, 25, 50, 100, "All"]],
        sDom: "<'row'<'col-md-4'l><'col-md-8'f>r>t<'row'<'col-md-6'i><'col-md-6'p>>"
    };
    if (_.isFunction(rowId)) options.createdRow = rowId;
    else options.rowId = (!_.isNil(rowId)) ? rowId : '';
    if (_.isFunction(drawCallback)) options.drawCallback = function () { drawCallback(); };
    options.data = _.isArray(data) ? data : [];
    oTable = $(elem).DataTable(options);
    //после того как таблица создана, изменить паджинатор, сделаем его чуть меньше
    $(elem).on('draw.dt', function () {
        $(elem + '_wrapper .dataTables_paginate .pagination').addClass('pagination-sm');
        $(elem + '_wrapper .dataTables_filter label').css({ "display": "inline", "float": "none" });
    });
    return oTable;
}

//перерисовать таблицу
function drawDataTables(table, data) {
    table.clear();
    table.rows.add(_.isArray(data) ? data : []);
    table.draw(false);
}
//добавить маркеры событий
function addEventMarkers(data, markers) {
    if (data.length > 0) {
        data.forEach(function (item, i, arr) {
            if (item.lat && item.lng) {
                //, iconColor: item.object.color
                console.log(item);
                var icon = L.AwesomeMarkers.icon({ icon: item.object.obj_type_icon, prefix: 'fa', markerColor: (item.ev_type == 0) ? 'red' : 'orange' });
                var marker = L.marker([item.lat, item.lng],
                    {
                        title: item.object.object_type_name,
                        HASH: HASH(item),
                        color: item.object.color,
                        acc: item.acc,
                        icon: icon,
                        ev_id: item.ev_id,
                    }).addTo(map).bindPopup(alarmPopup(item.ev_id));
                markers.push(marker);
            }
        });
    };
};

function addObjectMarkers(data, markers) {
    if (data.length > 0) {
        data.forEach(function (item, i, arr) {
            if (item.lat && item.lng) {
                //          var radius = item.acc;
                var icon = L.AwesomeMarkers.icon({ icon: item.obj_type_icon, prefix: 'fa', markerColor: 'white', iconColor: item.color });
                var marker = L.marker([item.lat, item.lng],
                    {
                        title: item.object_type_name,
                        HASH: HASH(item),
                        icon: icon,
                        color: item.color,
                        acc: item.acc,
                        id: item.id,
                        riseOnHover: true
                    }).bindLabel(item.descr)
                    .addTo(map)
                    .bindPopup(objectPopup(item.id));
                markers.push(marker);
                //          L.circle([item.lat, item.lng], radius, {color: item.color}).addTo(map);
            }
        });
    };
};

//удалить все маркеры  
function removeAllMarkers(markers) {
    for (i in markers) {
        map.removeLayer(markers[i]);
    }
    markers.length = 0;
}

//удалить маркер
function removeMarkers(data, markers, id) {
    for (event of data) {
        var i = _.findIndex(markers, ['options.' + id, event]);
        if (i > -1) {
            map.removeLayer(markers[i]);
            markers.remove(i);
        }
    }
}

function drawCircleAcc(popup, circle) {
    if (popup._source.options.acc) {
        if (circle) map.removeLayer(circle);
        o = popup._source.options;
        pCircle = L.circle(popup._latlng, Math.round(o.acc), { color: o.color }).addTo(map);
    }
}

//обновление контента для маркера
function updateEventMarkers(data, markers, id, func) {
    for (event of data) {
        var i = _.findIndex(markers, ['options.' + id, event.id]);
        if (i > -1) {
            loc = new L.LatLng(event.lat, event.lng);
            markers[i].setLatLng(loc);
            markers[i].setPopupContent(func(markers[i].options[id]));
            var popup = markers[i].getPopup();
            if (popup._isOpen) drawCircleAcc(popup, pCircle);
        }
    }
}

//инициализация ФИО
function initFIO(suggestion, obj) {
    if (suggestion.data && obj) {
        var data = suggestion.data;
        obj.name = data.name;
        obj.surname = data.surname;
        obj.patronymic = data.patronymic;
    }
}
//инициализация Компании
function initCompany(suggestion, obj) {
    if (suggestion.data && obj) {
        var data = suggestion.data;
        obj.company_full = {
            cmp_name: suggestion.value,
            cmp_name_full: data.name.full_with_opf,
            cmp_addr: data.address.value,
            cmp_inn: data.inn,
            cmp_kpp: data.kpp,
            cmp_ogrn: data.ogrn,
            cmp_managment: (data.management) ? data.management.post + ': ' + data.management.name : null
        };
    }
}
//инициализация Адреса
function initAddr(suggestion, obj) {
    if (suggestion.data && obj) {
        var data = suggestion.data;
        obj.addr_full = {
            addr: suggestion.value,
            addr_fias: data.fias_id,
            addr_kladr: data.kladr_id,
            addr_loc: (data.geo_lat && data.geo_lon) ? [data.geo_lat, data.geo_lon] : null,
            addr_postal_code: data.postal_code,
            addr_country: data.country,
            addr_region: data.region_with_type,
            addr_area: data.area,
            addr_city: data.city_with_type,
            addr_city_district: data.city_district,
            addr_block: data.block,
            addr_house: data.house,
            addr_flat: data.flat
        }
    }
}
//Быстрый поиск
function initTypehead(elem, find, after) {
    $(elem).typeahead({ source: find, afterSelect: after, autoSelect: true });
}


$.fn.escape = function (callback) {
    return this.each(function () {
        $(document).on("keydown", this, function (e) {
            var keycode = ((typeof e.keyCode != 'undefined' && e.keyCode) ? e.keyCode : e.which);
            if (keycode === 27) {
                callback.call(this, e);
            };
        });
    });
};

//BEGIN Context Menu 
function context(settings, e) {
    function getMenuPosition(mouse, direction, scrollDir) {
        var win = $(window)[direction](),
            scroll = $(window)[scrollDir](),
            menu = $(settings.menuSelector)[direction](),
            position = mouse + scroll;

        // opening menu would pass the side of the page
        if (mouse + menu > win && menu < mouse)
            position -= menu;

        return position;
    }

    // return native menu if pressing control
    if (e.ctrlKey) return;

    $('body').click(function () {
        $(settings.menuSelector).hide();
    });

    $(this).escape(function () {
        $(settings.menuSelector).hide();
    });
    //open menu
    var $menu = $(settings.menuSelector)
        .data("invokedOn", $(e.target))
        .show()
        .css({
            position: "absolute",
            left: getMenuPosition(e.clientX, 'width', 'scrollLeft'),
            top: getMenuPosition(e.clientY, 'height', 'scrollTop')
        })
        .off('click')
        .on('click', 'a', function (e) {
            $menu.hide();

            var $invokedOn = $menu.data("invokedOn");
            var $selectedMenu = $(e.target);

            settings.menuSelected.call(this, $invokedOn, $selectedMenu);
        });

    return false;
};
//END Context Menu