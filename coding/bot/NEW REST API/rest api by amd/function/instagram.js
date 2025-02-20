require("../settings.js")
const instagramGetUrl = require("imon-videos-downloader")

async function igdl (url) {
let links = await instagramGetUrl.instagram(url).then((res) => {
return {
status: true, 
creator: global.creator, 
result: res.data
}
}).catch((e) => {
return {
status: false, 
creator: global.creator, 
result: {}
}
})
return links
}

module.exports = { igdl }