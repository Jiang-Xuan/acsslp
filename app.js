const fs = require('fs')
const { exec } = require('child_process')
const nodemailer = require('nodemailer')

/* 随机的ss端口 */
const randomPort = Math.round(Math.random() * 1000 + 8000)

/* mail config */
const mailUser = '***********'
const mailPass = '***********'
const transporter = nodemailer.createTransport({
    host: 'smtp',
    port: 465,
    secure: true,
    auth: {
        mailUser,
        mailPass
    }
})

const mailOptions = {
    from: `"acsslp" <**********>`,
    to: '**********',
    subject: 'ss服务器更新',
    html: `
        <h1>您好, 您的ss服务器已经更新, 请及时更新您的ss配置文件</h1>
        <p>
            <span>您的ss服务器的监听端口已经动态修改为</span>
            <strong>${randomPort}.</strong>
        </p>
    `.trim()
}
/* mail config END*/

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
const sendMail = () => {

}

fs.writeFileSync(ssconfigPath, ssconfig)

exec(supervisorctlRestartSSShell, (err, stdout, stderr) => {
    console.log(err, stdout, stderr)
})
