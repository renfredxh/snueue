from react import jsx

def compile_jsx():
    paths = [('snueue/assets/javascripts/queue.jsx', 'snueue/assets/javascripts/queue.js')]

    transformer = jsx.JSXTransformer()
    for jsx_path, js_path in paths:
        transformer.transform(jsx_path, js_path)

def main():
    compile_jsx()

if __name__ == '__main__':
    main()
