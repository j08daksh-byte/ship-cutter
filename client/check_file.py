# -*- coding: utf-8 -*-
with open('src/pages/OperationsLivePage.jsx', 'r', encoding='utf-8') as f:
    orig = f.read()

lines = orig.split('\n')
print("--- HEAD ---")
print('\n'.join(lines[:30]))
print("--- TAIL ---")
print('\n'.join(lines[-30:]))
