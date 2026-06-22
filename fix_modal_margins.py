import os

with open('style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Add a rule for .modal-content h2
new_rule = """
.modal-content h2 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    text-align: center;
}
"""

if '.modal-content h2' not in css:
    css += new_rule

    with open('style.css', 'w', encoding='utf-8') as f:
        f.write(css)

    print("added modal title margins to style.css")
else:
    print("rule already exists")
