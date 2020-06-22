#!/bin/env node
const pandoc = require('node-pandoc');
const fs = require("fs")
const path = require("path")

if (process.argv.length < 4) {
    console.log("[USAGE]: ./gen.js <directory> <format>");
    process.exit(1)
}

(async function() {
    let src = process.argv[2]
    let out_format = process.argv[3]

    const files = await new Promise(((resolve, reject) => {
        fs.readdir(`src/${src}`, (err, files) => {
            if (err) {
                reject(err)
            }

            resolve(files)
        })
    }))

    const exts_to_compile = [".MD", ".md"]

    for (const file of files) {
        const ext = path.extname(file);

        if (exts_to_compile.includes(ext)) {
            const out_dir = `dist/${src}`
            const basename = `${path.basename(file, ext)}`


            let args = `-s -o ${out_dir}/${basename}.${out_format}`

            if(process.env["TOC"]){
                args = `${args} --toc`
            }

            try {
                let res = await new Promise((resolve, reject) => pandoc(`src/${src}/${file}`, args, (err, res) => {
                    if (err) reject(err)
                    resolve(res)
                }))

                if (res) {
                    console.log(`[SUCCESS]: ${file}`)
                }
            } catch (e) {
                console.log(`[ERROR]: ${e}`)
                console.log(`\t executed command: pandoc src/${src}/${file} ${args}`)
            }
        }
    }
})()
