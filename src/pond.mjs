import Settings from './../settings.mjs'
import util from 'util'
import childProcess from 'child_process'
import fs from 'fs'
import path from 'path'
import { tmpdir } from 'os'

const fsp = fs.promises
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
      '  line-width  = 600\\pt\n' +
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
    try {
      const tmp = await fsp.mkdtemp(path.join(tmpdir(), 'lily-'))
      await fsp.writeFile(path.join(tmp, 'in.ly'), _createInputData(data))

      // Lilypond has a "jail" mode, which would be very useful for security on an actual server.
      await execFile(Settings.lilypondPath,
        ['-dbackend=eps', '-dno-gs-load-fonts', '-dinclude-eps-fonts', '--png', '-dresolution=240', '--output=out', path.join(tmp, 'in.ly')],
        { cwd: tmp })

      // Clean up after ourselves. Load the image in memory, then delete the temp dir immediately.
      const image = fsp.readFile(path.join(tmp, 'out.png'))
      // await fsp.rmdir(tmp)

      return image
    } catch (e) {
      console.error(e)
      throw e
    }
  }
}
