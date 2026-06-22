import os

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update Logo in HTML directly to ensure it never wraps
html = html.replace(
    '<div class="logo" id="nav-logo" style="color: #10b981;">TallerSeguro 🛡️</div>',
    '<div class="logo" id="nav-logo" style="color: #10b981; white-space: nowrap; flex-shrink: 0; font-size: clamp(1rem, 4vw, 1.5rem);">TallerSeguro 🛡️</div>'
)

# 2. Inject forced CSS into <head> to bypass any external stylesheet caching on mobile
forced_css = """
    <style>
        /* INLINE CACHE-BUSTING STYLES FOR MOBILE */
        @media (max-width: 768px) {
            .logo { white-space: nowrap !important; font-size: 1.1rem !important; flex-shrink: 0 !important; display: block !important; }
            .auth-controls { flex-wrap: nowrap !important; gap: 0.25rem !important; display: flex !important; align-items: center !important; }
            #btn-soy-taller, #btn-quiero-probarlo { white-space: nowrap !important; padding: 0.3rem 0.5rem !important; font-size: 0.8rem !important; }
            
            .workshop-card {
                padding: 0.5rem !important;
                gap: 0.25rem !important;
            }
            .workshop-header { margin-bottom: 0 !important; }
            .workshop-rating { margin-bottom: 0.1rem !important; font-size: 0.8rem !important; }
            .workshop-title { font-size: 1.05rem !important; margin: 0 !important; line-height: 1.2 !important; }
            .workshop-attributes { gap: 0 !important; margin-bottom: 0 !important; }
            .workshop-attr { padding: 0.1rem 0 !important; font-size: 0.75rem !important; }
            .workshop-actions { margin-top: 0.25rem !important; gap: 0.25rem !important; }
            .workshop-actions button { padding: 0.25rem !important; font-size: 0.75rem !important; }
        }
    </style>
</head>
"""

if "INLINE CACHE-BUSTING STYLES FOR MOBILE" not in html:
    html = html.replace('</head>', forced_css)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)


print("done injecting forced inline styles")
