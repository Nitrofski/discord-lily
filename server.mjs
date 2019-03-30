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

const _processCodeBlocks = async (msg, regex) => {
  let match
  let matched = false
  while ((match = regex.exec(msg.content)) !== null) {
    await _processLilyInput(msg, match.groups.data)
    matched = true
  }

  return matched
}

const _processLilyInput = async (msg, data) => {
  console.log(`Received Lily request from @${msg.author.tag}`)
  msg.channel.startTyping()

  try {
    const image = await Pond.fish(data)
    await msg.channel.send(new Discord.RichEmbed()
      .attachFile({ attachment: image, name: 'lily.png' })
      .setImage('attachment://lily.png')
      .setColor([100, 125, 100]))
    // await reply.react('🗑')
    await msg.react('🌺')
  } catch (e) {
    console.error(e)
    let reply = `<@${msg.author.id}>, there was an error when parsing the input:\`\`\`\n${
      e.message.replace(/```/g, '<triple-backtick>')}\`\`\``
    if (reply.length > 2000) {
      let ellipsis = '[...]'
      reply = reply.substring(0, reply.lastIndexOf('\n', 1997 - ellipsis.length)) + ellipsis + '```'
    }
    await msg.channel.send(reply)
  } finally {
    msg.channel.stopTyping()
  }
}

discordClient.on('message', async msg => {
  if (msg.content.startsWith('\\lily')) {
    // First, look for code blocks
    const matched = await _processCodeBlocks(msg, /```(\w+\n)?\n*(?<data>.+?)\n*```/gms)
    // If no code blocks was found, treat the whole message as lily input.
    if (!matched) {
      return _processLilyInput(msg, msg.content.substr('\\lily'.length))
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
