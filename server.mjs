import Discord from 'discord.js'
import Pond from './src/pond.mjs'
import Settings from './settings.mjs'

const discordClient = new Discord.Client()

discordClient.on('ready', () => {
  console.log(`Logged in as ${discordClient.user.tag}!`)
})

discordClient.on('message', async msg => {
  if (msg.content.startsWith('\\lily')) {
    console.log(`Received request from @${msg.author.tag}`)
    msg.channel.startTyping()

    try {
      const image = await Pond.fish(msg.content.substr('\\lily'.length))
      await msg.channel.send({ file: { attachment: image } }) // Removes @author...
      // await reply.react('🗑')
      await msg.react('🌺')
    } catch (e) {
      console.error(e)
      await msg.reply(e)
    } finally {
      msg.channel.stopTyping()
    }
  }
})

discordClient.login(Settings.token).catch(reason => {
  console.log(reason)
  process.exit(-1)
})
