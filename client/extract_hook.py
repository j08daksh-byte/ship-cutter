# -*- coding: utf-8 -*-
import os
import re

os.makedirs('src/hooks', exist_ok=True)

with open('src/pages/OperationsLivePage.jsx', 'r', encoding='utf-8') as f:
    live_page_content = f.read()

# Extract the useGatewayStream function
match = re.search(r'// A mock of the gateway data structure for now replaced with REAL SSE integration\s*const useGatewayStream = \(\) => \{.*?\s+return \{.*?\}\s*\};\s*', live_page_content, re.DOTALL)
if match:
    hook_content = match.group(0)
    # Remove from OperationsLivePage.jsx
    live_page_content = live_page_content.replace(hook_content, '')
    
    # Add imports to hook file
    hook_file_content = """import { useState, useEffect, useRef } from 'react';

""" + hook_content + """
export default useGatewayStream;
"""
    
    with open('src/hooks/useGatewayStream.js', 'w', encoding='utf-8') as f:
        f.write(hook_file_content)
        
    # Add import to OperationsLivePage.jsx
    live_page_content = re.sub(
        r'(import \{ DigitalTwin.*?\}\s*from\s*\'@titan/digital-twin\';)',
        r"\1\nimport useGatewayStream from '../hooks/useGatewayStream';",
        live_page_content
    )
    
    with open('src/pages/OperationsLivePage.jsx', 'w', encoding='utf-8') as f:
        f.write(live_page_content)
        
    print('Extracted useGatewayStream successfully.')
else:
    print('Could not find useGatewayStream in OperationsLivePage.jsx')
