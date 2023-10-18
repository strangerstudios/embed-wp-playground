/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-i18n/
 */
import { __ } from '@wordpress/i18n';

/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import { useBlockProps } from '@wordpress/block-editor';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, ToggleControl, SelectControl } from '@wordpress/components';


/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {Element} Element to render.
 */
export default function Edit({ attributes, setAttributes }) {
	const blockProps = useBlockProps({});

	const stepTypes = {
		'': {
			'name': __( 'Select a Step', 'embed-wp-playground' ),
			'parameters': {},
		},
		'installPlugin': {
			'name': __( 'InstallPluginStep', 'embed-wp-playground' ),
			'parameters': {
				'pluginZipFile': {
					'label': __( 'Plugin Zip File', 'embed-wp-playground' ),
					'dataType': 'ResourceType', // https://wordpress.github.io/wordpress-playground/blueprints-api/resources
					'default': {
						'resource': 'wordpress.org/plugins',
					}
				},
				'options': {
					'label': __( 'Options', 'embed-wp-playground' ),
					'dataType': 'InstallPluginOptions',
					'default': {
						'activate': true,
					}
				}
			}
		},
		'installTheme': {
			'name': __( 'InstallThemeStep', 'embed-wp-playground' ),
			'parameters': {
				'themeZipFile': {
					'label': __( 'Theme Zip File', 'embed-wp-playground' ),
					'dataType': 'ResourceType',
					'default': {
						'resource': 'wordpress.org/themes',
					}
				},
				'options': {
					'label': __( 'Options', 'embed-wp-playground' ),
					'dataType': 'InstallPluginOptions',
					'default': {
						'activate': true,
					}
				}
			}
		},
		'login': {
			'name': __( 'LoginStep', 'embed-wp-playground' ),
			'parameters': {
				'username': {
					'label': __( 'Username', 'embed-wp-playground' ),
					'dataType': 'string',
					'default': 'admin'
				},
				'password': {
					'label': __( 'Password', 'embed-wp-playground' ),
					'dataType': 'string',
					'default': 'password'
				}
			}
		},
		'runPHP': {
			'name': __( 'RunPHPStep', 'embed-wp-playground' ),
			'parameters': {
				'code': {
					'label': __( 'Code', 'embed-wp-playground' ),
					'dataType': 'string',
					'default': ''
				}
			}
		},
		'setSiteOptions': {
			'name': __( 'SetSiteOptionsStep', 'embed-wp-playground' ),
			'parameters': {
				'options': {
					'label': __( 'Options', 'embed-wp-playground' ),
					'dataType': 'Record',
					'default': {}
				}
			}
		},
		'updateUserMeta': {
			'name': __( 'UpdateUserMetaStep', 'embed-wp-playground' ),
			'parameters': {
				'userId': {
					'label': __( 'User ID', 'embed-wp-playground' ),
					'dataType': 'number',
					'default': '1'
				},
				'meta': {
					'label': __( 'Meta', 'embed-wp-playground' ),
					'dataType': 'Record',
					'default': {}
				}
			}
		},
	};
	const stepControls = attributes.steps.map( ( step, index ) => {
		const stepType = stepTypes[ step.step ];
		const stepDropdown = <SelectControl
			label={ __( 'Step Type', 'embed-wp-playground') }
			value={ step.step }
			options={ Object.keys( stepTypes ).map( ( key ) => {
				// Make the label the name of the step and the value the step type.
				return { label: stepTypes[ key ].name, value: key };
			} ) }
			onChange={ ( step ) => {
				// Update the step type and reset the options to the defaults for the new step type.
				const newSteps = [ ...attributes.steps ];
				 newSteps[ index ] = { step, ...Object.keys( stepTypes[ step ].parameters ).reduce( ( acc, key ) => {
				 	acc[ key ] = stepTypes[ step ].parameters[ key ].default;
				 	return acc;
				 }, {} ) };
				setAttributes( { steps: newSteps } );
			} }
		/>;
		const stepControl = Object.keys( stepType.parameters ).map( ( key ) => {
			const value = step[ key ];
			const type = stepType.parameters[ key ].dataType;
			const onChange = ( value ) => {
				const newSteps = [ ...attributes.steps ];
				newSteps[ index ][ key ] = value;
				setAttributes( { steps: newSteps } );
			};
			if ( type === 'InstallPluginOptions' ) {
				// Right now, the only option is activate. It should be a ToggleControl.
				return (
					<ToggleControl
						label={ __( 'Activate', 'embed-wp-playground' )}
						checked={ value.activate }
						onChange={ ( activate ) => {
							onChange( { ...value, activate } );
						} }
					/>
				);
			}
			if ( type === 'number' ) {
				return (
					<TextControl
						label={ stepType.parameters[ key ].label }
						type="number"
						value={ value }
						onChange={ onChange }
					/>
				);
			}
			if ( type === 'Record' ) {
				// Let's map all the options. Each key should be read-only and each value should be editable. There should be a button to remove the option.
				// At the end, there should be a button to add a new option key.
				const recordControls = Object.keys( value ).map( ( key ) => {
					const record = value[ key ];
					return (
						<>
							<TextControl
								label={ key }
								value={ record }
								onChange={ ( record ) => {
									onChange( { ...value, [ key ]: record } );
								} }
							/>
							<button
								onClick={ () => {
									const newRecords = { ...value };
									delete newRecords[ key ];
									onChange( newRecords );
								} }
							>{ __( 'Remove Option', 'embed-wp-playground' ) }</button>
							<hr />
						</>
					);
				} );

				// Add a text field with a button to add a new option key.
				// The text field should not create a new option until the button is clicked.
				const newRecordControl = <>
					<TextControl
						label={ __( 'Add New Option', 'embed-wp-playground' ) }
						help={ __( 'The key for the new option.', 'embed-wp-playground' ) }
						value={ attributes.newRecordKey }
						onChange={ ( newRecordKey ) => setAttributes( { newRecordKey } ) }
					/>
					<button
						onClick={ () => {
							const newRecords = { ...value };
							newRecords[ attributes.newRecordKey ] = '';
							onChange( newRecords );
							setAttributes( { newRecordKey: '' } );
						} }
					>{ __( 'Add Option', 'embed-wp-playground' ) }</button>
					<hr />
				</>;
				return (
					<>
						{ recordControls }
						{ newRecordControl }
					</>
				);
			}
			if ( type === 'ResourceType' ) {
				// Labels should be the same as the resource types.
				const resourceSelect = <SelectControl
					label={ __( 'Resource Type', 'embed-wp-playground' )}
					value={ value.resource }
					options={ [ { label: 'CorePluginReference', value: 'wordpress.org/plugins' }, { label: 'CoreThemeReference', value: 'wordpress.org/themes' }, { label: 'URLReference', value: 'url' } ] }
					onChange={ ( resource ) => {
						// Delete the slug or url if the resource type changes and also update the resource type.
						const newValue = { ...value, resource };
						if ( resource !== value.resource ) {
							delete newValue.slug;
							delete newValue.url;
						}
						onChange( newValue );
					} }
					/>

				// Show the appropriate text field based on the resource type.
				var resourceValue = null;
				switch ( value.resource ) {
					case 'wordpress.org/plugins':
					case 'wordpress.org/themes':
						resourceValue = <TextControl
							label={ __( 'Slug', 'embed-wp-playground' )}
							value={ value.slug ? value.slug : '' }
							onChange={ ( slug ) => {
								onChange( { ...value, slug } );
							} }
						/>;
						break;
					case 'url':
						resourceValue = <TextControl
							label={ __( 'URL', 'embed-wp-playground' )}
							value={ value.url ? value.url : '' }
							onChange={ ( url ) => {
								onChange( { ...value, url } );
							} }
						/>;
						break;
				}
				return (
					<>
						{ resourceSelect }
						{ resourceValue }
					</>
				);
			}
			if ( type === 'string' ) {
				return (
					<TextControl
						label={ stepType.parameters[ key ].label }
						value={ value }
						onChange={ onChange }
					/>
				);
			}
		} );

		const deleteStepControl = <button
			onClick={ () => {
				const newSteps = [ ...attributes.steps ];
				newSteps.splice( index, 1 );
				setAttributes( { steps: newSteps } );
			} }
		>{ __('Delete Step', 'embed-wp-playground') }</button>;

		return (
			<PanelBody title={ __( 'Step', 'embed-wp-playground' ) + ' ' + ( index + 1 ) + ' (' + stepType.name + ')' } initialOpen={ false }>
				{ stepDropdown }
				{ stepControl }
				{ deleteStepControl }
			</PanelBody>
		);

	} );

	const addStepControl = <PanelBody>
		<button
			onClick={ () => {
				const newSteps = [ ...attributes.steps ];
				newSteps.push( { step: '', ...stepTypes[ '' ].parameters } );
				setAttributes( { steps: newSteps } );
			} }
		>{ __('Add Step', 'embed-wp-playground') }</button>
	</PanelBody>;

	// For the UI, we want to show a box where the playground div will be placed.
	return (
		<>
			<InspectorControls>
				<PanelBody title={ __('Playground Settings', 'embed-wp-playground') }>
					<TextControl
						label={ __( 'Landing Page', 'embed-wp-playground' )}
						help={ __( 'The URL of the landing page for the playground.', 'embed-wp-playground' )}
						value={ attributes.landingPage }
						onChange={ ( landingPage ) => setAttributes( { landingPage } ) }
					/>
					<TextControl
						label={ __( 'Preferred PHP Version', 'embed-wp-playground' )}
						help={ __( 'The preferred PHP version for the playground.', 'embed-wp-playground' )}
						value={ attributes.preferredVersions.php }
						onChange={ ( php ) => setAttributes( { preferredVersions: { ...attributes.preferredVersions, php } } ) }
					/>
					<TextControl
						label={ __( 'Preferred WordPress Version', 'embed-wp-playground' )}
						help={ __( 'The preferred WordPress version for the playground.', 'embed-wp-playground' )}
						value={ attributes.preferredVersions.wp }
						onChange={ ( wp ) => setAttributes( { preferredVersions: { ...attributes.preferredVersions, wp } } ) }
					/>
				</PanelBody>
				<PanelBody title={ __('Blueprint Steps', 'embed-wp-playground') }>
					<p>{ __( 'These steps will be run when the playground is created.', 'embed-wp-playground' ) }</p>
					{ stepControls }
					{ addStepControl }
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps }>
				<span className="embed-wp-playground-title">{ __( 'WordPress Playground', 'embed-wp-playground' ) }</span>
			</div>
		</>
	);
}
