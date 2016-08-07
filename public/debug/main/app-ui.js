Tangular.register('find_length', function (arr, key, val) {
    var arr = this;
    var cnt = 0;
    for (e in arr) {
        if (arr[e][key] == val) cnt++;
    }
    return cnt;
});

//request.answer | find("ID", 5, "R_ID") 
Tangular.register('find', function (arr, key, val, keyout) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i][key] == val) {
            return arr[i][keyout];
        }
    }
    return '';
});

COMPONENT('click', function () {
    var self = this;

    self.readonly();

    self.click = function () {
        var value = self.attr('data-value');
        if (value) {
            self.set(self.parser(value));
            return;
        }
        self.get(self.attr('data-component-path'))(self);
    };

    self.make = function () {
        self.element.on('click', self.click);

        var enter = self.attr('data-enter');
        if (!enter)
            return;

        $(enter).on('keydown', 'input', function (e) {
            if (e.keyCode !== 13)
                return;
            setTimeout(function () {
                if (self.element.get(0).disabled === true)
                    return;
                self.click();
            }, 100);
        });
    };
});

COMPONENT('disable', function () {
    var self = this;
    var condition = self.attr('data-if');
    var selector = 'input,texarea,select';

    self.readonly();
    self.setter = function (value) {
        var is = true;

        if (condition)
            is = EVALUATE(self.path, condition);
        else
            is = value ? false : true;

        self.find(selector).each(function () {
            var el = $(this);
            el.prop('disabled', is);
            // Disable the line below when you don't use ui-textbox, ui-dropdown, etc..
            el.parent().parent().toggleClass('ui-disabled', is);
        });
    };

    self.state = function (type) {
        self.setter(self.get());
    };
});

COMPONENT('page', function () {
    var self = this;
    var isProcessed = false;
    var template = self.element.attr('data-template');

    self.hide = function () {
        self.set('');
    };

    self.setter = function (value) {
        var el = self.element;
        var is = el.attr('data-if') == value;

        if (isProcessed || !is) {
            el.toggleClass('hidden', !is);
            return;
        }

        if (!template) {
            isProcessed = true;
            el.toggleClass('hidden', !is);
            return;
        }

        INJECT(template, el, function () {
            var init = el.attr('data-init');

            if (init) {
                var fn = GET(init || '');
                if (typeof (fn) === 'function')
                    fn(self);
            }

            isProcessed = true;
            el.toggleClass('hidden', !is);
        });
    };

    // Better performance
    self.getter = null;
});

COMPONENT('ready', function () {
    var self = this;
    self.make = function () {
        setTimeout(function () {
            self.element.removeClass('ui-ready-preloader');
            self.element.find('div:first-child').removeClass('ui-ready-hidden');
        }, 500);
    };

    // Better performance
    self.setter = null;
    self.getter = null;
});

COMPONENT('length', function () {
    var self = this;

    self.readonly();

    self.setter = function (value) {
        var key = self.attr('data-key');
        var val = self.attr('data-value');

        if (typeof value === 'undefined') {
            self.element.html('');
            return;
        }

        if (!key && !val) {
            self.html(value.length);
            return;
        }

        var count = 0;

        value.forEach(function (item) {
            Object.keys(item).forEach(function (k) {
                if (k !== key)
                    return;
                if (val) {
                    if (item[k] == val)
                        count++;
                } else
                    count++;
            });
        });

        self.html(count);
    };
});

COMPONENT('textbox', function () {

    var self = this;
    var isRequired = self.attr('data-required') === 'true';

    // A global formatter
    self.validate = function (value) {

        var is = false;
        var t = typeof (value);

        // Control is disabled
        if (self.element.find('input').prop('disabled'))
            return true;

        if (t === 'undefined' || t === 'object')
            value = '';
        else
            value = value.toString();

        is = isRequired ? self.type === 'email' ? value.indexOf('@') !== -1 && value.indexOf('.') !== -1 : self.type === 'number' || self.type === 'currency' ? value > 0 : value.length > 0 : true;
        return is;
    };

    self.make = function () {

        var attrs = [];

        function attr(name) {
            var a = self.attr(name);
            if (!a)
                return;
            attrs.push(name.substring(name.indexOf('-') + 1) + '="' + a + '"');
        }
        var el = self.element;
        attr('readonly');
        attr('data-placeholder');
        attr('data-maxlength');

        var element = self.element;
        var content = element.html();
        var id = element.attr('data-id');
        var icon = element.attr('data-icon');
        var align = element.attr('data-align');
        var cicon = element.attr('data-control-icon');
        self.type = element.attr('type') ? element.attr('type') : 'text';
        var html = '<input type="' + self.type + '" data-component-bind=""' + (attrs.length ? ' ' + attrs.join('') : '') + (id ? ' id="' + id + '"' : '') + (align ? ' class="' + align + '"' : '') + (element.attr('data-autofocus') === 'true' ? ' autofocus="autofocus"' : '') + ' />' + (cicon ? '<div><span class="fa ' + cicon + '"></span></div>' : '');

        if (content.length === 0) {
            element.addClass('ui-textbox');
            element.append(html);
            return;
        }

        element.html('<div class="ui-textbox-label' + (isRequired ? ' ui-textbox-label-required' : '') + '">' + (icon ? '<span class="fa ' + icon + '"></span> ' : '') + content + ':</div><div class="ui-textbox">' + html + '</div>');
    };

    self.state = function (type) {
        self.element.find('.ui-textbox').toggleClass('ui-textbox-invalid', self.isInvalid());
    };
});



COMPONENT('textarea', function () {

    var self = this;
    var isRequired = self.attr('data-required') === 'true';

    this.validate = function (value) {
        var is = false;
        var t = typeof (value);

        if (t === 'undefined' || t === 'object')
            value = '';
        else
            value = value.toString();

        is = isRequired ? self.type === 'number' ? value > 0 : value.length > 0 : true;
        return is;
    };

    self.make = function () {

        var attrs = [];

        function attr(name) {
            var a = self.attr(name);
            if (!a)
                return;
            attrs.push(name.substring(name.indexOf('-') + 1) + '="' + a + '"');
        }

        attr('data-placeholder');
        attr('data-maxlength');
        attr('data-rows');

        var element = self.element;
        var height = element.attr('data-height');
        var align = element.attr('data-align');
        var icon = element.attr('data-icon');
        var content = element.html();
        var html = '<textarea data-component-bind=""' + (attrs.length > 0 ? ' ' + attrs.join('') : '') + (height ? ' style="height:' + height + '"' : '') + (align ? ' class="' + align + '"' : '') + (element.attr('data-autofocus') === 'true' ? ' autofocus="autofocus"' : '') + '></textarea>';

        if (content.length === 0) {
            element.addClass('ui-textarea');
            element.append(html);
            return;
        }

        element.empty();
        element.append('<div class="ui-textarea-label' + (isRequired ? ' ui-textarea-label-required' : '') + '">' + (icon ? '<span class="fa ' + icon + '"></span> ' : '') + content + ':</div>');
        element.append('<div class="ui-textarea">' + html + '</div>');
    };

    self.state = function (type) {
        self.element.find('.ui-textarea').toggleClass('ui-textarea-invalid', self.isInvalid());
    };
});

COMPONENT('dropdown', function () {

    var self = this;
    var element = self.element;
    var isRequired = element.attr('data-required') === 'true';
    var isEmpty = element.attr('data-empty') === 'true';
    var datasource = '';

    this.validate = function (value) {
        var is = false;
        var t = typeof (value);
        if (t === 'undefined' || t === 'object')
            value = '';
        else
            value = value.toString();
        is = isRequired ? self.type === 'number' ? value > 0 : value.length > 0 : true;
        return is;
    };

    self.optText = element.attr('data-source-text') || 'name';
    self.optValue = element.attr('data-source-value') || 'id';

    self.render = function (arr) {
        var el = element.find('select').empty();
        var builder = [];
        var kk = self.optText;
        var kv = self.optValue;
        var value = self.get();

        if (isEmpty)
            builder.push('<option value=""></option>');

        for (var i = 0, length = arr.length; i < length; i++) {
            var item = arr[i];
            if (typeof (item) === 'string')
                builder.push('<option value="' + item + '"' + (value == item ? ' selected="selected"' : '') + '>' + item + '</option>');
            else
                builder.push('<option value="' + item[kv] + '"' + (value == item[kv] ? ' selected="selected"' : '') + '>' + item[kk] + '</option>');
        }

        el.html(builder.join(''));
    };

    this.make = function () {

        var options = [];
        var element = self.element;
        var arr = (element.attr('data-options') || '').split(';');

        for (var i = 0, length = arr.length; i < length; i++) {
            var item = arr[i].split('|');
            options.push('<option value="' + (item[1] === undefined ? item[0] : item[1]) + '">' + item[0] + '</option>');
        }

        var content = element.html();
        var icon = element.attr('data-icon');
        var html = '<div class="ui-dropdown"><span class="fa fa-sort"></span><select data-component-bind="">' + options.join('') + '</select></div>';

        if (content.length > 0) {
            element.empty();
            element.append('<div class="ui-dropdown-label' + (isRequired ? ' ui-dropdown-label-required' : '') + '">' + (icon ? '<span class="fa ' + icon + '"></span> ' : '') + content + ':</div>');
            element.append('<div class="ui-dropdown-container">' + html + '</div>');
        } else {
            element.addClass('ui-dropdown-container');
            element.append(html);
        }

        var path = element.attr('data-source');
        datasource = path;

        if (!path)
            return;

        var prerender = function (path) {
            var value = self.get(datasource);
            if (value === undefined || value === null)
                value = [];
            self.render(value);
        };

        self.on('watch', path, prerender);
        prerender(null, self.get(path));
    };

    this.state = function (type) {
        element.find('.ui-dropdown').toggleClass('ui-dropdown-invalid', self.isInvalid());
    };
});

COMPONENT('select', function () {

    var self = this;
    var element = self.element;
    var isRequired = element.attr('data-required') === 'true';
    var isEmpty = element.attr('data-empty') === 'true';
    var datasource = '';

    this.validate = function (value) {
        var is = false;
        var t = typeof (value);
        if (t === 'undefined' || t === 'object')
            value = '';
        else
            value = value.toString();
        is = isRequired ? self.type === 'number' ? value > 0 : value.length > 0 : true;
        return is;
    };

    self.optText = element.attr('data-source-text') || 'name';
    self.optValue = element.attr('data-source-value') || 'id';

    self.render = function (arr) {
        var el = element.find('select').empty();
        var builder = [];
        var kk = self.optText;
        var kv = self.optValue;
        var value = self.get();

        if (element.attr('data-placeholder'))
            builder.push('<option value="" disabled selected>' + element.attr('data-placeholder') + '</option>');

        if (isEmpty)
            builder.push('<option value=""></option>');

        for (var i = 0, length = arr.length; i < length; i++) {
            var item = arr[i];
            if (typeof (item) === 'string')
                builder.push('<option value="' + item + '"' + (value == item ? ' selected="selected"' : '') + '>' + item + '</option>');
            else
                builder.push('<option value="' + item[kv] + '"' + (value == item[kv] ? ' selected="selected"' : '') + '>' + item[kk] + '</option>');
        }

        el.html(builder.join(''));
    };

    this.make = function () {

        var options = [];
        var element = self.element;
        var arr = (element.attr('data-options') || '').split(';');

        for (var i = 0, length = arr.length; i < length; i++) {
            var item = arr[i].split('|');
            options.push('<option value="' + (item[1] === undefined ? item[0] : item[1]) + '">' + item[0] + '</option>');
        }

        var content = element.html();
        var icon = element.attr('data-icon');
        var align = element.attr('data-align');
        var multiple = element.attr('data-multiple');
        var size = element.attr('data-size');
        var style = element.attr('data-style');
        var html = '<select data-component-bind=""' + (align ? ' class="' + align + '"' : '') + (multiple ? ' multiple="' + multiple + '"' : '') + (size ? ' size="' + size + '"' : '') + (style ? ' style="' + style + '"' : '') + '>' + options.join('') + '</select>';

        if (content.length > 0) {
            element.empty();
            element.append('<div class="ui-dropdown-label' + (isRequired ? ' ui-dropdown-label-required' : '') + '">' + (icon ? '<span class="fa ' + icon + '"></span> ' : '') + content + ':</div>');
            element.append('<div class="ui-dropdown-container">' + html + '</div>');
        } else {
            element.addClass('ui-dropdown-container');
            element.append(html);
        }

        var path = element.attr('data-source');
        datasource = path;

        if (!path)
            return;

        var prerender = function (path) {
            var value = self.get(datasource);
            if (value === undefined || value === null)
                value = [];
            self.render(value);
        };

        self.on('watch', path, prerender);
        prerender(null, self.get(path));
    };

    this.state = function (type) {
        element.find('.ui-dropdown').toggleClass('ui-dropdown-invalid', self.isInvalid());
    };
});


COMPONENT('validation', function () {

    var self = this;
    var path;
    var elements;

    self.readonly();

    self.make = function () {
        elements = self.find(self.attr('data-selector') || 'button');
        elements.prop({ disabled: true });
        self.evaluate = self.attr('data-if');
        path = self.path.replace(/\.\*$/, '');
        self.watch(self.path, self.state, true);
    };

    self.state = function () {
        var disabled = jC.disabled(path);
        if (disabled && self.evaluate)
            disabled = !EVALUATE(self.path, self.evaluate);

        elements.prop({ disabled: disabled });
    };
});

COMPONENT('confirm', function () {
    var self = this;
    var is = false;
    var visible = false;
    var timer;

    self.readonly();
    self.singleton();

    self.make = function () {
        self.element.addClass('ui-confirm hidden');
        self.element.on('click', 'button', function () {
            self.hide($(this).attr('data-index').parseInt());
        });
    };

    self.confirm = function (message, buttons, fn) {
        self.callback = fn;

        var builder = [];

        buttons.forEach(function (item, index) {
            builder.push('<button data-index="{1}">{0}</button>'.format(item, index));
        });

        self.content('ui-confirm-warning', '<div class="ui-confirm-message">{0}</div>{1}'.format(message.replace(/\n/g, '<br />'), builder.join('')));

        $(window).on('keyup', function (e) {
            if (!visible)
                return;
            if (e.keyCode === 27)
                self.hide();
        });
    };

    self.hide = function (index) {

        if (self.callback)
            self.callback(index);

        self.element.removeClass('ui-confirm-visible');
        if (timer)
            clearTimeout(timer);
        timer = setTimeout(function () {
            visible = false;
            self.element.addClass('hidden');
        }, 1000);
    };

    self.content = function (cls, text) {

        if (!is)
            self.html('<div><div class="ui-confirm-body"></div></div>');

        if (timer)
            clearTimeout(timer);

        visible = true;
        self.element.find('.ui-confirm-body').empty().append(text);
        self.element.removeClass('hidden');
        setTimeout(function () {
            self.element.addClass('ui-confirm-visible');
        }, 5);
    };
});

COMPONENT('visible', function () {
    var self = this;
    var condition = self.attr('data-if');
    self.readonly();
    self.setter = function (value) {

        var is = true;

        if (condition)
            is = EVALUATE(self.path, condition);
        else
            is = value ? true : false;

        self.element.toggleClass('hidden', !is);
    };
});

COMPONENT('checkbox', function () {

    var self = this;
    var isRequired = self.element.attr('data-required') === 'true';

    self.validate = function (value) {
        var is = false;
        var t = typeof (value);

        if (t === 'undefined' || t === 'object')
            value = '';
        else
            value = value.toString();

        is = isRequired ? value === 'true' || value === 'on' : true;
        return is;
    };

    self.make = function () {
        var element = self.element;
        var html = '<label><input type="checkbox" data-component-bind="" /> <span' + (isRequired ? ' class="ui-checkbox-label-required"' : '') + '>' + element.html() + '</span></label>';
        element.addClass('ui-checkbox');
        element.html(html);
    };

    /* self.element.on('change', 'input', function() {
        var fn = self.get(self.attr('data-change'));
        if (fn)
             fn(this);
    });*/
});

COMPONENT('template', function () {

    var self = this;

    self.make = function (template) {

        if (template) {
            self.template = Tangular.compile(template);
            return;
        }

        var script = self.element.find('script');
        self.template = Tangular.compile(script.html());
        script.remove();
    };

    self.setter = function (value) {
        if (!value && !self.element.attr('data-error'))
            return self.element.hide();
        self.element.html(self.template(value)).show();
    };
});

COMPONENT('repeater', function () {

    var self = this;
    self.make = function () {
        //	console.log(self.element);
        var element = self.element.find('script');
        var html = element.html();
        //	console.log(html);
        element.remove();
        self.template = Tangular.compile(html);
    };

    self.getter = null;
    self.setter = function (value) {

        if (!value || value.length === 0) {
            self.element.html('');
            return;
        }

        var builder = '';
        for (var i = 0, length = value.length; i < length; i++) {
            var item = value[i];
            item.index = i;
            builder += self.template(item).replace(/\$index/g, i.toString()).replace(/\$/g, self.path + '[' + i + ']');
        }

        /*if (self.element.attr('data-output')) {
	  var output = self.get(self.attr('data-output'));       
          self.html(output(value));
        }*/

        self.element.empty().append(builder);

        if (builder.indexOf('data-component="') !== -1)
            $.components.compile();
        else $.components();
    };

    self.element.on('click', 'tr', function (e) {
        if (!$(e.target).closest('.btn-group, .btn, a').length) {
            //		console.log(self.attr('data-click'));
            var fn = self.get(self.attr('data-click'));
            //		console.log(fn);
            if (fn) {
                fn(this);
            }
        }
    });
});

COMPONENT('error', function () {
    var self = this;
    var element;

    self.make = function () {
        self.element.append('<ul class="ui-error hidden"></ul>');
        element = self.element.find('ul');
    };

    self.setter = function (value) {

        if (!(value instanceof Array) || value.length === 0) {
            element.toggleClass('hidden', true);
            return;
        }

        var builder = [];
        for (var i = 0, length = value.length; i < length; i++)
            builder.push('<li><span class="fa fa-times-circle"></span> ' + value[i].error + '</li>');

        element.html(builder.join(''));
        element.toggleClass('hidden', false);
    };
});

COMPONENT('colorselector', function () {

    var self = this;
    var colors = ['#DA4453', '#E9573F', '#F6BB42', '#8CC152', '#37BC9B', '#3BAFDA', '#4A89DC', '#967ADC', '#D770AD', '#656D78'];
    var selected;
    var list;
    var required = self.attr('data-required') === 'true';

    self.validate = function (value) {
        return colors.indexOf(value) === -1
    };

    if (!required)
        self.noValid();

    self.make = function () {
        var builder = [];
        var html = self.html();

        if (html)
            builder.push('<div class="ui-colorselector-label">{0}</div>'.format(html));

        builder.push('<ul class="ui-colorselector">');
        for (var i = 0, length = colors.length; i < length; i++)
            builder.push('<li data-index="{0}" style="background-color:{1}"></li>'.format(i, colors[i]));
        builder.push('</ul>');

        self.html(builder.join(''));
        list = self.find('li');

        self.element.on('click', 'li', function (e) {
            var li = $(this);
            self.change(true);
            self.set(colors[parseInt(li.attr('data-index'))]);
        });
    };

    self.setter = function (value) {
        var index = colors.indexOf(value);
        if (selected)
            selected.removeClass('selected');
        if (index === -1)
            return;
        selected = list.eq(index);
        selected.addClass('selected');
    };
});

COMPONENT('crop', function () {
    var self = this;
    var width, height, canvas, context;
    var img = new Image();
    var can = false;
    var is = false;
    var zoom = 100;
    var current = { x: 0, y: 0 };
    var offset = { x: 0, y: 0 };
    var cache = { x: 0, y: 0, zoom: 0 };
    var bgcolor = '';

    self.noValid();
    self.getter = null;

    img.onload = function () {
        can = true;
        zoom = 100;

        var nw = (img.width / 2) >> 0;
        var nh = (img.height / 2) >> 0;

        if (img.width > width) {

            var ratio;
            var p;

            p = (width / (img.width / 100)) >> 0;
            zoom -= zoom - p;
            nh = ((img.height * (p / 100)) / 2) >> 0;
            nw = ((img.width * (p / 100)) / 2) >> 0;
        }

        // centering
        cache.x = current.x = (width / 2) - nw;
        cache.y = current.y = (height / 2) - nh;
        cache.zoom = zoom;

        self.redraw();
    };

    self.resize = function (w, h) {
        width = w;
        height = h;
        canvas.width = w;
        canvas.height = h;
    };

    self.output = function (type) {
        if (type)
            return canvas.toDataURL(type);
        if (!bgcolor && isTransparent(context))
            return canvas.toDataURL('image/png');
        return canvas.toDataURL('image/jpeg');
    };

    self.make = function () {

        bgcolor = self.attr('data-background');
        width = parseInt(self.attr('data-width') || 0);
        height = parseInt(self.attr('data-height') || 0);
        self.element.addClass('ui-crop');
        self.append('<input type="file" style="display:none" accept="image/*" /><ul><li data-type="upload"><span class="fa fa-folder"></span></li><li data-type="plus"><span class="fa fa-plus"></span></li><li data-type="refresh"><span class="fa fa-refresh"></span></li><li data-type="minus"><span class="fa fa-minus"></span></li></ul>');
        self.append(Tangular.render('<canvas width="{{ width }}" height="{{ height }}"></canvas>', { width: width, height: height }));
        canvas = self.find('canvas').get(0);
        context = canvas.getContext('2d');

        self.element.on('click', 'li', function (e) {

            e.preventDefault();
            e.stopPropagation();

            var count = parseInt();
            var type = $(this).attr('data-type');

            switch (type) {
                case 'upload':
                    self.find('input').trigger('click');
                    break;
                case 'plus':
                    zoom += 5;
                    if (zoom > 300)
                        zoom = 300;
                    current.x -= 5;
                    current.y -= 5;
                    self.redraw();
                    break;
                case 'minus':
                    zoom -= 5;
                    if (zoom < 5)
                        zoom = 5;
                    current.x += 5;
                    current.y += 5;
                    self.redraw();
                    break;
                case 'refresh':
                    zoom = cache.zoom;
                    x = cache.x;
                    y = cache.y;
                    self.redraw();
                    break;
            }

        });

        self.find('input').on('change', function () {
            var file = this.files[0];
            var reader = new FileReader();

            reader.onload = function () {
                img.src = reader.result;
                //console.log(img.src);
                setTimeout(function () {
                    self.change();
                }, 500);
            };

            reader.readAsDataURL(file);
            this.value = '';
        });

        $(canvas).on('mousedown', function (e) {

            if (self.disabled || !can)
                return;

            is = true;
            var rect = canvas.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            offset.x = x - current.x;
            offset.y = y - current.y;
        });

        var allow = (self.attr('data-dragdrop') || 'true') === 'true';

        if (allow) {
            $(canvas).on('dragenter dragover dragexit drop dragleave', function (e) {

                if (self.disabled)
                    return;

                e.stopPropagation();
                e.preventDefault();

                switch (e.type) {
                    case 'drop':
                        self.element.removeClass('ui-crop-dragdrop');
                        break;
                    case 'dragenter':
                    case 'dragover':
                        self.element.addClass('ui-crop-dragdrop');
                        return;
                    case 'dragexit':
                    case 'dragleave':
                    default:
                        self.element.removeClass('ui-crop-dragdrop');
                        return;
                }

                var files = e.originalEvent.dataTransfer.files;
                var reader = new FileReader();

                reader.onload = function () {
                    img.src = reader.result;
                    setTimeout(function () {
                        self.change();
                    }, 500);
                };

                reader.readAsDataURL(files[0]);
            });
        }

        self.element.on('mousemove mouseup', function (e) {

            if (e.type === 'mouseup') {
                if (is)
                    self.change();
                is = false;
                return;
            }

            if (self.disabled)
                return;

            if (!can || !is) return;
            var rect = canvas.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            current.x = x - offset.x;
            current.y = y - offset.y;
            self.redraw();
        });
    };

    self.redraw = function () {

        var w = img.width;
        var h = img.height;

        w = ((w / 100) * zoom) >> 0;
        h = ((h / 100) * zoom) >> 0;

        context.clearRect(0, 0, width, height);

        if (bgcolor) {
            context.fillStyle = bgcolor;
            context.fillRect(0, 0, width, height)
        }

        if (can)
            context.drawImage(img, current.x || 0, current.y || 0, w, h);
    };

    self.setter = function (value) {

        if (!value) {
            can = false;
            self.redraw();
            return;
        }

        img.src = (self.attr('data-format') || '{0}').format(value);
    };

    function isTransparent(ctx) {
        var id = ctx.getImageData(0, 0, width, height);
        for (var i = 0, length = id.data.length; i < length; i += 4)
            if (id.data[i + 3] !== 255) return true;
        return false;
    }
});

COMPONENT('radiobutton', function () {
    var self = this;
    var required;

    self.make = function () {
        var options = self.attr('data-options').split(';');
        var builder = [];
        var html = self.html();

        required = self.attr('data-required') === 'true';

        if (html)
            builder.push('<div class="ui-radiobutton-label{1}">{0}</div>'.format(html, required ? ' ui-radiobutton-label-required' : ''));

        options.forEach(function (item) {
            item = item.split('|');
            builder.push('<span data-value="{0}"><i class="fa fa-circle-o"></i>{1}</span>'.format(item[0] || item[1], item[1] || item[0]));
        });

        self.element.addClass('ui-radiobutton');
        self.element.on('click', 'span', function (e) {
            var value = self.parser($(this).attr('data-value'));
            self.dirty(false, true);
            self.getter(value, 2);
        });

        self.html(builder.join(''));
    };

    self.validate = function (value) {
        if (!required)
            return true;
        return value ? true : false;
    };

    self.setter = function (value, path) {
        self.element.find('span').each(function () {
            var el = $(this);
            var is = el.attr('data-value') === (value === null || value === undefined ? null : value.toString());
            el.toggleClass('ui-radiobutton-selected', is);
            el.find('.fa').toggleClass('fa-circle-o', !is).toggleClass('fa-circle', is);
        });
    };
});

COMPONENT('autocomplete', function () {
    var self = this;
    var container;
    var old;
    var onSearch;
    var searchtimeout;
    var searchvalue;
    var blurtimeout;
    var onCallback;
    var datasource;
    var is = false;

    self.template = Tangular.compile('<li{{ if index === 0 }} class="selected"{{ fi }} data-index="{{ index }}"><span>{{ name }}</span><span>{{ type }}</span></li>');
    self.readonly();
    self.singleton();

    self.make = function () {
        self.element.addClass('ui-autocomplete-container');
        self.element.html('<div class="ui-autocomplete"><ul></ul></div>');
        container = self.element.find('ul');

        self.element.on('click', 'li', function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (onCallback)
                onCallback(datasource[+$(this).attr('data-index')], old);
            self.visible(false);
        });

        self.element.on('mouseenter mouseleave', 'li', function (e) {
            $(this).toggleClass('selected', e.type === 'mouseenter');
        });

        $(document).on('click', function (e) {
            if (is)
                self.visible(false);
        });
    };

    function keydown(e) {
        var c = e.keyCode;
        var input = this;

        if (c !== 38 && c !== 40 && c !== 13) {
            if (c !== 8 && c < 32)
                return;
            clearTimeout(searchtimeout);
            searchtimeout = setTimeout(function () {
                var val = input.value;
                if (!val || searchvalue === val)
                    return;
                searchvalue = val;
                onSearch(val, function (value) { self.render(value); });
            }, 200);
            return;
        }

        var current = self.element.find('.selected');

        if (c === 13) {
            self.visible(false);
            if (!current.length)
                return;
            onCallback(datasource[+current.attr('data-index')], old);
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        if (current.length) {
            current.removeClass('selected');
            current = c === 40 ? current.next() : current.prev();
        }

        if (!current.length)
            current = self.element.find('li:{0}-child'.format(c === 40 ? 'first' : 'last'));
        current.addClass('selected');
    }

    function blur() {
        clearTimeout(blurtimeout);
        blurtimeout = setTimeout(function () {
            self.visible(false);
        }, 300);
    }

    self.visible = function (visible) {
        clearTimeout(blurtimeout);
        self.element.toggleClass('hidden', !visible);
        is = visible;
    };

    self.attach = function (input, search, callback, top, left, width) {

        clearTimeout(searchtimeout);

        if (input.setter) {
            input = input.find('input');
        }
        else
            input = $(input);

        if (old) {
            old.removeAttr('autocomplete');
            old.off('blur', blur);
            old.off('keydown', keydown);
        }

        input.on('keydown', keydown);
        input.on('blur', blur);
        input.attr({ 'autocomplete': 'off' });

        old = input;
        /*        console.log(input.offset());
                console.log(input.height());
                console.log(input.width());*/

        var offset = input.offset();
        offset.top += input.height();
        offset.width = input.width();

        if (left)
            //            offset.left += left;
            if (top)
                offset.top += top;
        if (width)
            offset.width += width;

        self.element.css(offset);
        self.refresh();
        input.focus();
        searchvalue = '';
        onSearch = search;
        onCallback = callback;
        self.visible(false);
    };

    self.render = function (arr) {

        datasource = arr;

        if (!arr || !arr.length) {
            self.visible(false);
            return;
        }

        var builder = [];
        for (var i = 0, length = arr.length; i < length; i++) {
            var obj = arr[i];
            obj.index = i;
            builder.push(self.template(obj));
        }

        container.empty().append(builder.join(''));
        self.visible(true);
    };
});

COMPONENT('dropdowncheckbox', function () {

    var self = this;
    var required = self.element.attr('data-required') === 'true';
    var datasource = '';
    var container;
    var data = [];
    var values;

    if (!window.$dropdowncheckboxtemplate)
        window.$dropdowncheckboxtemplate = Tangular.compile('<div><label><input type="checkbox" value="{{ index }}" /><span>{{ text }}</span></label></div>');

    var template = window.$dropdowncheckboxtemplate;

    self.validate = function (value) {
        return required ? value && value.length > 0 : true;
    };

    self.make = function () {

        var options = [];
        var element = self.element;
        var arr = (element.attr('data-options') || '').split(';');

        for (var i = 0, length = arr.length; i < length; i++) {
            var item = arr[i].split('|');
            var value = item[1] === undefined ? item[0] : item[1];
            if (self.type === 'number')
                value = parseInt(value);
            var obj = { value: value, text: item[0], index: i };
            options.push(template(obj));
            data.push(obj);
        }

        var content = element.html();
        var icon = element.attr('data-icon');
        var html = '<div class="ui-dropdowncheckbox"><span class="fa fa-sort"></span><div class="ui-dropdowncheckbox-selected"></div></div><div class="ui-dropdowncheckbox-values hidden">' + options.join('') + '</div>';

        if (content.length > 0) {
            element.empty();
            element.append('<div class="ui-dropdowncheckbox-label' + (required ? ' ui-dropdowncheckbox-label-required' : '') + '">' + (icon ? '<span class="fa ' + icon + '"></span> ' : '') + content + ':</div>');
            element.append(html);
        } else
            element.append(html);

        self.element.addClass('ui-dropdowncheckbox-container');
        container = self.element.find('.ui-dropdowncheckbox-values');
        values = self.element.find('.ui-dropdowncheckbox-selected');

        self.element.on('click', '.ui-dropdowncheckbox', function (e) {

            var el = $(this);
            if (el.hasClass('ui-disabled'))
                return;

            container.toggleClass('hidden');

            if (window.$dropdowncheckboxelement) {
                window.$dropdowncheckboxelement.addClass('hidden');
                window.$dropdowncheckboxelement = null;
            }

            if (!container.hasClass('hidden'))
                window.$dropdowncheckboxelement = container;

            e.stopPropagation();
        });

        self.element.on('click', 'input,label', function (e) {

            e.stopPropagation();

            var is = this.checked;
            var index = parseInt(this.value);
            var value = data[index];

            if (value === undefined)
                return;

            value = value.value;

            var arr = self.get();
            if (!(arr instanceof Array))
                arr = [];

            var index = arr.indexOf(value);

            if (is) {
                if (index === -1)
                    arr.push(value);
            } else {
                if (index !== -1)
                    arr.splice(index, 1);
            }

            self.reset(true);
            self.set(arr, undefined, 2);
        });

        var ds = self.attr('data-source');

        if (!ds)
            return;

        self.watch(ds, prepare);
        setTimeout(function () {
            prepare(ds, GET(ds));
        }, 500);
    };

    function prepare(path, value) {

        if (NOTMODIFIED(path, value))
            return;

        var clsempty = 'ui-dropdowncheckbox-values-empty';

        if (!value) {
            container.addClass(clsempty).empty().html(self.attr('data-empty'));
            return;
        }

        var kv = self.attr('data-source-value') || 'id';
        var kt = self.attr('data-source-text') || 'name';
        var builder = '';

        data = [];
        for (var i = 0, length = value.length; i < length; i++) {
            var isString = typeof (value[i]) === 'string';
            var item = { value: isString ? value[i] : value[i][kv], text: isString ? value[i] : value[i][kt], index: i };
            data.push(item);
            builder += template(item);
        }

        if (builder)
            container.removeClass(clsempty).empty().append(builder);
        else
            container.addClass(clsempty).empty().html(self.attr('data-empty'));

        self.setter(self.get());
    }

    self.setter = function (value) {

        if (NOTMODIFIED(self.id, value))
            return;

        var label = '';
        var empty = self.attr('data-placeholder');

        if (value && value.length) {
            var remove = [];
            for (var i = 0, length = value.length; i < length; i++) {
                var selected = value[i];
                var index = 0;
                var is = false;

                while (true) {
                    var item = data[index++];
                    if (item === undefined)
                        break;
                    if (item.value != selected)
                        continue;
                    label += (label ? ', ' : '') + item.text;
                    is = true;
                }

                if (!is)
                    remove.push(selected);
            }

            var refresh = false;

            while (true) {
                var item = remove.shift();
                if (item === undefined)
                    break;
                value.splice(value.indexOf(item), 1);
                refresh = true;
            }

            if (refresh)
                MAN.set(self.path, value);
        }

        container.find('input').each(function () {
            var index = parseInt(this.value);
            var checked = false;
            if (!value || !value.length)
                checked = false;
            else if (data[index])
                checked = data[index];
            if (checked)
                checked = value.indexOf(checked.value) !== -1;
            this.checked = checked;
        });

        if (!label && value) {
            // invalid data
            // it updates model without notification
            MAN.set(self.path, []);
        }

        if (!label && empty) {
            values.html('<span>{0}</span>'.format(empty));
            return;
        }

        values.html(label);
    };

    self.state = function (type) {
        self.element.find('.ui-dropdowncheckbox').toggleClass('ui-dropdowncheckbox-invalid', self.isInvalid());
    };

    if (window.$dropdowncheckboxevent)
        return;

    window.$dropdowncheckboxevent = true;
    $(document).on('click', function (e) {
        if (!window.$dropdowncheckboxelement)
            return;
        window.$dropdowncheckboxelement.addClass('hidden');
        window.$dropdowncheckboxelement = null;
    });
});

COMPONENT('audio', function () {
    var self = this;
    var can = false;
    var volume = 0.5;

    self.items = [];
    self.readonly();
    self.singleton();

    self.make = function () {
        var audio = document.createElement('audio');
        if (audio.canPlayType && audio.canPlayType('audio/mpeg').replace(/no/, ''))
            can = true;
    };

    self.play = function (url, loop) {

        if (!can)
            return;

        var audio = new window.Audio();

        audio.src = url;
        audio.volume = volume;
        audio.loop = (loop) ? true : false;
        audio.play();

        audio.onended = function () {
            audio.$destroy = true;
            self.cleaner();
        };

        audio.onerror = function () {
            audio.$destroy = true;
            self.cleaner();
        };

        audio.onabort = function () {
            audio.$destroy = true;
            self.cleaner();
        };

        self.items.push(audio);
        return self;
    };

    self.cleaner = function () {
        var index = 0;
        while (true) {
            var item = self.items[index++];
            if (item === undefined)
                return self;
            if (!item.$destroy)
                continue;
            item.pause();
            item.onended = null;
            item.onerror = null;
            item.onsuspend = null;
            item.onabort = null;
            item = null;
            index--;
            self.items.splice(index, 1);
        }
        return self;
    };

    self.stop = function (url) {
        if (!url) {
            self.items.forEach(function (item) {
                console.log(item);
                item.$destroy = true;
            });
            return self.cleaner();
        }

        var index = self.items.findIndex(function (item) {
            var pos = 0;
            url.indexOf(item.src, pos);
            if (pos > -1) return true;
        });

        if (index === -1)
            return self;
        self.items[index].$destroy = true;
        return self.cleaner();
    };

    self.setter = function (value) {

        if (value === undefined)
            value = 0.5;
        else
            value = (value / 100);

        if (value > 1)
            value = 1;
        else if (value < 0)
            value = 0;

        volume = value ? +value : 0;
        for (var i = 0, length = self.items.length; i < length; i++) {
            var a = self.items[i];
            if (!a.$destroy)
                a.volume = value;
        }
    };
});
//NATIFICATIONS
COMPONENT('notifications', function () {
    var self = this;
    var autoclosing;

    self.singleton();
    self.readonly();
    self.template = Tangular.compile('<div class="ui-notification {{ type }}" data-id="{{ id }}"{{ if callback }} style="cursor:pointer"{{ fi }}><i class="fa fa-times-circle"></i><div class="ui-notification-icon">{{if icon }}<i class="fa {{ icon }}"></i>{{fi}}{{if image }}{{ image | raw }}{{fi}}</div><div class="ui-notification-message"><div class="ui-notification-datetime">{{ date | format(\'{0}\') }}</div>{{ message | raw }}</div></div>'.format(self.attr('data-date-format') || 'yyyy-MM-dd HH:mm'));
    self.items = {};

    self.make = function () {

        self.element.addClass('ui-notification-container');

        self.element.on('click', '.fa-times-circle', function () {
            var el = $(this).closest('.ui-notification');
            self.close(+el.attr('data-id'));
            clearTimeout(autoclosing);
            autoclosing = null;
            self.autoclose();
        });

        self.element.on('click', 'a,button', function () {
            e.stopPropagation();
        });

        self.element.on('click', '.ui-notification', function (e) {
            var el = $(this);
            var id = +el.attr('data-id');
            var obj = self.items[id];
            if (!obj || !obj.callback)
                return;
            obj.callback();
            self.close(id);
        });
    };

    self.close = function (id) {
        var obj = self.items[id];
        if (!obj)
            return;
        obj.callback = null;
        delete self.items[id];
        self.find('div[data-id="{0}"]'.format(id)).remove();
    };
    //icon, message, date
    self.append = function (o, callback) {
        type = (o.t) ? o.t : '';
        icon = (o.ic) ? 'fa-' + o.ic : null;
        image = (o.im) ? "<img class='img-rounded img-responsive' src='" + o.im + "'>" : null;

        if (typeof (o.dt) === 'function') {
            callback = o.d;
            o.d = null;
        }

        var obj = { id: Math.floor(Math.random() * 100000), type, icon, image, message: o.m, date: o.d || new Date(), callback: callback };
        self.items[obj.id] = obj;
        self.element.append(self.template(obj));
        self.autoclose();
    };

    self.autoclose = function () {
        console.log(self.attr('data-timeout'));

        if (autoclosing)
            return self;

        autoclosing = setTimeout(function () {
            clearTimeout(autoclosing);
            autoclosing = null;
            var el = self.find('.ui-notification');
            if (el.length > 1)
                self.autoclose();
            if (el.length)
                self.close(+el.eq(0).attr('data-id'));
        }, +self.attr('data-timeout') || 5000);
    };
});

COMPONENT('range', function () {
    var self = this;
    var required = self.attr('data-required');

    self.noValid();

    self.make = function () {
        var name = self.html();
        if (name)
            name = '<div class="ui-range-label{1}">{0}</div>'.format(name, required ? ' ui-range-label-required' : '');
        var attrs = [];
        attrs.attr('step', self.attr('data-step'));
        attrs.attr('max', self.attr('data-max'));
        attrs.attr('min', self.attr('data-min'));
        self.element.addClass('ui-range');
        self.html('{0}<input type="range" data-component-bind=""{1} />'.format(name, attrs.length ? ' ' + attrs.join(' ') : ''));
    };
});