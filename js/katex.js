// KaTeX auto-render configuration
// Single $ is NOT used for math so currency notation like $50 (the course kit
// price) renders as plain text instead of triggering equation rendering.
// Use \(...\) for inline math and \[...\] for display math.
document.addEventListener("DOMContentLoaded", function() {
    renderMathInElement(document.body, {
        delimiters: [
            {left: "\\[", right: "\\]", display: true},
            {left: "\\(", right: "\\)", display: false}
        ],
        throwOnError: false
    });
});
