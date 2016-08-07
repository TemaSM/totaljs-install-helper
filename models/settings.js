// TODO: WTF? Models is just for data-models, we should move contents of this file...

exports.id = 'Settings';
exports.version = '0.0.1';

var Settings = NEWSCHEMA('Settings');
var _this = this;

exports.scripts = function () {
    var p={ mn : {f: 'debug/main/',   t: 'app/main/'},
            ut : {f: 'debug/utilit/', t: 'app/utilit/'}
        };
    // MAIN 
    F.merge(p.mn.t+'js/main.min.js',[p.mn.f+'jquery-2.2.0.min.js', 
                                     p.mn.f+'bootstrap/bootstrap.min.js', 
                                     p.mn.f+'fastclick/fastclick.min.js', 
                                     p.mn.f+'lodash.js',                               
		                     p.mn.f+'jcta.min.js',
                                     p.mn.f+'app.js'
                                    ]);
    F.merge(p.mn.t+'js/theme.min.js', [p.mn.f+'AdminLTE/js/app.js', 
				       p.mn.f+'theme.js',
				      ]);

    F.merge(p.mn.t+'js/comp.min.js', [p.mn.f+'app-ui.js']);

    F.merge(p.mn.t+'css/main.css', [p.mn.f+'bootstrap/bootstrap.min.css', 
                                    p.mn.f+'AdminLTE/css/_all-skins.min.css', 
                                    p.mn.f+'AdminLTE/css/AdminLTE.min.css',                               
                                    p.mn.f+'font-awesome/css/font-awesome.css', 
                                    p.mn.f+'default.css', 
                                    p.mn.f+'font-awesome-animation.min.css']);

    F.map(p.mn.t+'img',   p.mn.f+'AdminLTE/img/', ['.png', '.gif', '.jpg']);
    F.map(p.mn.t+'fonts', p.mn.f+'bootstrap/fonts/', ['.otf', '.eot', '.svg', '.ttf', '.woff', '.woff2']);
    F.map(p.mn.t+'fonts', p.mn.f+'font-awesome/fonts/', ['.otf', '.eot', '.svg', '.ttf', '.woff', '.woff2']);
    // UTILIT
    /*F.merge(p.ut.t+'js/utilit.min.js'  [p.ut.f+'validation/validation.js']);*/
    /*F.merge(p.ut.t+'css/utilit.css' [p.ut.f+'validation/style.css']);*/

}
exports.Settings = Settings;