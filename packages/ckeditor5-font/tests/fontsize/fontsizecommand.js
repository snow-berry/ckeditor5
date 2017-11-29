/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import FontSizeCommand from '../../src/fontsize/fontsizecommand';

import Command from '@ckeditor/ckeditor5-core/src/command';
import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'FontSizeCommand', () => {
	let editor, doc, command;

	beforeEach( () => {
		return ModelTestEditor.create()
			.then( newEditor => {
				doc = newEditor.document;
				command = new FontSizeCommand( newEditor, 'text-huge' );
				editor = newEditor;

				editor.commands.add( 'fontSize', command );

				doc.schema.registerItem( 'paragraph', '$block' );

				doc.schema.allow( { name: '$inline', attributes: 'fontSize', inside: '$block' } );
			} );
	} );

	afterEach( () => {
		editor.destroy();
	} );

	it( 'is a command', () => {
		expect( FontSizeCommand.prototype ).to.be.instanceOf( Command );
		expect( command ).to.be.instanceOf( Command );
	} );

	describe( 'value', () => {
		it( 'is set to true when selection is in text with fontSize attribute', () => {
			setData( doc, '<paragraph><$text fontSize="text-huge">fo[]o</$text></paragraph>' );

			expect( command ).to.have.property( 'value', true );
		} );

		it( 'is undefined when selection is not in text with fontSize attribute', () => {
			setData( doc, '<paragraph>fo[]o</paragraph>' );

			expect( command ).to.have.property( 'value', false );
		} );
	} );

	describe( 'isEnabled', () => {
		it( 'is true when selection is on text which can have fontSize added', () => {
			setData( doc, '<paragraph>fo[]o</paragraph>' );

			expect( command ).to.have.property( 'isEnabled', true );
		} );
	} );

	describe( 'execute()', () => {
		it( 'should add fontSize attribute on selected text', () => {
			setData( doc, '<paragraph>a[bc<$text fontSize="text-huge">fo]obar</$text>xyz</paragraph>' );

			expect( command.value ).to.be.false;

			command.execute();

			expect( command.value ).to.be.true;

			expect( getData( doc ) ).to.equal( '<paragraph>a[<$text fontSize="text-huge">bcfo]obar</$text>xyz</paragraph>' );
		} );

		it( 'should add fontSize attribute on selected nodes (multiple nodes)', () => {
			setData(
				doc,
				'<paragraph>abcabc[abc</paragraph>' +
				'<paragraph>foofoofoo</paragraph>' +
				'<paragraph>barbar]bar</paragraph>'
			);

			command.execute();

			expect( command.value ).to.be.true;

			expect( getData( doc ) ).to.equal(
				'<paragraph>abcabc[<$text fontSize="text-huge">abc</$text></paragraph>' +
				'<paragraph><$text fontSize="text-huge">foofoofoo</$text></paragraph>' +
				'<paragraph><$text fontSize="text-huge">barbar</$text>]bar</paragraph>'
			);
		} );

		it( 'should change fontSize attribute on selected nodes', () => {
			setData(
				doc,
				'<paragraph>abc[abc<$text fontSize="text-small">abc</$text></paragraph>' +
				'<paragraph><$text fontSize="text-small">foofoofoo</$text></paragraph>' +
				'<paragraph><$text fontSize="text-small">bar]bar</$text>bar</paragraph>'
			);

			command.execute();

			expect( command.value ).to.be.true;

			expect( getData( doc ) ).to.equal(
				'<paragraph>abc[<$text fontSize="text-huge">abcabc</$text></paragraph>' +
				'<paragraph><$text fontSize="text-huge">foofoofoo</$text></paragraph>' +
				'<paragraph><$text fontSize="text-huge">bar</$text>]<$text fontSize="text-small">bar</$text>bar</paragraph>'
			);
		} );

		it( 'should do nothing on collapsed range', () => {
			setData( doc, '<paragraph>abc<$text fontSize="text-huge">foo[]bar</$text>xyz</paragraph>' );

			expect( command.value ).to.be.true;

			command.execute();

			expect( getData( doc ) ).to.equal( '<paragraph>abc<$text fontSize="text-huge">foo[]bar</$text>xyz</paragraph>' );

			expect( command.value ).to.be.true;
		} );
	} );
} );
