const path = require('path')
const { exec } = require('child_process')
const nodemailer = require('nodemailer')

/* 随机的ss端口 */
const randomPort = Math.round(Math.random() * 1000 + 8000)

const ssconfig = `
{
    "server":"0.0.0.0",
    "server_port":${randomPort},
    "local_port":1080,
    "password":"986944",
    "timeout":600,
    "method":"aes-256-cfb"
}
`.trim()

const ssconfigPath = '/etc/shadowsocks.json'
const supervisorctlRestartSSShell = 'supervisorctl restart shadowsocks'

path.writeFileSync(ssconfigPath, ssconfig)

exec(supervisorctlRestartSSShell, (err, stdout, stderr) => {
    console.log(err, stdout, stderr)
})