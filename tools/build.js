{
    appDir: '../js',
    mainConfigFile: '../js/main.js',
    dir: '../dist/js',
    baseUrl: '..',
    allowSourceOverwrites: true,
    paths: { requireLib: 'bower_components/requirejs/require'},
    
    modules: [
        //First set up the common build layer.
        {
            //module names are relative to baseUrl
            name: 'js/main',
            include: ['requireLib']

        }
    ]
}