/* global Terminal */
import { xbit, Button } from '@bennybtl/xbit-lib/dist/xbit.js'
import { Terminal } from 'xterm'
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
  if (event.key === 'c' && event.ctrlKey) {
    if (event.repeat || breakDebounce) {
      return false
    }
    breakDebounce = setTimeout(() => {
      breakDebounce = null
    }, 1000)
    sendBreak()
    return false
  } else if (event.key === 'd' && event.ctrlKey) {
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

term.onKey(({ key, domEvent }) => {

  // press enter
  if (domEvent.key === 'Enter') {
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
  // console.log('on data', data)
  // term.write(data)
})

xbit.addEventListener('rawData', function (data) {
  console.log('applet terminal: on message', data)
  term.write(data.params.data)
})

setTimeout(async () => {
  const result = await xbit.sendCommand({
    method: 'getSelectedPort'
  })

  if (result.selected === 'None' && result.connected === false) {
    return
  }

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
