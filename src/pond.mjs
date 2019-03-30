import Settings from './../settings.mjs'
import util from 'util'
import childProcess from 'child_process'
import fs from 'fs-extra'
import path from 'path'
import { tmpdir } from 'os'

const execFile = util.promisify(childProcess.execFile)

const _createInputData = data => {
  data = data.trim()
  if (!data.startsWith('\\version')) {
    data =
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
      data
  }
  return data
}

export default {
  fish: async data => {
    let tmp
    try {
      tmp = await fs.mkdtemp(path.join(tmpdir(), 'lily-'))
      await fs.writeFile(path.join(tmp, 'in.ly'), _createInputData(data))

      // Lilypond has a "jail" mode, which would be very useful for security on an actual server.
      await execFile(Settings.lilypondPath,
        ['-dbackend=eps', '-dno-gs-load-fonts', '-dinclude-eps-fonts', '--png', '-dresolution=300', '--output=out', path.join(tmp, 'in.ly')],
        { cwd: tmp })

      const pngFile = path.join(tmp, 'out.png')
      if (!await fs.exists(pngFile)) {
        throw new Error('The given input generated no output.')
      }

      // Clean up after ourselves. Load the image in memory, then delete the temp dir immediately.
      return await fs.readFile(pngFile)
    } finally {
      if (tmp) {
        await fs.remove(tmp)
      }
    }
  }
}
