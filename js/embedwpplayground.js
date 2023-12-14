import { startPlaygroundWeb } from 'https://unpkg.com/@wp-playground/client/index.js';

if ( typeof embedwpplayground_setups !== 'undefined' && embedwpplayground_setups !== null ) {
    // Get all of the iframe IDs.
    for ( const iframe_id in embedwpplayground_setups ) {
        const setup = embedwpplayground_setups[ iframe_id ];

        const client = await startPlaygroundWeb({
            iframe: document.getElementById( iframe_id ),
            remoteUrl: `https://playground.wordpress.net/remote.html`,
            blueprint: {
                landingPage: setup.landingPage,
                preferredVersions: {
                    php: setup.phpVersion,
                    wp: setup.wpVersion,
                },
                steps: setup.steps,
            },
        });
    
        client.run();
    }

    // Make sure we don't run this again.
    embedwpplayground_setups = null;
}