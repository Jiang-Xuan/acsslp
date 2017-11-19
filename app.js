const fs = require('fs')
const { exec } = require('child_process')
const nodemailer = require('nodemailer')

/* 随机的ss端口 */
const randomSSPort = Math.round(Math.random() * 1000 + 8000)

/* 随机的kcptun端口 */
const randomKPPort = Math.round(Math.random() * 1000 + 10000)

/* mail config */
const mailUser = '***********'
const mailPass = '***********'
const transporter = nodemailer.createTransport({
    host: 'smtp',
    port: 465,
    secure: true,
    auth: {
        user: mailUser,
        pass: mailPass
    }
})

const mailOptions = {
    from: `"acsslp" <**********>`,
    to: '**********',
    subject: '科学上网服务器更新',
    html: `
        <style>
            code {
                padding: 2px 4px;
                font-size: 90%;
                color: #c7254e;
                background-color: #f9f2f4;
                border-radius: 4px;
            }
        </style>
        <h1>您好, 您的ss服务器监听端口已经更新, 请及时更新您的ss配置文件</h1>
        <p>
            <span>您的ss服务器的监听端口已经动态修改为</span>
            <strong>${randomSSPort}.</strong>
        </p>
        <hr />
        <h1>您好, 您的kcptun服务器监听端口已经更新, 请及时更新您的kcptun配置文件</h1>
        <p>
            <span>您的ss服务器的监听端口已经动态修改为</span>
            <strong>${randomKPPort}.</strong>
        </p>
    `.trim()
}
/* mail config END*/

const ssconfig = `
{
    "server":"0.0.0.0",
    "server_port":${randomSSPort},
    "local_port":1080,
    "password":"986944",
    "timeout":600,
    "method":"aes-256-cfb"
}
`.trimLeft()

const kpconfig = `
{
    "listen": ":${randomKPPort}",
    "target": "127.0.0.1:${randomSSPort}",
    "key": "test",
    "crypt": "salsa20",
    "mode": "fast2",
    "mtu": 1350,
    "sndwnd": 1024,
    "rcvwnd": 1024,
    "datashard": 70,
    "parityshard": 30,
    "dscp": 46,
    "nocomp": false,
    "acknodelay": false,
    "nodelay": 0,
    "interval": 40,
    "resend": 0,
    "nc": 0,
    "sockbuf": 4194304,
    "keepalive": 10,
    "log": "/root/kcptun/kcptun.log"
}
`.trimLeft()

const ssconfigPath = '/etc/shadowsocks.json'
const kpconfigPath = '/root/kcptun/server-config.json'
const supervisorctlRestartSSShell = 'supervisorctl restart shadowsocks'
const supervisorctlRestartKPShell = 'supervisorctl restart kcptun'
const sendMail = (err, info) => {
    if (err) {
        console.log(err)
        return
    }

    console.log(info)
}

fs.writeFileSync(ssconfigPath, ssconfig)

exec(supervisorctlRestartSSShell, (err, stdout, stderr) => {
    mailOptions.html = `
        ${mailOptions.html}
        <hr />

        <h3><code>supervisorctl restart shadowsocks</code>执行结果</h3>
        <p>
            <dl>
                <dt>err</dt>
                <dd><samp>${err}</samp></dd>
                <dt>stdout</dt>
                <dd><samp>${stdout}</samp></dd>
                <dt>stderr</dt>
                <dd><samp>${stderr}</samp></dd>
            </dl>
        </p>
    `

    exec(supervisorctlRestartKPShell, (err, stdout, stderr) => {
        mailOptions.html = `
            ${mailOptions.html}
            <hr />

            <h3><code>supervisorctl restart kcptun</code>执行结果</h3>
            <p>
                <dl>
                    <dt>err</dt>
                    <dd><samp>${err}</samp></dd>
                    <dt>stdout</dt>
                    <dd><samp>${stdout}</samp></dd>
                    <dt>stderr</dt>
                    <dd><samp>${stderr}</samp></dd>
                </dl>
            </p>
        `
        // 发送邮件
        transporter.sendMail(mailOptions, sendMail)
    })

})
