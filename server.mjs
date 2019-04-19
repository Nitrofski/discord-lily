import Pond from './src/pond.mjs'
import Settings from './settings.mjs'

import Discord from 'discord.js'
import imgurUpload from 'imgur-uploader'

const discordClient = new Discord.Client({
  messageCacheLifetime: 600, // Only keep watching messages for 10 minutes
  messageSweepInterval: 60 // Cleanup cache every minute
})

/** @type {Object.<string, [Discord.Message]>} */
const messageReplies = {}

discordClient.on('ready', () => {
  console.log(`Logged in as ${discordClient.user.tag}!`)
})

/**
 * @callback HandleReplyCallback
 * @param content
 * @returns {Promise<Discord.Message>}
 */

/**
 * @param {Discord.Message} msg
 * @param {string|RegExp} languageRegex
 * @param {HandleReplyCallback} handleReply
 */
async function _processCodeBlocks (msg, languageRegex, handleReply) {
  languageRegex = languageRegex.source || languageRegex
  const codeBlockRegex = new RegExp('```' + languageRegex + '\\n*(?<data>.+?)\\n*```', 'gms')

  let allSuccess = true
  const replies = []
  try {
    for (let match; (match = codeBlockRegex.exec(msg.content)) !== null;) {
      if (replies.length === 0) {
        msg.channel.startTyping()
      }

      console.log(`Processing Lily request from @${msg.author.tag}`)
      const { success, reply } = await _processLilyInput(msg, match.groups.data, handleReply)
      replies.push(reply)
      if (!success) {
        allSuccess = false
      }
    }

    if (replies.length > 0 && allSuccess) {
      await msg.react('🌺')
    }

    return replies.length
  } catch (e) {
    await msg.reply('Fatal error when sending reply...')
    console.error(e)
  } finally {
    if (replies.length > 0) {
      msg.channel.stopTyping()
      messageReplies[msg.id] = replies
    }
  }
}

/**
 * @param {Discord.Message} msg
 * @param {String} data
 * @param {HandleReplyCallback} handleReply
 */
async function _processAsSingleInput (msg, data, handleReply) {
  try {
    msg.channel.startTyping()
    console.log(`Processing Lily request from @${msg.author.tag}`)
    const { success, reply } = await _processLilyInput(msg, data, handleReply)
    if (success) {
      await msg.react('🌺')
    }
    msg.channel.stopTyping()

    // Watch the received message for a while.
    messageReplies[msg.id] = [reply]
  } catch (e) {
    await msg.reply('Fatal error when sending reply...')
    console.error(e)
  } finally {
    msg.channel.stopTyping()
  }
}

/**
 * @param {Discord.Message} msg
 * @param {String} data
 * @param {HandleReplyCallback} handleReply
 * @returns {{success: boolean, reply: Discord.Message}}
 */
async function _processLilyInput (msg, data, handleReply) {
  try {
    const image = await Pond.fish(data)
    const imageUrl = (await imgurUpload(image)).link
    return {
      success: true,
      reply: await handleReply(
        new Discord.RichEmbed()
          .setImage(imageUrl)
          .setColor([100, 125, 100]))
    }
    // await reply.react('🗑')
  } catch (e) {
    let reply = `<@${msg.author.id}>, LilyPond could not parse your input:\n\`\`\`\n${
      e.message.replace(/```/g, '<triple-backtick>')}\`\`\``
    if (reply.length > 2000) {
      let ellipsis = '[...]'
      reply = reply.substring(0, reply.lastIndexOf('\n', 1997 - ellipsis.length)) + ellipsis + '```'
    }
    return {
      success: false,
      reply: await handleReply(reply)
    }
  }
}

/**
 * @param {Discord.Message} msg
 * @param {HandleReplyCallback} handleReplyCallback
 */
async function _handleMessage (msg, handleReplyCallback) {
  if (/^\\lilylick(\s|$)/.test(msg.content)) {
    return _processAsSingleInput(msg, "\\relative c' { d8 e f g e4 c8 d~ d1 }", handleReplyCallback)
  } else if (/^\\lily(\s|$)/.test(msg.content)) {
    // First, look for code blocks
    const processed = await _processCodeBlocks(msg, /(\w+\n)?/, handleReplyCallback)
    // If no code blocks was found, treat the whole message as lily input.
    if (!processed) {
      return _processAsSingleInput(msg, msg.content.substr('\\lily'.length), handleReplyCallback)
    }
  } else {
    return _processCodeBlocks(msg, /lily\n/, handleReplyCallback)
  }
}

// Upon receiving a new message:
discordClient.on('message', async msg => {
  await _handleMessage(msg, content => msg.channel.send(content))
})

// Upon deletion of a message in our cache:
discordClient.on('messageDelete', async msg => {
  if (messageReplies[msg.id]) {
    console.log(`Deleting message ${messageReplies[msg.id].id} after ${msg.id} was deleted...`)
    for (const reply of messageReplies[msg.id]) {
      await reply.delete()
    }
    delete messageReplies[msg.id]
  }
})

// Upon update of a message in our cache:
discordClient.on('messageUpdate', async (oldMsg, newMsg) => {
  if (messageReplies[oldMsg.id]) {
    console.log('A watched message was modified.')
    console.log(`oldMsg.id: ${oldMsg.id} | oldMsg.nonce: ${oldMsg.nonce}`)
    console.log(`newMsg.id: ${newMsg.id} | newMsg.nonce: ${newMsg.nonce}`)

    const oldReplies = messageReplies[oldMsg.id]
    delete messageReplies[oldMsg.id]

    await _handleMessage(newMsg, content => {
      console.log(`${oldReplies.length} left to replace.`)
      let reply = oldReplies.shift()
      if (reply) {
        console.log('Replacing most recent message.')
        console.log(`Existing attachments: ${reply.attachments} (${reply.attachments.size})`)
        console.log(`Embed: ${reply.embeds} (${reply.embeds.length})`)

        return reply.edit(content)
      } else {
        console.log('Sending new message.')
        return newMsg.channel.send(content)
      }
    })

    for (const remainingReply of oldReplies) {
      await remainingReply.delete()
    }

    // console.log('Deleting associated replies.')
    // await Promise.all(oldReplies.map(reply => reply.delete()))

    // await _handleMessage(newMsg, content => {
    //   console.log('Sending new message.')
    //   return newMsg.channel.send(content)
    // })
  }
})

discordClient.login(Settings.token).catch(reason => {
  console.log(reason)
  process.exit(-1)
})
