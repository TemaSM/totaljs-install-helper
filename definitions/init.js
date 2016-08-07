'use strict';

const Settings = MODEL('Settings');
const InstallHelper = MODULE('install-helper');

F.on('load', () => {	
	Settings.scripts();
	InstallHelper.check(isConfigured => {
		// console.log(isConfigured)
	});
});