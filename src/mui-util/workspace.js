/*
 ---

 name: workspace

 script: workspace.js

 description: MUI - Save and load workspaces. The Workspaces emulate Adobe Illustrator functionality
 remembering what windows are open and where they are positioned.

 copyright: (c) 2010 Contributors in (/AUTHORS.txt).

 license: MIT-style license in (/MIT-LICENSE.txt).

 note:
 This documentation is taken directly from the javascript source files. It is built using Natural Docs.

 requires:
 - Core/Element
 - Core/Class
 - Core/Options
 - Core/Events
 - MUI
 - MUI.Core

 provides: [MUI.saveWorkspace, MUI.loadWorkspace]
 ...
 */

MUI.files[MUI.path.utils + 'workspace.js'] = 'loaded';

MUI.extend({

	/*

	 Function: saveWorkspace
	 Save the current workspace.

	 Syntax:
	 (start code)
	 MUI.saveWorkspace();
	 (end)

	 Notes:
	 This version saves the ID of each open window to a cookie, and reloads those windows using the functions in mocha-init.js. This requires that each window have a function in mocha-init.js used to open them. Functions must be named the windowID + "Window". So if your window is called mywindow, it needs a function called mywindowWindow in mocha-init.js.

	 */
	saveWorkspace: function(){
		this.cookie = new Hash.Cookie('mochaUIworkspaceCookie', {duration: 3600});
		this.cookie.empty();

		MUI.each(function(instance){
			if (instance.className != 'MUI.Window') return;
			instance.saveValues();
			this.cookie.set(instance.options.id, {
				'id': instance.options.id,
				'top': instance.options.y,
				'left': instance.options.x,
				'width': instance.contentWrapperEl.getStyle('width').toInt(),
				'height': instance.contentWrapperEl.getStyle('height').toInt()
			});
		}.bind(this));
		this.cookie.save();

		new MUI.Window({
			loadMethod: 'html',
			type: 'notification',
			addClass: 'notification',
			content: 'Workspace saved.',
			closeAfter: '1400',
			width: 200,
			height: 40,
			y: 53,
			padding: { top: 10, right: 12, bottom: 10, left: 12 },
			shadowBlur: 5
		});

	},

	windowUnload: function(){
		if ($$('.mocha').length == 0 && this.myChain){
			this.myChain.callChain();
		}
	},

	loadWorkspace2: function(workspaceWindows){
		workspaceWindows.each(function(workspaceWindow){
			windowFunction = MUI[workspaceWindow.id + 'Window'];
			if (windowFunction) windowFunction();
			// currently disabled positioning of windows, that would need to be passed to the MUI.Window call
			/*if (windowFunction){
				windowFunction({
					width: workspaceWindow.width,
					height: workspaceWindow.height
				});
				var windowEl = $(workspaceWindow.id);
				windowEl.setStyles({
					'top': workspaceWindow.top,
					'left': workspaceWindow.left
				});
				var instance = windowEl.retrieve('instance');
				instance.contentWrapperEl.setStyles({
					'width': workspaceWindow.width,
					'height': workspaceWindow.height
				});
				instance.drawWindow();
			}*/
		}.bind(this));
		this.loadingWorkspace = false;
	},

	/*
	 Function: loadWorkspace
	 Load the saved workspace.

	 Syntax:
	 (start code)
	 MUI.loadWorkspace();
	 (end)
	 */
	loadWorkspace: function(){
		cookie = new Hash.Cookie('mochaUIworkspaceCookie', {duration: 3600});
		workspaceWindows = cookie.load();

		if (!cookie.getKeys().length){
			new MUI.Window({
				loadMethod: 'html',
				type: 'notification',
				addClass: 'notification',
				content: 'You have no saved workspace.',
				closeAfter: '1400',
				width: 220,
				height: 40,
				y: 25,
				padding: { top: 10, right: 12, bottom: 10, left: 12 },
				shadowBlur: 5
			});
			return;
		}

		if ($$('.mocha').length != 0){
			this.loadingWorkspace = true;
			this.myChain = new Chain();
			this.myChain.chain(
				function(){
					$$('.mocha').each(function(el){
						el.close();
					});
					this.myChain.callChain();
				}.bind(this),
				function(){
					MUI.loadWorkspace2(workspaceWindows);
				}.bind(this)
			);
			this.myChain.callChain();
		} else {
			MUI.loadWorkspace2(workspaceWindows);
		}

	}

});
