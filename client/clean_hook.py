# -*- coding: utf-8 -*-
with open('src/hooks/useGatewayStream.js', 'r', encoding='utf-8') as f:
    orig = f.read()

import re
# Cut off anything after `export default function OperationsLivePage`
match = re.search(r'export default function OperationsLivePage', orig)
if match:
    # also strip trailing `};` if it's there
    orig = orig[:match.start()]
    
    # ensure it exports useGatewayStream
    if 'export default useGatewayStream' not in orig:
        orig += "\nexport default useGatewayStream;\n"

with open('src/hooks/useGatewayStream.js', 'w', encoding='utf-8') as f:
    f.write(orig)
print("Cleaned useGatewayStream.js")
