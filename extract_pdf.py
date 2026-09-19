import fitz  
doc = fitz.open(r'C:\Users\USER\.local\share\opencode\tool-output\tool_0aea7df73001VEZ8JmHKEjl0uk')  
for i, page in enumerate(doc):  
    text = page.get_text()  
    print(f'--- PAGE {i+1} ---')  
    print(text)  
