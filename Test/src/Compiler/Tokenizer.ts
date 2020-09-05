const keywords = /^(use|const)/
const op = /^[+\-*\/]/
const ident = /^([a-zA-Z]([_a-zA-Z0-9])*)/

const parsers = {keywords, op, ident}

class Token {
    constructor(public tkType: string, public src: string, public startIndex: number) {
    }
}

class Option<T> {
    constructor(public val: T | undefined) {
    }

    public has_value = () => this.val !== undefined

    static make = <T>(val: T | undefined) => new Option(val)
    static Nothing = new Option(undefined)
}

export class Tokenizer {
    private mIndex = 0;

    constructor(public src: string) {
    }


    public next = (): Option<Token> => {
        for(let tkType in parsers) {
            const tkParser: RegExp = parsers[tkType]

            const res = tkParser.exec(this.src.slice(this.mIndex))
            if(res.length > 0) {
                this.mIndex += res[0].length

                return Option.make(
                    new Token(tkType, res[0], this.mIndex - res[0].length)
                )
            }
        }

        return Option.Nothing
    }

}
