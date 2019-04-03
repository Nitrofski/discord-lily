import Discord from 'discord.js'
import Pond from './src/pond.mjs'
import Settings from './settings.mjs'

const discordClient = new Discord.Client({
  messageCacheLifetime: 600, // Only keep watching messages for 10 minutes
  messageSweepInterval: 60 // Cleanup cache every minute
})

discordClient.on('ready', () => {
  console.log(`Logged in as ${discordClient.user.tag}!`)
})

/**
 * @param msg {Discord.Message}
 * @param regex {RegExp}
 */
async function _processCodeBlocks (msg, regex) {
  let foundLilyInput = false
  let allSuccess = true
  try {
    for (let match; (match = regex.exec(msg.content)) !== null;) {
      if (!foundLilyInput) {
        foundLilyInput = true
        msg.channel.startTyping()
      }

      console.log(`Processing Lily request from @${msg.author.tag}`)
      if (!await _processLilyInput(msg, match.groups.data)) {
        allSuccess = false
      }
    }

    if (foundLilyInput && allSuccess) {
      await msg.react('🌺')
    }

    return foundLilyInput
  } catch (e) {
    await msg.reply('Fatal error when sending reply...')
    console.error(e)
  } finally {
    if (foundLilyInput) {
      msg.channel.stopTyping()
    }
  }
}

/**
 * @param msg {Discord.Message}
 * @param data {String}
 */
async function _processAsSingleInput (msg, data) {
  try {
    msg.channel.startTyping()
    console.log(`Processing Lily request from @${msg.author.tag}`)
    if (await _processLilyInput(msg, data)) {
      await msg.react('🌺')
    }
    msg.channel.stopTyping()
  } catch (e) {
    await msg.reply('Fatal error when sending reply...')
    console.error(e)
  } finally {
    msg.channel.stopTyping()
  }
}

/**
 * @param msg {Discord.Message}
 * @param data {String}
 */
async function _processLilyInput (msg, data) {
  try {
    const image = await Pond.fish(data)
    await msg.channel.send(new Discord.RichEmbed()
      .attachFile({ attachment: image, name: 'lily.png' })
      .setImage('attachment://lily.png')
      .setColor([100, 125, 100]))
    return true
    // await reply.react('🗑')
  } catch (e) {
    let reply = `<@${msg.author.id}>, LilyPond could not parse your input:\`\`\`\n${
      e.message.replace(/```/g, '<triple-backtick>')}\`\`\``
    if (reply.length > 2000) {
      let ellipsis = '[...]'
      reply = reply.substring(0, reply.lastIndexOf('\n', 1997 - ellipsis.length)) + ellipsis + '```'
    }
    await msg.channel.send(reply)
    return false
  }
}

discordClient.on('message', async msg => {
  if (msg.content.startsWith('\\lily')) {
    // First, look for code blocks
    const processed = await _processCodeBlocks(msg, /```(\w+\n)?\n*(?<data>.+?)\n*```/gms)
    // If no code blocks was found, treat the whole message as lily input.
    if (!processed) {
      return _processAsSingleInput(msg, msg.content.substr('\\lily'.length))
    }
  } else {
    return _processCodeBlocks(msg, /```lily\n+(?<data>.+?)\n*```/gms)
  }
})

// discordClient.on('messageDelete', msg => {
//   console.log(msg.content)
// })

// discordClient.on('messageUpdate', (oldMsg, newMsg) => {
//   console.log(newMsg.content)
// })

discordClient.login(Settings.token).catch(reason => {
  console.log(reason)
  process.exit(-1)
})
