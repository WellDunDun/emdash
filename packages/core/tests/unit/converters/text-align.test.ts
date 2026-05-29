import { describe, it, expect } from "vitest";

import { portableTextToProsemirror } from "../../../src/content/converters/portable-text-to-prosemirror.js";
import { prosemirrorToPortableText } from "../../../src/content/converters/prosemirror-to-portable-text.js";
import type {
	PortableTextTextBlock,
	ProseMirrorDocument,
} from "../../../src/content/converters/types.js";

describe("Text alignment round-trip", () => {
	it("forwards paragraph textAlign from ProseMirror to Portable Text", () => {
		const doc: ProseMirrorDocument = {
			type: "doc",
			content: [
				{
					type: "paragraph",
					attrs: { textAlign: "center" },
					content: [{ type: "text", text: "Centered" }],
				},
			],
		};

		const blocks = prosemirrorToPortableText(doc);
		const block = blocks[0] as PortableTextTextBlock;

		expect(block._type).toBe("block");
		expect(block.style).toBe("normal");
		expect(block.textAlign).toBe("center");
	});

	it("forwards heading textAlign from ProseMirror to Portable Text", () => {
		const doc: ProseMirrorDocument = {
			type: "doc",
			content: [
				{
					type: "heading",
					attrs: { level: 2, textAlign: "right" },
					content: [{ type: "text", text: "Right-aligned heading" }],
				},
			],
		};

		const blocks = prosemirrorToPortableText(doc);
		const block = blocks[0] as PortableTextTextBlock;

		expect(block.style).toBe("h2");
		expect(block.textAlign).toBe("right");
	});

	it("omits textAlign when not set (keeps existing content unchanged)", () => {
		const doc: ProseMirrorDocument = {
			type: "doc",
			content: [
				{
					type: "paragraph",
					content: [{ type: "text", text: "No alignment" }],
				},
			],
		};

		const blocks = prosemirrorToPortableText(doc);
		const block = blocks[0] as PortableTextTextBlock;

		expect(block).not.toHaveProperty("textAlign");
	});

	it("omits textAlign when set to the default 'left'", () => {
		// TipTap's @tiptap/extension-text-align defaults the attr to "left";
		// persisting it would needlessly mutate every existing block.
		const doc: ProseMirrorDocument = {
			type: "doc",
			content: [
				{
					type: "paragraph",
					attrs: { textAlign: "left" },
					content: [{ type: "text", text: "Default left" }],
				},
			],
		};

		const blocks = prosemirrorToPortableText(doc);
		const block = blocks[0] as PortableTextTextBlock;

		expect(block).not.toHaveProperty("textAlign");
	});

	it("round-trips textAlign through PT → PM → PT", () => {
		const original: PortableTextTextBlock = {
			_type: "block",
			_key: "abc",
			style: "normal",
			textAlign: "justify",
			children: [{ _type: "span", _key: "s1", text: "Justified text" }],
		};

		const pm = portableTextToProsemirror([original]);
		const paragraph = pm.content[0];

		expect(paragraph.type).toBe("paragraph");
		expect(paragraph.attrs?.textAlign).toBe("justify");

		const roundTripped = prosemirrorToPortableText(pm)[0] as PortableTextTextBlock;
		expect(roundTripped.textAlign).toBe("justify");
	});

	it("round-trips heading textAlign through PT → PM → PT", () => {
		const original: PortableTextTextBlock = {
			_type: "block",
			_key: "h1",
			style: "h3",
			textAlign: "center",
			children: [{ _type: "span", _key: "s1", text: "Centered heading" }],
		};

		const pm = portableTextToProsemirror([original]);
		const heading = pm.content[0];

		expect(heading.type).toBe("heading");
		expect(heading.attrs?.level).toBe(3);
		expect(heading.attrs?.textAlign).toBe("center");

		const roundTripped = prosemirrorToPortableText(pm)[0] as PortableTextTextBlock;
		expect(roundTripped.style).toBe("h3");
		expect(roundTripped.textAlign).toBe("center");
	});
});
