---
"emdash": patch
---

Preserve text alignment in rich-text content. Previously, clicking the
Align Center / Right / Justify buttons in the Portable Text editor toolbar
visually centered the text but the alignment was silently dropped during
ProseMirror → Portable Text conversion, so saved content reverted to left
alignment on reload. `PortableTextTextBlock` now carries an optional
`textAlign` field (`"left" | "center" | "right" | "justify"`), and both
converters round-trip the value for paragraphs and headings. Existing
content without an explicit alignment is unchanged. (#1201)
