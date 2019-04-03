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
  let typing = false
  let attachments = []
  for (let i = 0, match; (match = regex.exec(msg.content)) !== null; ++i) {
    if (i === 0) {
      typing = true
      msg.channel.startTyping()
    }

    console.log(`Processing Lily request from @${msg.author.tag}`)
    const image = await _processLilyInput(msg, match.groups.data)
    if (image) {
      attachments.push(new Discord.Attachment(image, `lily${(i + 1).toString().padStart(2, '0')}.png`))
    }
  }

  try {
    if (attachments.length !== 0) {
      if (attachments.length === 1) {
        await msg.channel.send(new Discord.RichEmbed()
          .attachFile(attachments[0])
          .setImage('attachment://lily01.png')
          .setColor([100, 125, 100]))
      } else {
        await msg.channel.send({ files: attachments })
      }
      await msg.react('🌺')
      return true
    }
  } catch (e) {
    await msg.reply('Fatal error when sending reply...')
    console.error(e)
  } finally {
    if (typing) {
      msg.channel.stopTyping()
    }
  }

  return false
}

/**
 * @param msg {Discord.Message}
 * @param data {String}
 */
async function _processAsSingleInput (msg, data) {
  try {
    msg.channel.startTyping()
    console.log(`Processing Lily request from @${msg.author.tag}`)
    const image = await _processLilyInput(msg, data)
    if (image) {
      await msg.channel.send(new Discord.RichEmbed()
        .attachFile({ attachment: image, name: 'lily.png' })
        .setImage('attachment://lily.png')
        .setColor([100, 125, 100]))
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
    return await Pond.fish(data)
    // await reply.react('🗑')
  } catch (e) {
    console.error(e)
    let reply = `<@${msg.author.id}>, LilyPond could not parse your input:\`\`\`\n${
      e.message.replace(/```/g, '<triple-backtick>')}\`\`\``
    if (reply.length > 2000) {
      let ellipsis = '[...]'
      reply = reply.substring(0, reply.lastIndexOf('\n', 1997 - ellipsis.length)) + ellipsis + '```'
    }
    await msg.channel.send(reply)
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

discordClient.on('messageDelete', msg => {
  console.log(msg.content)
})

discordClient.on('messageUpdate', (oldMsg, newMsg) => {
  console.log(newMsg.content)
})

discordClient.login(Settings.token).catch(reason => {
  console.log(reason)
  process.exit(-1)
})
