import subprocess
from react import jsx

def compile_jsx():
    paths = [('assets/jsx/queue.jsx', 'assets/javascripts/queue.js')]

    transformer = jsx.JSXTransformer()
    for jsx_path, js_path in paths:
        transformer.transform(jsx_path, js_path)

def compile_scss():
    subprocess.call(['compass', 'compile'])

def main():
    compile_jsx()
    compile_scss()

if __name__ == '__main__':
    main()
