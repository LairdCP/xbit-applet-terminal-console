/* global Terminal */
import { xbit, Button } from './node_modules/xbit-lib/index.js'

const term = new Terminal()
term.open(document.getElementById('terminal'))
let breakDebounce
let eofDebounce

const resizeTerminal = () => {
  // get element by class name
  const terminalViewPort = document.getElementsByClassName('xterm-viewport')[0]
  if (!terminalViewPort) {
    return
  }
  // measure the width of the element
  const terminalWidth = terminalViewPort.offsetWidth
  // measure the height of the element
  const terminalHeight = terminalViewPort.offsetHeight
  // get the number of columns
  term.resize(Math.floor(terminalWidth / 9) - 2, Math.floor(terminalHeight / 17) - 2)
}
resizeTerminal()

window.addEventListener('resize', () => {
  resizeTerminal()
})

term.attachCustomKeyEventHandler((event) => {
  if (event.keyCode === 67 && event.ctrlKey) {
    if (event.repeat || breakDebounce) {
      return false
    }
    breakDebounce = setTimeout(() => {
      breakDebounce = null
    }, 1000)
    sendBreak()
    return false
  } else if (event.keyCode === 68 && event.ctrlKey) {
    if (event.repeat || eofDebounce) {
      return false
    }
    eofDebounce = setTimeout(() => {
      eofDebounce = null
    }, 500)
    sendEof()
    return false
  }
  return true
})

// term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ')
term.onKey(({ key, domEvent }) => {
  console.log('on key', key, domEvent)
  // const printable = !domEvent.altKey && !domEvent.altGraphKey && !domEvent.ctrlKey && !domEvent.metaKey
  // console.log('printable', printable)

  // press enter
  if (domEvent.keyCode === 13) {
    term.write('\r')
  // } else if (domEvent.keyCode === 8) {
  //   // Do not delete the prompt
  //   if (term._core.buffer.x > promptSize) {
  //     term.write('\b \b')
  //   }
  }
  xbit.sendCommand({
    method: 'writeRaw',
    params: {
      data: key
    }
  })
})

term.onData((data) => {
  console.log('on data', data)
  // term.write(data)
})

xbit.addEventListener(function (data) {
  // console.log('on message', data)
  if (data.method === 'rawData') {
    term.write(data.params.data)
  }
})

setTimeout(() => {
  xbit.sendCommand({
    method: 'writeRaw',
    params: {
      data: '\r'
    }
  })
}, 1000)

const sendBreak = () => {
  xbit.sendCommand({
    method: 'writeRaw',
    params: {
      data: '\x03'
    }
  })
}

const sendEof = () => {
  xbit.sendCommand({
    method: 'writeRaw',
    params: {
      data: '\x04'
    }
  })
}

const clear = () => {
  term.clear()
}

const clearButton = new Button('clear-console', 'Clear', clear) // eslint-disable-line no-unused-vars
const sendBreakButton = new Button('send-break', 'Break', sendBreak) // eslint-disable-line no-unused-vars
const sendEofButton = new Button('send-eof', 'EOF', sendEof) // eslint-disable-line no-unused-vars
