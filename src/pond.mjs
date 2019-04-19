import Settings from './../settings.mjs'

import childProcess from 'child_process'
import fs from 'fs-extra'
import escapeRegExp from 'lodash.escaperegexp'
import path from 'path'
import util from 'util'

import { tmpdir, EOL } from 'os'

const execFile = util.promisify(childProcess.execFile)

function _createInputData (data) {
  data = data.trim()
  if (!data.startsWith('\\version')) {
    return {
      data:
        '\\version "2.18.2"\n' +
        '\\paper{\n' +
        '  oddHeaderMarkup  = ##f\n' +
        '  evenHeaderMarkup = ##f\n' +
        '  oddFooterMarkup  = ##f\n' +
        '  evenFooterMarkup = ##f\n' +
        '}\n' +
        '\\layout {\n' +
        '  line-width  = 400\\pt\n' +
        '  indent      = #0\n' +
        '  ragged-last = ##t\n' +
        '  \\context {\n' +
        '    \\Score\n' +
        '    \\omit BarNumber\n' +
        '  }\n' +
        '  \\context {\n' +
        '    \\Staff\n' +
        '    \\numericTimeSignature\n' +
        '  }\n' +
        '}\n\n' +
        data,
      addedLinesCount: 21
    }
  }

  return { data: data, addedLinesCount: 0 }
}

/**
 * @param stderr {String}
 * @param inputFilename {String}
 */
function _sanitizeLilypondLog (stderr, inputFilename, addedLinesCount) {
  // The first 2 lines are always "Processing `in.ly`" and "Parsing..." respectively...
  // The last 2 lines should always be "fatal error: failed files: ..." and an empty line...
  let lines = stderr.split(EOL).slice(2, -2)

  const errorDescriptionRegex = new RegExp(
    `^${escapeRegExp(inputFilename.replace(/\\/g, '/'))}:(?<line>\\d+):(?<col>\\d+):(?<msg>.*)`)

  for (let i = 0; i < lines.length; ++i) {
    let match
    if ((match = lines[i].match(errorDescriptionRegex))) {
      lines[i] = `<input>:${match.groups.line - addedLinesCount}:${match.groups.col}:${match.groups.msg}`
    }
  }

  // Join all lines and add a final newline.
  return lines.length > 0
    ? lines.join(EOL) + EOL
    : '< The LilyPond error log provided no useful information... 😞 >'
}

export default {
  /**
   * @param data {String}
   */
  fish: async function (data) {
    let tmp
    try {
      let inputFilename
      let addedLinesCount
      try {
        tmp = await fs.mkdtemp(path.join(tmpdir(), 'lily-'))
        inputFilename = path.join(tmp, 'in.ly')

        const inputData = _createInputData(data)
        addedLinesCount = inputData.addedLinesCount
        await fs.writeFile(inputFilename, inputData.data)
      } catch (e) {
        throw new Error(`Internal server error: ${e.message}`)
      }

      try {
        // Lilypond has a "jail" mode, which would be very useful for security on an actual server.
        await execFile(Settings.lilypondPath,
          ['-dbackend=eps', '-dno-gs-load-fonts', '-dinclude-eps-fonts', '--png', '-dresolution=300', '--output=out', inputFilename],
          { cwd: tmp })
      } catch (e) {
        throw new Error(_sanitizeLilypondLog(e.stderr, inputFilename, addedLinesCount))
      }

      const pngFile = path.join(tmp, 'out.png')
      if (!await fs.exists(pngFile)) {
        throw new Error('The given input generated no output.')
      }

      try {
        // Clean up after ourselves. Load the image in memory, then delete the temp dir immediately.
        return await fs.readFile(pngFile)
      } catch (e) {
        throw new Error(`Internal server error: The output image could not be read.`)
      }
    } finally {
      if (tmp) {
        await fs.remove(tmp)
      }
    }
  }
}
