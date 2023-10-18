<?php
/**
 * Plugin Name:       Embed WP Playground
 * Description:       Embed the WordPress Playground via the block editor.
 * Version:           0.1.0
 * Author:            Stranger Studios
 * Author URI:        https://strangerstudios.com
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       embed-wp-playground
 * Domain Path:       /languages
 */

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function embedwpplayground_block_init() {
	register_block_type( __DIR__ . '/build' );
}
add_action( 'init', 'embedwpplayground_block_init' );
