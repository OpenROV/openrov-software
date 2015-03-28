The UI has several parts.  Items such as the light indicator, gamepad indicator, etc can be found in /static/ui-plugins/standard/public/webcomponents

If you want to add a new element you will need to "inject" it in to the standard UI set.

In a typical plugin you will have /src/plugins/< my plugin >

In the < my plugin > folder, you have a /public folder which represents all of the assets that are to be accessible from the web browser.








The file you are overriding is brightness-indicator

You create a new theme /static/ui-plugins/< new-theme-name >
