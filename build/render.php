<?php
/**
 * @see https://github.com/WordPress/gutenberg/blob/trunk/docs/reference-guides/block-api/block-metadata.md#render
 */

// Validate versions.
$preferred_versions = $attributes['preferredVersions'];
foreach ( $preferred_versions as $key => $version ) {
	if ( ! preg_match( '/^\d+\.\d+(\.\d+)?$/', $version ) ) {
		$preferred_versions[ $key ] = 'latest';
	}
}

// Remove blank steps, but make sure that indexes are preserved.
$modified_steps = array();
foreach ( $attributes['steps'] as $index => $step ) {
	// Show error for empty steps and skip.
	if ( empty( $step['step'] ) ) {
		if ( current_user_can( 'manage_options' ) ) {
			echo '<div class="notice notice-error"><p>' . esc_html__( 'A step is missing a step type.', 'embed-wp-playground' ) . '</p></div>';
		}
		continue;
	}

	// For the updateUserMeta step, the user ID needs to be an int, not a string.
	if ( 'updateUserMeta' === $step['step'] ) {
		$step['userId'] = (int) $step['userId'];
	}

	// If we get here, the step is valid. Add it.
	$modified_steps[] = $step;
}

// Create a unique ID for the iframe.
$iframe_id = 'embed-wp-playground-' . wp_generate_uuid4();

?>
<iframe id="<?php echo esc_attr( $iframe_id ); ?>" class="embed-wp-playground-iframe"></iframe>
<script type="module">
	import { startPlaygroundWeb } from 'https://unpkg.com/@wp-playground/client/index.js';

	const client = await startPlaygroundWeb({
		iframe: document.getElementById('<?php echo esc_attr( $iframe_id ); ?>'),
		remoteUrl: `https://playground.wordpress.net/remote.html`,
		blueprint: {
			landingPage: '<?php echo esc_html( $attributes['landingPage'] ); ?>',
			preferredVersions: {
				php: '<?php echo esc_html( empty( $preferred_versions['php'] ) ? 'latest' : $preferred_versions['php'] ); ?>',
				wp: '<?php echo esc_html( empty( $preferred_versions['wp'] ) ? 'latest' : $preferred_versions['wp'] ); ?>',
			},
			steps: <?php echo wp_json_encode( $modified_steps ); ?>,
		},
	});

	client.run();
</script>