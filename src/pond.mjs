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
      '  indent=#0\n' +
      '  line-width=120\\mm\n' +
      '  oddFooterMarkup=##f\n' +
      '  oddHeaderMarkup=##f\n' +
      '  bookTitleMarkup = ##f\n' +
      '  scoreTitleMarkup = ##f\n' +
      '}\n' +
      '\\layout {\n' +
      '  \\context { \\Staff \\numericTimeSignature }\n' +
      '}\n\n' +
      data
  }
  return data
}

export default {
  fish: async data => {
    try {
      const tmp = await fsp.mkdtemp(path.join(tmpdir(), 'lily-'))
      console.log(`Tmp dir: ${tmp}`)
      await fsp.writeFile(path.join(tmp, 'in.ly'), _createInputData(data))

      // Lilypond has a "jail" mode, which would be very useful for security on an actual server.
      await execFile(Settings.lilypondPath,
        ['-dbackend=eps', '-dno-gs-load-fonts', '-dinclude-eps-fonts', '--png', '--output=out', path.join(tmp, 'in.ly')],
        { cwd: tmp })

      // Clean up after ourselves. Load the image in memory, then delete it immediately.
      const image = fsp.readFile(path.join(tmp, 'out.png'))
      fsp.rmdir(tmp)

      return image
    } catch (e) {
      console.error(e)
      throw e
    }
  }
}
