const { ytdlv2, ytmp3, ytmp4, search } = require('@vreden/youtube_scraper')

async function Search(q) {
let list = await search(q)
return list
}

async function YtMp3(url) {
return new Promise(async (resolve, reject) => {
const links = url
try {
const res = await ytdlv2(links)
resolve(res)
} catch (e) {
reject(e) 
}
})
}

async function YtMp4(url) {
return new Promise(async (resolve, reject) => {
const links = url
try {
const res = await ytdlv2(links)
resolve(res)
} catch (e) {
reject(e) 
}
})
}

module.exports = { YtMp3, YtMp4, Search }