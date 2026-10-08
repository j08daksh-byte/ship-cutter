# -*- coding: utf-8 -*-
with open('src/pages/OperationsLivePage.jsx', 'r', encoding='utf-8') as f:
    orig = f.read()

orig = orig.replace('ArrowLeft, ArrowRight', 'ArrowRight')
with open('src/pages/OperationsLivePage.jsx', 'w', encoding='utf-8') as f:
    f.write(orig)
