// Language configuration for exekute.
// Each entry defines how to build and run code for a given language.

const languages = {
  javascript: {
    id: 'javascript',
    name: 'JavaScript',
    extension: 'js',
    image: 'exekute-node',
    command: ['node', '/code/main.js'],
    monacoId: 'javascript',
  },
  python: {
    id: 'python',
    name: 'Python',
    extension: 'py',
    image: 'exekute-python',
    command: ['python3', '/code/main.py'],
    monacoId: 'python',
  },
  java: {
    id: 'java',
    name: 'Java',
    extension: 'java',
    image: 'exekute-java',
    command: ['sh', '-c', 'javac /code/Main.java && java -cp /code Main'],
    monacoId: 'java',
    filename: 'Main.java',
  },
  c: {
    id: 'c',
    name: 'C',
    extension: 'c',
    image: 'exekute-gcc',
    command: ['sh', '-c', 'gcc /code/main.c -o /code/main && /code/main'],
    monacoId: 'c',
  },
  cpp: {
    id: 'cpp',
    name: 'C++',
    extension: 'cpp',
    image: 'exekute-gcc',
    command: ['sh', '-c', 'g++ /code/main.cpp -o /code/main && /code/main'],
    monacoId: 'cpp',
  },
};

module.exports = languages;
